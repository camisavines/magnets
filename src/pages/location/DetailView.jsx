import * as React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CITIES from '../home/cities.json';

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '29px',
    height: '29px',
    padding: 0,
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  body: {
    flex: 1,
    padding: '24px',
    maxWidth: '680px',
    width: '100%',
    margin: '0 auto',
  },
  card: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    display: 'block',
  },
  cardBody: {
    padding: '20px 24px',
  },
  cityHeading: {
    margin: '0 0 4px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stateLabel: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#666',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e0e0e0',
    margin: '16px 0',
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#333',
  },
  label: {
    fontWeight: '600',
    minWidth: '120px',
    color: '#555',
  },
  value: {
    color: '#1a1a1a',
  },
  link: {
    color: '#1a73e8',
    textDecoration: 'none',
  },
  status: {
    padding: '40px 24px',
    textAlign: 'center',
    fontSize: '15px',
    color: '#666',
  },
  errorText: {
    color: '#c0392b',
  },
};

export const DetailView = () => {
  const { id } = useParams();
  const { state: routeState } = useLocation();
  const navigate = useNavigate();

  const [city, setCity] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Prefer state passed via navigation; fall back to looking up by the URL slug.
    if (routeState?.city) {
      setCity(routeState);
      setLoading(false);
      return;
    }

    const match = CITIES.find(
      (c) => c.city.toLowerCase().replace(/\s+/g, '-') === id
    );

    if (match) {
      setCity(match);
    } else {
      setError(`No location found for "${id}".`);
    }
    setLoading(false);
  }, [id, routeState]);

  const handleBack = () => navigate(-1);

  return (
    <div style={styles.page}>
      <div style={styles.toolbar}>
        <button
          style={styles.backButton}
          type="button"
          title="Go back"
          aria-label="Go back"
          onClick={handleBack}
        >
          ←
        </button>
        <h1 style={styles.title}>
          {city ? `${city.city}, ${city.state}` : 'Location Detail'}
        </h1>
      </div>

      <div style={styles.body}>
        {loading && (
          <p style={styles.status}>Loading…</p>
        )}

        {!loading && error && (
          <p style={{ ...styles.status, ...styles.errorText }}>{error}</p>
        )}

        {!loading && city && (
          <div style={styles.card}>
            <img
              style={styles.image}
              src={city.image}
              alt={`${city.city} skyline`}
            />
            <div style={styles.cardBody}>
              <h2 style={styles.cityHeading}>{city.city}</h2>
              <p style={styles.stateLabel}>{city.state}</p>

              <hr style={styles.divider} />

              <div style={styles.row}>
                <span style={styles.label}>Population</span>
                <span style={styles.value}>{city.population}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Latitude</span>
                <span style={styles.value}>{city.latitude}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Longitude</span>
                <span style={styles.value}>{city.longitude}</span>
              </div>

              <hr style={styles.divider} />

              <div style={styles.row}>
                <span style={styles.label}>Wikipedia</span>
                <a
                  style={styles.link}
                  href={`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${city.city}, ${city.state}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {city.city} on Wikipedia ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
