import * as React from 'react';
import {useState, useMemo, useCallback} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import CITIES from '../home/cities.json';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a population string like "1,234,567" → 1234567 */
function parsePopulation(str = '') {
  return parseInt(str.replace(/,/g, ''), 10) || 0;
}

const POPULATION_RANGES = [
  {label: 'Any', min: 0, max: Infinity},
  {label: 'Under 100 K', min: 0, max: 100_000},
  {label: '100 K – 500 K', min: 100_000, max: 500_000},
  {label: '500 K – 1 M', min: 500_000, max: 1_000_000},
  {label: '1 M – 5 M', min: 1_000_000, max: 5_000_000},
  {label: 'Over 5 M', min: 5_000_000, max: Infinity},
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const S = {
  /* Root */
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
    background: '#f0f2f5',
  },

  /* Top toolbar */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    zIndex: 10,
    flexShrink: 0,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    padding: 0,
    border: '1px solid rgba(0,0,0,0.18)',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
  },
  toolbarTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  toolbarCount: {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#666',
  },

  /* Two-column body */
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  /* ── Sidebar ── */
  sidebar: {
    width: '25%',
    minWidth: '220px',
    maxWidth: '320px',
    background: '#fff',
    borderRight: '1px solid #e0e0e0',
    overflowY: 'auto',
    padding: '20px 16px',
    flexShrink: 0,
  },
  sidebarHeading: {
    margin: '0 0 16px',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#888',
  },
  filterSection: {
    marginBottom: '24px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  searchInput: {
    width: '100%',
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    background: '#fafafa',
    color: '#1a1a1a',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#333',
    userSelect: 'none',
    cursor: 'pointer',
  },
  radioRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
    cursor: 'pointer',
  },
  radioLabel: {
    fontSize: '13px',
    color: '#333',
    userSelect: 'none',
    cursor: 'pointer',
  },
  resetButton: {
    marginTop: '4px',
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a73e8',
    background: 'transparent',
    border: '1px solid #1a73e8',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #ebebeb',
    margin: '0 0 24px',
  },

  /* ── Card area ── */
  cardArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#888',
    fontSize: '14px',
  },

  /* ── Card ── */
  card: {
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e8e8e8',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    display: 'block',
    background: '#e0e0e0',
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
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardCountry: {
    margin: 0,
    fontSize: '12px',
    color: '#777',
  },
  cardMeta: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#555',
  },
  cardLink: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ListView = () => {
  const navigate = useNavigate();

  /* Derive sorted unique countries & states from the dataset */
  const allCountries = useMemo(
    () => [...new Set(CITIES.map(c => c.country))].sort(),
    []
  );
  const allStates = useMemo(
    () => [...new Set(CITIES.map(c => c.state))].sort(),
    []
  );

  /* Filter state */
  const [searchText, setSearchText] = useState('');
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [selectedStates, setSelectedStates] = useState(new Set());
  const [popRangeIndex, setPopRangeIndex] = useState(0); // 0 = "Any"

  const toggleSet = useCallback((setter, value) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchText('');
    setSelectedCountries(new Set());
    setSelectedStates(new Set());
    setPopRangeIndex(0);
  }, []);

  /* Filtered cities */
  const filtered = useMemo(() => {
    const range = POPULATION_RANGES[popRangeIndex];
    const search = searchText.trim().toLowerCase();

    return CITIES.filter(city => {
      if (search && !city.city.toLowerCase().includes(search)) return false;
      if (selectedCountries.size > 0 && !selectedCountries.has(city.country)) return false;
      if (selectedStates.size > 0 && !selectedStates.has(city.state)) return false;
      const pop = parsePopulation(city.population);
      if (pop < range.min || pop >= range.max) return false;
      return true;
    });
  }, [searchText, selectedCountries, selectedStates, popRangeIndex]);

  const hasActiveFilters =
    searchText.trim() !== '' ||
    selectedCountries.size > 0 ||
    selectedStates.size > 0 ||
    popRangeIndex !== 0;

  return (
    <div style={S.page}>
      {/* ── Top toolbar ── */}
      <div style={S.toolbar}>
        <button
          style={S.backButton}
          type="button"
          title="Back to Map"
          aria-label="Back to Map"
          onClick={() => navigate('/')}
        >
          ←
        </button>
        <h1 style={S.toolbarTitle}>Cities</h1>
        <span style={S.toolbarCount}>
          {filtered.length} of {CITIES.length} cities
        </span>
      </div>

      {/* ── Two-column body ── */}
      <div style={S.body} className="lv-body">
        {/* ── Sidebar ── */}
        <aside style={S.sidebar} className="lv-sidebar" aria-label="Filter panel">
          <p style={S.sidebarHeading}>Filters</p>

          {/* Search */}
          <div style={S.filterSection}>
            <label style={S.filterLabel} htmlFor="city-search">City name</label>
            <input
              id="city-search"
              type="search"
              placeholder="Search…"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={S.searchInput}
            />
          </div>

          <hr style={S.divider} />

          {/* Population range */}
          <div style={S.filterSection}>
            <span style={S.filterLabel}>Population</span>
            {POPULATION_RANGES.map((range, i) => (
              <label key={range.label} style={S.radioRow}>
                <input
                  type="radio"
                  name="pop-range"
                  checked={popRangeIndex === i}
                  onChange={() => setPopRangeIndex(i)}
                />
                <span style={S.radioLabel}>{range.label}</span>
              </label>
            ))}
          </div>

          <hr style={S.divider} />

          {/* Country */}
          <div style={S.filterSection}>
            <span style={S.filterLabel}>Country</span>
            {allCountries.map(country => (
              <label key={country} style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selectedCountries.has(country)}
                  onChange={() => toggleSet(setSelectedCountries, country)}
                />
                <span style={S.checkboxLabel}>{country}</span>
              </label>
            ))}
          </div>

          <hr style={S.divider} />

          {/* State / Region */}
          <div style={S.filterSection}>
            <span style={S.filterLabel}>State / Region</span>
            {allStates.map(state => (
              <label key={state} style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={selectedStates.has(state)}
                  onChange={() => toggleSet(setSelectedStates, state)}
                />
                <span style={S.checkboxLabel}>{state}</span>
              </label>
            ))}
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button style={S.resetButton} type="button" onClick={resetFilters}>
              ✕ Reset filters
            </button>
          )}
        </aside>

        {/* ── Card grid ── */}
        <main style={S.cardArea}>
          {filtered.length === 0 ? (
            <div style={S.emptyState}>
              <p>No cities match the selected filters.</p>
              <button style={S.resetButton} type="button" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          ) : (
            <div style={S.grid} className="lv-grid">
              {filtered.map((city, index) => (
                <CityCard key={`${city.city}-${index}`} city={city} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Responsive: stack sidebar on small screens */}
      <style>{`
        @media (max-width: 640px) {
          /* The body flex container becomes a column */
          .lv-body { flex-direction: column !important; }
          /* Sidebar goes full-width and auto height */
          .lv-sidebar {
            width: 100% !important;
            max-width: 100% !important;
            min-width: unset !important;
            border-right: none !important;
            border-bottom: 1px solid #e0e0e0 !important;
            max-height: 340px;
          }
          /* Cards single column */
          .lv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CityCard
// ---------------------------------------------------------------------------

function CityCard({city}) {
  const detailPath = `/location/${city.city.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <article style={S.card}>
      <img
        style={S.cardImage}
        src={city.image}
        alt={`${city.city} skyline`}
        loading="lazy"
        onError={e => {
          e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(city.city)}/480/300`;
        }}
      />
      <div style={S.cardBody}>
        <p style={S.cardCity}>{city.city}</p>
        <p style={S.cardCountry}>
          {city.country === 'USA' ? `${city.state}, USA` : `${city.state}, ${city.country}`}
        </p>
        <p style={S.cardMeta}>👥 {city.population}</p>
        <Link to={detailPath} state={city} style={S.cardLink}>
          View details →
        </Link>
      </div>
    </article>
  );
}
