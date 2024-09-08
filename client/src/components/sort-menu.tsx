import { ChevronDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState } from "react";

interface SortMenuProps {
    onSortOptionChange: (option: string) => void;
  }

//sort menu component, age by ascending, proximity by near, tags by most
export default function SortMenu({ onSortOptionChange }: SortMenuProps) {
    const [sortOption, setSortOption] = useState("age")
    const handleSortOptionChange = (option) => {
      setSortOption(option)
      onSortOptionChange(option);
    }

    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Sort by</span>
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuRadioGroup value={sortOption} onValueChange={handleSortOptionChange}>
            <DropdownMenuRadioItem value="age">Age</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="proximity">Proximity</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="tags">Most Tags</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
}
