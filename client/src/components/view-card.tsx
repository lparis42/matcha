import { useSocket } from "@/api/Socket";
import { useEffect, useState } from "react";
import ProfileCard from "./profile-card";
<<<<<<< HEAD
=======
import { useToast } from "./ui/use-toast";
>>>>>>> origin/browsing

export default function ViewCard ({ id, handleExpend }: { id: Number, handleExpend: (index: number) => void }) {
    const { eventView } = useSocket();
    const [items, setItems] = useState(null);
<<<<<<< HEAD

    useEffect(() => {
        eventView(id, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
                setItems(res);
            }
        });
    }, [id]);

    return (
        <ProfileCard items={items} handleExpend={handleExpend}/>
=======
    const {toast} = useToast();

    useEffect(() => {
        async function fetchProfile() {
            const [err, profile] = await eventView(id);
            if (err) {
                toast({title: err.message});
            } else {
                setItems(profile);
            }
        }
        fetchProfile();
    }, [id]);

    return (
        <ProfileCard items={{...items, id}} handleExpend={handleExpend}/>
>>>>>>> origin/browsing
    )
}
