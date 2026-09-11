import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCities } from '../../context/CitiesContext';

// ---------------------------------------------------------------------------
// Styles — mirrors the dark theme used in ListView and DetailView
// ---------------------------------------------------------------------------

const S = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
    background: '#111213',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#1a1c1f',
    borderBottom: '1px solid #2e3238',
    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
    flexShrink: 0,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    padding: 0,
    border: '1px solid #3a3f47',
    borderRadius: '6px',
    background: '#22252a',
    color: '#e8eaed',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
  },
  toolbarTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#e8eaed',
  },
  toolbarCount: {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#8b9098',
  },
  body: {
    flex: 1,
    padding: '24px',
    maxWidth: '960px',
    width: '100%',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#8b9098',
    fontSize: '14px',
  },
  emptyStateHeading: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#c9cdd4',
  },
  card: {
    background: '#1a1c1f',
    borderRadius: '10px',
    border: '1px solid #2e3238',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImage: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    display: 'block',
    background: '#22252a',
  },
  cardBody: {
    padding: '12px 14px 14px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardCity: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#e8eaed',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardCountry: {
    margin: 0,
    fontSize: '12px',
    color: '#8b9098',
  },
  cardMeta: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#8b9098',
  },
  cardLink: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#4da3ff',
    textDecoration: 'none',
    fontWeight: '600',
  },
  giftBadge: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '4px',
    background: '#1a3a6e',
    color: '#4da3ff',
    border: '1px solid #1a6edb',
  },
};

// ---------------------------------------------------------------------------
// MagnetCard — single magnet within the city view
// ---------------------------------------------------------------------------

function MagnetCard({ city, magnet }) {
  const detailPath = `/location/${city.city.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <article style={S.card}>
      <img
        style={S.cardImage}
        src={magnet.srcImg}
        alt={`${city.city} magnet`}
        loading="lazy"
        onError={e => {
          e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(city.city)}/480/300`;
        }}
      />
      <div style={S.cardBody}>
        <p style={S.cardCity}>{city.city}</p>
        <p style={S.cardCountry}>
          {city.country === 'USA'
            ? `${city.state}, USA`
            : `${city.state && ","} ${city.country}`}
        </p>
        <p style={S.cardMeta}>👥 {city.population}</p>
        {magnet.gift === true && (
          <span style={S.giftBadge}>🎁 Gift</span>
        )}
        <Link to={detailPath} state={{...city, srcImg: magnet.srcImg}} style={S.cardLink}>
          View details →
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// CityView — shows all magnets that belong to the selected city
// ---------------------------------------------------------------------------

export const CityView = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const allCities = useCities();

  // Derive a display name from the slug while the data loads
  const slugToName = citySlug.replace(/-/g, ' ');

  const matchingCity = React.useMemo(
    () => allCities.find(c => c.city.toLowerCase().replace(/\s+/g, '-') === citySlug) ?? null,
    [allCities, citySlug]
  );

  const cityName = matchingCity ? matchingCity.city : slugToName;
  const magnets = matchingCity?.magnets ?? [];

  return (
    <div style={S.page}>
      {/* ── Toolbar ── */}
      <div style={S.toolbar}>
        <button
          style={S.backButton}
          type="button"
          title="Back to list"
          aria-label="Back to list"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <h1 style={S.toolbarTitle}>{cityName}</h1>
        {magnets.length > 0 && (
          <span style={S.toolbarCount}>
            {magnets.length} magnet{magnets.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={S.body}>
        {magnets.length === 0 ? (
          <div style={S.emptyState}>
            <p style={S.emptyStateHeading}>No magnets found</p>
            <p>
              There are no magnets for &ldquo;{cityName}&rdquo; in the
              collection yet.
            </p>
          </div>
        ) : (
          <div style={S.grid}>
            {magnets.map((magnet, index) => (
              <MagnetCard key={`${citySlug}-${index}`} city={matchingCity} magnet={magnet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
