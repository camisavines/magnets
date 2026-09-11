import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, ListView, DetailView, CityView, BackgroundRemovalPage } from "./pages/index.jsx";
import { CitiesProvider } from "./context/CitiesContext.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/list",
    element: <ListView />,
  },
  {
    path: "/location/:id",
    element: <DetailView />,
  },
  {
    path: "/city/:citySlug",
    element: <CityView />,
  },
  {
    path: "/__background-removal",
    element: <BackgroundRemovalPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CitiesProvider>
      <RouterProvider router={router} />
    </CitiesProvider>
  </StrictMode>,
);
