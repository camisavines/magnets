import * as React from 'react';
import {useState, useMemo, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  useControl
} from 'react-map-gl/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';
import ControlPanel from './control-panel';
import Pin from './pin';

import CITIES from './cities.json';

const TOKEN = import.meta.env.VITE_TOKEN;

// ---------------------------------------------------------------------------
// Custom mapbox IControl that renders a single toolbar button.
// Wrapping it as an IControl ensures it is placed inside the native
// .mapboxgl-ctrl-group on the same top-left rail as the built-in controls.
// ---------------------------------------------------------------------------
class ButtonControl {
  constructor({label, title, onClick}) {
    this._label = label;
    this._title = title;
    this._onClick = onClick;
  }

  onAdd() {
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    const btn = document.createElement('button');
    btn.className = 'mapboxgl-ctrl-icon';
    btn.type = 'button';
    btn.title = this._title;
    btn.setAttribute('aria-label', this._title);
    btn.textContent = this._label;
    // Match the font size used by the native icon buttons
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '600';
    btn.style.lineHeight = '1';

    btn.addEventListener('click', this._onClick);
    this._container.appendChild(btn);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
  }
}

// React wrapper that registers the ButtonControl via useControl
function ListViewButton({onClick}) {
  useControl(
    () => new ButtonControl({label: '☰', title: 'List View', onClick}),
    {position: 'top-left'}
  );
  return null;
}

export const Home = () => {
  const navigate = useNavigate();
  const [popupInfo, setPopupInfo] = useState(null);
  const goToListView = useCallback(() => navigate('/list'), [navigate]);

  const pins = useMemo(
    () =>
      CITIES.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="bottom"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        >
          <Pin />
        </Marker>
      )),
    []
  );

  return (
    <>
      <Map
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0
        }}
        style={{width: '100%', height: '100vh'}}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        mapboxAccessToken={TOKEN}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        <ListViewButton onClick={goToListView} />

        {pins}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              {popupInfo.city}, {popupInfo.state} |{' '}
              <a
                target="_new"
                href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${popupInfo.city}, ${popupInfo.state}`}
              >
                Wikipedia
              </a>
            </div>
            <img width="100%" src={popupInfo.image} />
          </Popup>
        )}
      </Map>

      <ControlPanel />
    </>
  );
}
