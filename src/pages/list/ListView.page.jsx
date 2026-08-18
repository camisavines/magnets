import * as React from 'react';
import {useState, useMemo, useCallback} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import { useCities } from '../../context/CitiesContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a population string like "1,234,567" → 1234567 */
function parsePopulation(str = '') {
  return parseInt(String(str).replace(/,/g, ''), 10) || 0;
}

// Shared with Home map — keep the blue value in sync with pin.jsx PIN_COLOR_GIFT
const GIFT_PIN_COLOR = '#1a6edb';

const GIFT_FILTER_OPTIONS = [
  {value: 'all',       label: 'All'},
  {value: 'gifts',     label: 'Gifts only'},
  {value: 'non-gifts', label: 'Non-gifts only'},
];

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
    background: '#111213',
  },

  /* Top toolbar */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#1a1c1f',
    borderBottom: '1px solid #2e3238',
    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
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
    background: '#1a1c1f',
    borderRight: '1px solid #2e3238',
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
    color: '#8b9098',
  },
  filterSection: {
    marginBottom: '24px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9cdd4',
  },
  searchInput: {
    width: '100%',
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid #3a3f47',
    borderRadius: '6px',
    outline: 'none',
    background: '#22252a',
    color: '#e8eaed',
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
    color: '#c9cdd4',
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
    color: '#c9cdd4',
    userSelect: 'none',
    cursor: 'pointer',
  },
  resetButton: {
    marginTop: '4px',
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4da3ff',
    background: 'transparent',
    border: '1px solid #1a6edb',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #2e3238',
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
    color: '#8b9098',
    fontSize: '14px',
  },

  /* ── Card ── */
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
    height: '150px',
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

  /* Mobile-only filter toggle button (hidden on desktop via CSS) */
  filterToggleButton: {
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#c9cdd4',
    background: '#22252a',
    border: '1px solid #3a3f47',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ListView = () => {
  const navigate = useNavigate();
  const cities = useCities();

  /* Sidebar collapse state — closed by default on mobile */
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > 640
  );

  /* Derive sorted unique countries from the dataset */
  const allCountries = useMemo(
    () => [...new Set(cities.map(c => c.country))].sort(),
    [cities]
  );

  /* Filter state */
  const [searchText, setSearchText] = useState('');
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [popRangeIndex, setPopRangeIndex] = useState(0); // 0 = "Any"
  const [giftFilter, setGiftFilter] = useState('all');

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
    setPopRangeIndex(0);
    setGiftFilter('all');
  }, []);

  /* Filtered cities */
  const filtered = useMemo(() => {
    const range = POPULATION_RANGES[popRangeIndex];
    const search = searchText.trim().toLowerCase();

    return cities.filter(city => {
      if (search && !city.city.toLowerCase().includes(search) && !city.country.toLowerCase().includes(search)) return false;
      if (selectedCountries.size > 0 && !selectedCountries.has(city.country)) return false;
      const pop = parsePopulation(city.population);
      if (pop < range.min || pop >= range.max) return false;
      if (giftFilter === 'gifts'     && !city.gift)          return false;
      if (giftFilter === 'non-gifts' &&  city.gift === true)  return false;
      return true;
    });
  }, [searchText, selectedCountries, popRangeIndex, giftFilter]);

  const hasActiveFilters =
    searchText.trim() !== '' ||
    selectedCountries.size > 0 ||
    popRangeIndex !== 0 ||
    giftFilter !== 'all';

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
          {filtered.length} of {cities.length} cities
        </span>
        <button
          className="lv-filter-toggle"
          style={S.filterToggleButton}
          type="button"
          aria-expanded={sidebarOpen}
          aria-controls="lv-sidebar"
          onClick={() => setSidebarOpen(o => !o)}
        >
          {sidebarOpen ? '✕ Filters' : '⚙ Filters'}{hasActiveFilters ? ' •' : ''}
        </button>
      </div>

      {/* ── Two-column body ── */}
      <div style={S.body} className="lv-body">
        {/* ── Sidebar ── */}
        <aside
          id="lv-sidebar"
          style={{
            ...S.sidebar,
            ...(sidebarOpen ? {} : {display: 'none'}),
          }}
          className="lv-sidebar"
          aria-label="Filter panel"
        >
          <p style={S.sidebarHeading}>Filters</p>

          {/* Search */}
          <div style={S.filterSection}>
            <label style={S.filterLabel} htmlFor="city-search">City, state, or country</label>
            <input
              id="city-search"
              type="search"
              placeholder="Search by city, state, or country…"
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

          {/* Gift Status */}
          <div style={S.filterSection}>
            <span style={S.filterLabel}>Gift Status</span>
            {GIFT_FILTER_OPTIONS.map(opt => (
              <label key={opt.value} style={S.radioRow}>
                <input
                  type="radio"
                  name="lv-gift-filter"
                  checked={giftFilter === opt.value}
                  onChange={() => setGiftFilter(opt.value)}
                />
                <span style={S.radioLabel}>{opt.label}</span>
              </label>
            ))}
            {/* Mini legend */}
            <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px'}}>
              <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#777'}}>
                <svg width="10" height="10" viewBox="0 0 24 24"><path d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z" fill={GIFT_PIN_COLOR}/></svg>
                Gift
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#777'}}>
                <svg width="10" height="10" viewBox="0 0 24 24"><path d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z" fill="#d00"/></svg>
                Not a gift
              </span>
            </div>
          </div>

          <hr style={S.divider} />

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

      {/* Responsive styles */}
      <style>{`
        /* Hide the filter toggle button on desktop */
        .lv-filter-toggle { display: none; }

        @media (max-width: 640px) {
          /* Show the toggle button */
          .lv-filter-toggle { display: block !important; }
          /* Stack layout */
          .lv-body { flex-direction: column !important; }
          /* Sidebar goes full-width when open */
          .lv-sidebar {
            width: 100% !important;
            max-width: 100% !important;
            min-width: unset !important;
            border-right: none !important;
            border-bottom: 1px solid #2e3238 !important;
            max-height: 60vh;
            overflow-y: auto;
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
