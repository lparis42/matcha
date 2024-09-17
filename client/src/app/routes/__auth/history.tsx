import React, { useEffect, useState } from 'react';

export function Component() {
    const [viewers, setViewers] = useState([])
    const [likers, setLikers] = useState([])

    useEffect(() => {

    }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">History</h1>
            <h2>Viewers</h2>
            <h2>Likers</h2>

        </div>
    );
};
