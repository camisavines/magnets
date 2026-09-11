import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { ref, onValue } from "firebase/database";

const CitiesContext = createContext([]);

export function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const rootRef = ref(db, "/");
    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCities(Object.values(data));
    });
    return () => unsubscribe();
  }, []);

  return (
    <CitiesContext.Provider value={cities}>{children}</CitiesContext.Provider>
  );
}

export function useCities() {
  return useContext(CitiesContext);
}
