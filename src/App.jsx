import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ListPage from "./pages/ListPage.jsx";
import DetailPage from "./pages/DetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import { FavoritesProvider } from "./FavoritesContext.jsx";

function App() {
  return (
    <FavoritesProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ListPage />} />
            <Route path="/pokemon/:name" element={<DetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </FavoritesProvider>
  );
}

export default App;
