import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export function Filters () {

    const [ageRange, setAgeRange] = useState([18, 50])

    return (
        <div className="w-full md:w-1/4 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                </SelectContent>
                </Select>
            </div>

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
                <Select>
                <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="los-angeles">Los Angeles</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="houston">Houston</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <Select>
                <SelectTrigger id="interests">
                    <SelectValue placeholder="Select interests" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>
    )
}
