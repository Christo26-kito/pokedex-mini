import { useState } from "react";
import SearchForm from "../components/SearchForm.jsx";
import PokemonList from "../components/PokemonList.jsx";
import TypeFilters from "../components/TypeFilters.jsx";

function ListPage() {
  const [typeFilter, setTypeFilter] = useState(null);

  return (
    <>
      <SearchForm />
      <TypeFilters value={typeFilter} onChange={setTypeFilter} />
      <PokemonList typeFilter={typeFilter} />
    </>
  );
}

export default ListPage;
