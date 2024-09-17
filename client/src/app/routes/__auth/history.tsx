import { useSocket } from '@/api/Socket';
import React, { useEffect, useState } from 'react';

export function Component() {
    const [viewers, setViewers] = useState([])
    const [likers, setLikers] = useState([])
    const { eventLikers, eventViewers} = useSocket()

    useEffect(() => {
        const fetchViewers = async () => {
            const [err, data] = await eventViewers()
            if (!err) {
                setViewers(data)
                console.log("viewers", data)
            }
        }
        const fetchLikers = async () => {
            const [err, data] = await eventLikers()
            if (!err) {
                setLikers(data)
                console.log("likers", data)
            }
        }
        fetchViewers()
        fetchLikers()
    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">History</h1>
            <h2 className="text-xl font-bold">Viewers</h2>
            <ul>
                {viewers.map((viewer, index) => (
                    <li key={index}>- Account {viewer} view your profile</li>
                ))}
            </ul>
            <h2 className="text-xl font-bold mt-6">Likers</h2>
            <ul>
                {likers.map((liker, index) => (
                    <li key={index}>- Account {liker} liked your profile</li>
                ))}
            </ul>
        </div>
    );
};
