import { useSocket } from "@/api/Socket"
import PreviewCard from "./preview-card"
import { useEffect, useState } from "react";

export default function BrowseList() {
    const {eventBrowsing} = useSocket()
    const [error, setError] = useState<Error | null>(null);
    const [listProfils, setListProfils] = useState<any[] | null>(null);

    useEffect(() => {
        async function fetchProfiles() {
            const [err, profiles] = await eventBrowsing();
            setError(err);
            setListProfils([1, 2, 3, 4, 5]);
        }

        fetchProfiles();
    }, []);
    
    if (error) return <div>Error: {error.message}</div>
    if (!listProfils) return <div>Loading...</div>
    
    return (
        <>
        {listProfils.map((item: any) => (
            <PreviewCard key={item} index={item} />
        ))}
        </>
    )
}
