import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export function Component() {
    const [users, setUsers] = useState<string[]>(['User 1', 'User 2', 'User 3']);
    const [currentIdx, setCurrentIdx] = useState<number>(0);

    const handleLike = () => {
        setCurrentIdx((prevIdx) => prevIdx + 1);
    };

    const handleDislike = () => {
        setCurrentIdx((prevIdx) => prevIdx + 1);
    };

    return (
        <div>
            {currentIdx < users.length ? (
                <Card>
                    Test
                </Card>
            ) : (
                <p>No more users to match with.</p>
            )}
        </div>
    );
};

