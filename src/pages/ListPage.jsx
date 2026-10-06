import SearchForm from "../components/SearchForm.jsx";
import PokemonGrid from "../components/PokemonGrid.jsx";
import TypeFilters from "../components/TypeFilters.jsx";
import GenerationFilters from "../components/GenerationFilters.jsx";
import { usePersistentState } from "../hooks.js";

function ListPage() {
  // Filters survive page navigation — come back and your setup is intact.
  const [typeFilter, setTypeFilter] = usePersistentState("pokedex-type-filter", null);
  const [genFilter, setGenFilter] = usePersistentState("pokedex-gen-filter", null);
  const [filtersOpen, setFiltersOpen] = usePersistentState("pokedex-filters-open", true);

  const hasFilters = typeFilter !== null || genFilter !== null;

  return (
    <>
      <SearchForm />

      <div className={`filters-card ${filtersOpen ? "" : "collapsed"}`}>
        <button
          className="filters-toggle"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
        >
          <span>Filters</span>
          {hasFilters && <span className="filters-count" aria-hidden="true" />}
          <span className={`filters-chevron ${filtersOpen ? "open" : ""}`} aria-hidden="true">
            ▾
          </span>
        </button>

        <div className="filters-body">
          <div className="filter-block">
            <p className="filter-label">Type</p>
            <TypeFilters value={typeFilter} onChange={setTypeFilter} />
          </div>
          <div className="filter-block">
            <p className="filter-label">Generation</p>
            <GenerationFilters value={genFilter} onChange={setGenFilter} />
          </div>
          {hasFilters && (
            <button
              className="btn btn-ghost filters-clear"
              onClick={() => {
                setTypeFilter(null);
                setGenFilter(null);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <PokemonGrid typeFilter={typeFilter} genFilter={genFilter} />
    </>
  );
}

export default ListPage;
