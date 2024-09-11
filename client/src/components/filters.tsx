import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import InterestsSelector from "./interests-selector"
import { Checkbox } from "./ui/checkbox"

interface FiltersProps {
    onFiltersChange: (filters: { ageRange: number[], kmRange: number[], interests: string[], isSuggested: boolean }) => void;
}

export default function Filters ({ onFiltersChange }: FiltersProps) {

    const [ageRange, setAgeRange] = useState([18, 80])
    const [kmRange, setKmRange] = useState([5])
    const [interests, setInterests] = useState<string[]>([])
    const [isSuggested, setIsSuggested] = useState(true)

    useEffect(() => {
        onFiltersChange({ ageRange, kmRange, interests, isSuggested });
    }, [ageRange, kmRange, interests, isSuggested, onFiltersChange]);

    return (
        <div className="w-full md:w-1/4 space-y-6">

            <div className="space-y-2">
                <Label>Age Range</Label>
                <Slider
                min={18}
                max={80}
                step={1}
                value={ageRange}
                onValueChange={setAgeRange}
                />
                <div className="flex justify-between text-sm text-gray-500">
                <span>{ageRange[0]} years</span>
                <span>{ageRange[1]} years</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Slider
                min={0}
                max={100}
                step={1}
                value={kmRange}
                onValueChange={setKmRange}
                />
                <div className="flex justify-between text-sm text-gray-500">
                <span>{kmRange[0]} km</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Interests</Label>
                <InterestsSelector onInterestsChange={setInterests}/>
            </div>

            <div className="space-y-2 flex items-center space-x-2">
                <Checkbox aria-label='Suggested list' checked={isSuggested} onCheckedChange={() => {setIsSuggested(!isSuggested)}} />
                <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Suggest list
                </Label>
            </div>
        </div>
    )
}
