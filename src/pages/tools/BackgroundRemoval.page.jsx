import { useCallback, useEffect, useMemo, useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import rawImages from 'virtual:raw-images';

const initialStatus = Object.fromEntries(
  rawImages.map(filename => [filename, { status: 'pending', error: null, url: null }]),
);

function pngFilename(filename) {
  return filename.replace(/\.[^.]+$/, '.png');
}

async function convertToPng(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load image (${response.status})`);
  }

  const sourceBlob = await response.blob();
  const sourceUrl = URL.createObjectURL(sourceBlob);

  try {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Unable to convert image to PNG'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function downloadUrl(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function BackgroundRemovalPage() {
  const allowed = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const [items, setItems] = useState(initialStatus);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      window.location.replace('/');
    }
  }, []);

  const updateItem = useCallback((filename, update) => {
    setItems(previous => ({
      ...previous,
      [filename]: { ...previous[filename], ...update },
    }));
  }, []);

  const processImage = useCallback(async filename => {
    updateItem(filename, { status: 'processing', error: null });
    try {
      const sourceUrl = `/images/raw/${encodeURIComponent(filename)}`;
      const pngBlob = await convertToPng(sourceUrl);
      const result = await removeBackground(pngBlob);
      const blob = result instanceof Blob ? result : await fetch(result).then(response => response.blob());
      updateItem(filename, { status: 'done', url: URL.createObjectURL(blob) });
    } catch (error) {
      updateItem(filename, { status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  }, [updateItem]);

  useEffect(() => {
    if (!allowed) return undefined;
    let cancelled = false;

    async function processSequentially() {
      for (const filename of rawImages) {
        if (cancelled) return;
        await processImage(filename);
      }
    }

    processSequentially();
    return () => { cancelled = true; };
  }, [allowed, processImage]);

  const completed = useMemo(
    () => rawImages.filter(filename => ['done', 'error'].includes(items[filename]?.status)).length,
    [items],
  );
  const allDone = rawImages.length > 0 && completed === rawImages.length && rawImages.every(filename => items[filename]?.status === 'done');

  const downloadAll = async () => {
    for (const filename of rawImages) {
      downloadUrl(items[filename].url, pngFilename(filename));
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  };

  if (!allowed) return null;

  return (
    <main style={styles.page}>
      <h1>Background removal utility</h1>
      <p>Local development only. Images are processed one at a time in your browser.</p>
      <div style={styles.toolbar}>
        <strong>{completed} / {rawImages.length} complete</strong>
        <button type="button" disabled={!allDone} onClick={downloadAll}>Download All</button>
      </div>
      {rawImages.length === 0 && <p>No files found in <code>/public/images/raw/</code>.</p>}
      <section style={styles.list}>
        {rawImages.map(filename => {
          const item = items[filename];
          return (
            <article key={filename} style={styles.card}>
              <div style={styles.images}>
                <div><small>Original</small><img src={`/images/raw/${encodeURIComponent(filename)}`} alt={filename} width={"100%"} /></div>
                <div><small>Processed</small>{item.url ? <img src={item.url} alt={`${filename} with background removed`} width={"100%"} /> : <div style={styles.placeholder}>No result</div>}</div>
              </div>
              <div style={styles.details}>
                <strong>{filename}</strong>
                <span>Status: {item.status}</span>
                {item.error && <span style={styles.error}>{item.error}</span>}
                {item.status === 'done' && <button type="button" onClick={() => downloadUrl(item.url, pngFilename(filename))}>Download PNG</button>}
                {item.status === 'error' && <button type="button" onClick={() => processImage(filename)}>Retry</button>}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif', color: '#202124' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', padding: 16, background: '#f1f3f4', borderRadius: 8 },
  list: { display: 'grid', gap: 16 },
  card: { display: 'flex', gap: 20, padding: 16, border: '1px solid #dadce0', borderRadius: 8 },
  images: { display: 'flex', gap: 16 },
  details: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 },
  placeholder: { width: 180, height: 120, display: 'grid', placeItems: 'center', background: '#f8f9fa', color: '#5f6368' },
  error: { color: '#b3261e', overflowWrap: 'anywhere' },
};
