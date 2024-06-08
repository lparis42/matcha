import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const MatchingPage = () => {
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
                    <Card.Title>{users[currentIdx]}</Card.Title>
                    <Card.Body>
                        {/* Add user details or images here */}
                    </Card.Body>
                    <Card.Footer>
                        <Button onClick={handleDislike}>Dislike</Button>
                        <Button onClick={handleLike}>Like</Button>
                    </Card.Footer>
                </Card>
            ) : (
                <p>No more users to match with.</p>
            )}
        </div>
    );
};

export default MatchingPage;
