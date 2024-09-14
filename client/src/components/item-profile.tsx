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
    }
}

export default function ItemProfile({items}: ItemProfileProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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
