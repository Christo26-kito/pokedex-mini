import { useState } from "react";
import SearchForm from "../components/SearchForm.jsx";
import PokemonGrid from "../components/PokemonGrid.jsx";
import TypeFilters from "../components/TypeFilters.jsx";
import GenerationFilters from "../components/GenerationFilters.jsx";

function ListPage() {
  const [typeFilter, setTypeFilter] = useState(null);
  const [genFilter, setGenFilter] = useState(null);

  return (
    <>
      <SearchForm />

      <div className="filter-block">
        <p className="filter-label">Filter by type</p>
        <TypeFilters value={typeFilter} onChange={setTypeFilter} />
      </div>

      <div className="filter-block">
        <p className="filter-label">Filter by generation</p>
        <GenerationFilters value={genFilter} onChange={setGenFilter} />
      </div>

      <PokemonGrid typeFilter={typeFilter} genFilter={genFilter} />
    </>
  );
}

export default ListPage;
