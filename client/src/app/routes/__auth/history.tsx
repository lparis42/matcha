import { useSocket } from '@/api/Socket';
import { useAccount } from '@/hook/useAccount';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Component() {
    useAccount();
    const [viewers, setViewers] = useState([])
    const [likers, setLikers] = useState([])
    const { eventLikers, eventViewers} = useSocket()

    useEffect(() => {
        const fetchViewers = async () => {
            const [err, data] = await eventViewers()
            if (!err) {
                setViewers(data)
            }
        }
        const fetchLikers = async () => {
            const [err, data] = await eventLikers()
            if (!err) {
                setLikers(data)
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
                    
                   <Link to={'/browse?id=' + viewer.id}> <li key={index}>- Account {viewer.username} view your profile</li></Link>
                ))}
            </ul>
            <h2 className="text-xl font-bold mt-6">Likers</h2>
            <ul>
                {likers.map((liker, index) => (
                    <Link to={'/browse?id=' + liker.id}> <li key={index}>- Account {liker.username} liked your profile</li></Link>
                ))}
            </ul>
        </div>
    );
};
