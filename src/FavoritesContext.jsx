import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePersistentState } from "./hooks.js";

const FavoritesContext = createContext(null);
const TOAST_EVENT = "pokedex-toast";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = usePersistentState("pokedex-favorites", []);
  const [caught, setCaught] = usePersistentState("pokedex-caught", {});

  function addFavorite(name) {
    setFavorites((prev) =>
      prev.includes(name) ? prev : [...prev, name]
    );
  }

  function removeFavorite(name) {
    setFavorites((prev) => prev.filter((f) => f !== name));
  }

  function isFavorite(name) {
    return favorites.includes(name);
  }

  function catchPokemon(name) {
    setCaught((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  }

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    caught,
    catchPokemon,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      <ToastHost />
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function showToast(message) {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { message } })
  );
}

function ToastHost() {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);
  const showTimer = useRef(null);

  useEffect(() => {
    function handle(event) {
      setMessage(event.detail.message);
      setVisible(true);
      clearTimeout(timer.current);
      clearTimeout(showTimer.current);
      timer.current = setTimeout(() => {
        setVisible(false);
        showTimer.current = setTimeout(() => setMessage(null), 280);
      }, 2200);
    }
    window.addEventListener(TOAST_EVENT, handle);
    return () => {
      window.removeEventListener(TOAST_EVENT, handle);
      clearTimeout(timer.current);
      clearTimeout(showTimer.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      className={`toast ${visible ? "toast-show" : ""}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
