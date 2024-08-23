
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, FilterIcon} from 'lucide-react'

export function SearchBar () {
    return (
        <>
            <div className="w-full md:w-3/4 flex-grow">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                className="pl-10 pr-4 py-2 w-full"
                type="search"
                placeholder="Search by name, interests, or location"
                />
            </div>
            </div>
            {/* Filter button (visible on mobile) */}
            <Button className="md:hidden" variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" /> Filters
            </Button>
        </>
    )
}
