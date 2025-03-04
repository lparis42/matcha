import { useSocket } from "@/api/Socket";
import { useEffect, useState } from "react";
import ProfileCard from "./profile-card";
import { useToast } from "./ui/use-toast";

export default function ViewCard ({ id, item, handleExpend }: { id: Number, item, handleExpend: (index: number) => void }) {
    const { eventView } = useSocket();
    const [items, setItems] = useState(null);
    const {toast} = useToast();

    useEffect(() => {
        async function fetchProfile() {
            const [err, profile] = await eventView(id);
            if (err) {
                toast({title: err.message});
            } else {
                setItems({...profile, distance: item.distance});
            }
        }
        fetchProfile();
    }, [id]);

    return (
        <ProfileCard items={{...items, id}} handleExpend={handleExpend}/>
    )
}
