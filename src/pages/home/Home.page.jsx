import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  useControl,
} from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";
import Pin from "./pin";

import CITIES from "./cities.json";

const TOKEN = import.meta.env.VITE_TOKEN;

// ---------------------------------------------------------------------------
// Custom mapbox IControl that renders a single toolbar button.
// Wrapping it as an IControl ensures it is placed inside the native
// .mapboxgl-ctrl-group on the same top-left rail as the built-in controls.
// ---------------------------------------------------------------------------
class ButtonControl {
  constructor({ label, title, onClick }) {
    this._label = label;
    this._title = title;
    this._onClick = onClick;
  }

  onAdd() {
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    const btn = document.createElement("button");
    btn.className = "mapboxgl-ctrl-icon";
    btn.type = "button";
    btn.title = this._title;
    btn.setAttribute("aria-label", this._title);
    btn.textContent = this._label;
    // Match the font size used by the native icon buttons
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "600";
    btn.style.lineHeight = "1";

    btn.addEventListener("click", this._onClick);
    this._container.appendChild(btn);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
  }
}

// React wrapper that registers the ButtonControl via useControl
function ListViewButton({ onClick }) {
  useControl(
    () => new ButtonControl({ label: "☰", title: "List View", onClick }),
    { position: "top-left" },
  );
  return null;
}

// 'all' | 'gifts' | 'non-gifts'
const GIFT_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "gifts", label: "Gifts only" },
  { value: "non-gifts", label: "Non-gifts only" },
];

export const Home = () => {
  const navigate = useNavigate();
  const [popupInfo, setPopupInfo] = useState(null);
  const [giftFilter, setGiftFilter] = useState("all");
  const goToListView = useCallback(() => navigate("/list"), [navigate]);

  const visibleCities = useMemo(() => {
    if (giftFilter === "gifts") return CITIES.filter((c) => c.gift === true);
    if (giftFilter === "non-gifts") return CITIES.filter((c) => !c.gift);
    return CITIES;
  }, [giftFilter]);

  const pins = useMemo(
    () =>
      visibleCities.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="bottom"
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
          }}
        >
          <Pin gift={city.gift === true} />
        </Marker>
      )),
    [visibleCities],
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Map
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0,
        }}
        style={{ width: "100%", height: "100vh" }}
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
              {popupInfo.city},{" "}
              {popupInfo.country === "USA"
                ? popupInfo.state
                : popupInfo.country}
            </div>
            <Link
              to={`/location/${popupInfo.city.toLowerCase().replace(/\s+/g, "-")}`}
              state={popupInfo}
              style={{ display: "block", marginTop: "6px", fontSize: "12px" }}
            >
              View details →
            </Link>
          </Popup>
        )}
      </Map>

      {/* ── Page title (floats over map, top-center) ── */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "-100px",
          // left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(20, 22, 25, 0.82)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          padding: "8px 18px",
          pointerEvents: "none",
          zIndex: 10,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
            fontSize: "15px",
            fontWeight: "700",
            color: "#e8eaed",
            letterSpacing: "0.01em",
          }}
        >
          Camisa's Travel Bucket List
        </span>
      </div>

      {/* ── Gift-status filter panel (floats over map, bottom-left) ── */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "12px",
          background: "rgba(255,255,255,0.95)",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "12px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
          fontSize: "13px",
          minWidth: "160px",
          zIndex: 10,
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontWeight: "700",
            color: "#333",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Gift Status
        </p>
        {GIFT_FILTER_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "3px 0",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="map-gift-filter"
              value={opt.value}
              checked={giftFilter === opt.value}
              onChange={() => setGiftFilter(opt.value)}
            />
            <span style={{ color: "#222" }}>{opt.label}</span>
          </label>
        ))}
        {/* Legend */}
        <div
          style={{
            marginTop: "10px",
            borderTop: "1px solid #eee",
            paddingTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#555",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path
                d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z"
                fill="#1a6edb"
              />
            </svg>
            Gift
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#555",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path
                d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9C20.1,15.8,20.2,15.8,20.2,15.7z"
                fill="#d00"
              />
            </svg>
            Not a gift
          </span>
        </div>
      </div>
    </div>
  );
};
