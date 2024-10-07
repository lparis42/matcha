import { useState } from "react";
import ViewCard from "./view-card";
import PreviewCard from "./preview-card";

interface ItemProfileProps {
    items: {
        id: number;
        first_name: string;
        date_of_birth: string;
        common_tags: string[];
        pictures: string[];
        geolocation: number[];
        location: string;
        online: boolean;
    },
    initialExpanded
}

export default function ItemProfile({items, initialExpanded = false}: ItemProfileProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const toggleCard = () => {
        setIsExpanded(!isExpanded);
        console.log("toggle");
    };

    return (
        <>
            {isExpanded ? (
                <ViewCard id={items.id} handleExpend={toggleCard}/>
            ) : (
                <PreviewCard items={items} handleExpend={toggleCard} />
            )}
        </>
    );
}
