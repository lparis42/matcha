import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "./ui/multiselect";


import { constants } from "../constants";
import { useEffect, useState } from "react";

interface InterestsSelectorProps {
    onInterestsChange: (interests: string[]) => void;
}

export default function InterestsSelector({ onInterestsChange } : InterestsSelectorProps) {
    const [interests, setInterests] = useState<string[]>([]);

    useEffect(() => {
        onInterestsChange(interests);
    }, [interests, onInterestsChange]);

    return (
        <MultiSelector
                onValuesChange={setInterests}
                values={interests}
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput placeholder="Select differents interests ..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {constants.interests.map((value) => (
                      <MultiSelectorItem key={value} value={value}>
                        <div className="flex items-center space-x-2">
                          <span>{value}</span>
                        </div>
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
    )
}
