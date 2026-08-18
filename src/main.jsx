import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, ListView, DetailView } from "./pages/index.jsx";
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
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CitiesProvider>
      <RouterProvider router={router} />
    </CitiesProvider>
  </StrictMode>,
);
