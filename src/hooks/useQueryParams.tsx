import { useSearchParams } from "react-router-dom";

export default function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    search: searchParams,
    setSearch: setSearchParams,
  };
}
