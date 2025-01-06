import { useState } from "react";
import ViewCard from "./view-card";
import PreviewCard from "./preview-card";

interface ItemProfileProps {
    items: {
        id: number;
        gender: string;
        sexual_orientation: string;
        first_name: string;
        last_name: string;
        email: string;
        birth_date: Date;
        biography: string;
        interests: string[];
        pictures: string[];
        location: string;
        fame_rating: number;
        online: boolean;
        age: number;
        common_tags: string[];
        distance: number;
    },
    initialExpanded
}

export default function ItemProfile({items, initialExpanded = false}: ItemProfileProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const toggleCard = () => {
        setIsExpanded(!isExpanded);
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
