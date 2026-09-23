import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const FavoritesContext = createContext(null);
const TOAST_EVENT = "pokedex-toast";

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage(
    "pokedex-favorites",
    []
  );
  const [caught, setCaught] = useLocalStorage("pokedex-caught", {});

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
  const timer = useRef(null);

  useEffect(() => {
    function handle(event) {
      setMessage(event.detail.message);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 2400);
    }
    window.addEventListener(TOAST_EVENT, handle);
    return () => {
      window.removeEventListener(TOAST_EVENT, handle);
      clearTimeout(timer.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
