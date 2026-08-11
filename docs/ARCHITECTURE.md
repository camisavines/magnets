# Magnets — Application Architecture

## Diagram

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                           MAGNETS — APPLICATION ARCHITECTURE                    ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1 · USER / BROWSER                                                       │
│                                                                                 │
│   Chrome / Firefox / Safari                                                     │
│   └── Renders  index.html  (#root div)                                          │
│       └── Vite-bundled JS/CSS entry  (/src/main.jsx)                            │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │  DOM mount
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2 · REACT APPLICATION  (src/)                                            │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  <App>   (src/App.jsx)  — root component, React Router outlet if added  │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────┐   ┌─────────────────────────────────┐ │   │
│  │  │  <MapView>                  │   │  <Sidebar> / <LocationList>     │ │   │
│  │  │  (components/MapView.jsx)   │   │  (components/Sidebar.jsx)       │ │   │
│  │  │                             │   │                                 │ │   │
│  │  │  ┌───────────────────────┐  │   │  • Location list items          │ │   │
│  │  │  │  <Map>  ◄─── react-  │  │   │  • Selected location details    │ │   │
│  │  │  │  (react-map-gl)  map- │  │   │  • Image thumbnail strip        │ │   │
│  │  │  │         gl wrapper   │  │   └─────────────┬───────────────────┘ │   │
│  │  │  │                      │  │                 │                      │   │
│  │  │  │  ┌────────────────┐  │  │   ┌─────────────▼───────────────────┐ │   │
│  │  │  │  │  <Marker>      │  │  │   │  <ImageGallery>                  │ │   │
│  │  │  │  │  (one per      │  │  │   │  (components/ImageGallery.jsx)   │ │   │
│  │  │  │  │   location     │  │  │   │                                  │ │   │
│  │  │  │  │   record)      │◄─┼──┼───┤  • Renders <img> tags with       │ │   │
│  │  │  │  └────────────────┘  │  │   │    Firebase Storage download     │ │   │
│  │  │  │                      │  │   │    URLs passed as props          │ │   │
│  │  │  │  ┌────────────────┐  │  │   └─────────────────────────────────┘ │   │
│  │  │  │  │  <Popup>       │  │  │                                        │   │
│  │  │  │  │  (on marker    │  │  │                                        │   │
│  │  │  │  │   click)       │  │  │                                        │   │
│  │  │  │  └────────────────┘  │  │                                        │   │
│  │  │  │                      │  │                                        │   │
│  │  │  │  NavigationControl   │  │                                        │   │
│  │  │  │  GeolocateControl    │  │                                        │   │
│  │  │  └───────────────────────┘  │                                        │   │
│  │  └─────────────────────────────┘                                        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  HOOKS / STATE LAYER                                                    │   │
│  │                                                                         │   │
│  │  useLocations()          useImages(locationId)      useMapViewport()    │   │
│  │  (hooks/useLocations.js) (hooks/useImages.js)       (local useState)    │   │
│  │        │                        │                                       │   │
│  │        │ subscribes             │ resolves                              │   │
│  │        ▼                        ▼                                       │   │
│  │  [ locations[ ] state ]   [ imageURLs[ ] state ]                        │   │
│  └────────────┬───────────────────┬─────────────────────────────────────── ┘   │
└───────────────┼───────────────────┼─────────────────────────────────────────────┘
                │  Firestore SDK     │  Storage SDK
                │  (real-time sub)   │  (getDownloadURL)
                ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3 · FIREBASE INTEGRATION  (src/firebase/)                                │
│                                                                                 │
│  ┌──────────────────────────────────────────────────┐                          │
│  │  firebase.js  — initializeApp() + getFirestore() │                          │
│  │                + getStorage()  + getAuth()        │                          │
│  └──────────┬──────────────────┬────────────────────┘                          │
│             │                  │                                                │
│   ┌─────────▼──────┐  ┌────────▼──────────┐                                   │
│   │  firestoreApi  │  │  storageApi        │                                   │
│   │  .js           │  │  .js               │                                   │
│   │                │  │                    │                                   │
│   │ • getDocs /    │  │ • ref()            │                                   │
│   │   onSnapshot   │  │ • getDownloadURL() │                                   │
│   │   ("locations" │  │  ("images/{id}/…") │                                   │
│   │   collection)  │  │                    │                                   │
│   └────────────────┘  └────────────────────┘                                   │
└───────────────────────────┬────────────────────┬───────────────────────────────┘
                            │  HTTPS / WSS        │  HTTPS
                            ▼                     ▼
┌──────────────────────────────────┐   ┌──────────────────────────────────────────┐
│  LAYER 4a · CLOUD FIRESTORE      │   │  LAYER 4b · FIREBASE STORAGE             │
│                                  │   │                                          │
│  Collection: "locations"         │   │  Bucket: gs://magnets.appspot.com        │
│  ┌──────────────────────────┐    │   │  ┌──────────────────────────────────┐    │
│  │  Document {              │    │   │  │  images/                         │    │
│  │    id: string,           │    │   │  │  └── {locationId}/               │    │
│  │    name: string,         │    │   │  │       ├── photo_1.jpg            │    │
│  │    lat: number,          │    │   │  │       ├── photo_2.jpg            │    │
│  │    lng: number,          │    │   │  │       └── …                      │    │
│  │    description: string,  │    │   │  └──────────────────────────────────┘    │
│  │    imageRefs: string[ ]  │    │   │                                          │
│  │  }                       │    │   │  Security Rules: auth-gated read         │
│  └──────────────────────────┘    │   └──────────────────────────────────────────┘
│                                  │
│  Security Rules: auth-gated read │
└──────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LEGEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ──►  Data / control flow (synchronous or request/response)
  ──►  (from hooks to state)  State update after async resolution
  WSS  WebSocket connection (Firestore onSnapshot real-time listener)
  HTTPS  Standard REST/HTTPS fetch (Storage download URL resolution)
  [ ]  In-memory React state array
  ◄──  Props passed down from parent to child component
  ┌──┐
  │  │  Logical module / file boundary
  └──┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Data Flow

**Firestore → React state.** On mount, the `useLocations()` hook calls `onSnapshot()` against the Firestore `"locations"` collection. Each document carries `lat`, `lng`, and an `imageRefs` array of Storage paths; the hook writes the resulting array into a React state slice and re-renders whenever a document changes.

**Storage → resolved image URLs.** The `useImages(locationId)` hook iterates over a location's `imageRefs`, calls `getDownloadURL()` for each ref through the Firebase Storage SDK, and resolves all promises in parallel, storing the resulting HTTPS URLs in a second state slice. No image binary data is held in state — only the CDN URLs.

**React state → map markers.** `<MapView>` receives the `locations[]` array as a prop and renders one `<Marker>` per entry via `react-map-gl`, positioning each marker at its `[lng, lat]` coordinate. Clicking a marker opens a `<Popup>` component (also from `react-map-gl`) that displays the location name, description, and a thumbnail sourced from the resolved Storage URLs.

**Sidebar & gallery.** In parallel, `<Sidebar>` lists all locations and delegates to `<ImageGallery>`, which renders `<img>` elements whose `src` attributes are the download URLs provided by `useImages()`. Both the map markers and the gallery draw from the same shared state, so selecting a location in either view updates a single `selectedLocationId` atom, keeping both panels in sync without a separate data fetch.
