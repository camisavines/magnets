import * as React from 'react';
import {useNavigate, Link} from 'react-router-dom';
import CITIES from '../home/cities.json';

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
    overflowY: 'auto',
    padding: '24px',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
  },
  detailLink: {
    display: 'inline-block',
    marginTop: '6px',
    fontSize: '12px',
    color: '#1a73e8',
    textDecoration: 'none',
  },
  image: {
    width: '80px',
    height: '54px',
    objectFit: 'cover',
    borderRadius: '4px',
    flexShrink: 0,
  },
  cityName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  meta: {
    margin: '2px 0 0',
    fontSize: '13px',
    color: '#666',
  },
};

export const ListView = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.toolbar}>
        <button
          style={styles.backButton}
          type="button"
          title="Back to Map"
          aria-label="Back to Map"
          onClick={() => navigate('/')}
        >
          ←
        </button>
        <h1 style={styles.title}>List View</h1>
      </div>

      <div style={styles.body}>
        <ul style={styles.list}>
          {CITIES.map((city, index) => (
            <li key={index} style={styles.item}>
              <img
                style={styles.image}
                src={city.image}
                alt={city.city}
              />
              <div>
                <p style={styles.cityName}>{city.city}, {city.state}</p>
                <p style={styles.meta}>Population: {city.population}</p>
                <Link
                  to={`/location/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                  state={city}
                  style={styles.detailLink}
                >
                  View details →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
