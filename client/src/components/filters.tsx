import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import InterestsSelector from "./interests-selector"
import { Checkbox } from "./ui/checkbox"

interface FiltersProps {
    onFiltersChange: (filters: { ageRange: number[], kmRange: number[], fame: number[], interests: string[] }) => void;
}

export default function Filters ({ onFiltersChange }: FiltersProps) {

    const [ageRange, setAgeRange] = useState([18, 80])
    const [kmRange, setKmRange] = useState([5])
    const [fame, setFame] = useState([0])
    const [interests, setInterests] = useState<string[]>([])

    useEffect(() => {
        onFiltersChange({ ageRange, kmRange, fame, interests });
    }, [ageRange, kmRange, fame, interests]);

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
                <span>&lt; {kmRange[0]} km</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="fame">fame score</Label>
                <Slider
                min={0}
                max={10}
                step={1}
                value={fame}
                onValueChange={setFame}
                />
                <div className="flex justify-between text-sm text-gray-500">
                <span>&gt; {fame}</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <InterestsSelector onInterestsChange={setInterests}/>
            </div>
        </div>
    )
}
