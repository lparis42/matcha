import { useSocket } from "@/api/Socket";
import { useEffect, useState } from "react";
import ProfileCard from "./profile-card";

export default function ViewCard ({ id, handleExpend }: { id: Number, handleExpend: (index: number) => void }) {
    const { eventView } = useSocket();
    const [items, setItems] = useState(null);

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
    )
}
