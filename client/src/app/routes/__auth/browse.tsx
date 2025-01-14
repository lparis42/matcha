import { useCallback, useState } from 'react'
import Filters from '@/components/filters'
import BrowseList from '@/components/browse-list'
import SortMenu from '@/components/sort-menu'
import { useLocation } from 'react-router-dom'
import { useAccount } from '@/hook/useAccount'

interface FiltersState {
  ageRange: [number, number];
  kmRange: [number];
  fame: [number];
  interests: string[];
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function Component() {
  // useAccount();
  const query = useQuery();
  const id = Number(query.get('id'));
  const [sortOption, setSortOption] = useState<string>("age");

  const [filters, setFilters] = useState<FiltersState>({
      ageRange: [18, 80],
      kmRange: [5],
      fame: [0],
      interests: []
  });

  const handleSortOptionChange = useCallback((option: string) => {
    setSortOption(option);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FiltersState) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Your Match</h1>

      <div className="mt-8 flex flex-col md:flex-row gap-8">
        <Filters onFiltersChange={handleFiltersChange}/>
        <div className='space-y-6'>
          <SortMenu onSortOptionChange={handleSortOptionChange}/>
          <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BrowseList filters={filters} sortOption={sortOption} userId={id}/>
          </div>
        </div>
      </div>
    </div>
  )
}
