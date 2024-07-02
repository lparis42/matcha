import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {SettingsIcon, MessageSquareTextIcon, PowerIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { constants } from '@/constants';
import { useSocket } from '@/api/Socket';
import { Matchview } from '@/components/match-view';

const items = [
    {
        gender: constants.genders[0],
        sexual_orientation: constants.sexual_orientations[0],
        first_name: "pierre",
        last_name: "semsari",
        email: "",
        birth_date: new Date(),
        biography: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        interests: [ "sport", "music", "cinema", "travel", "cooking"],
        pictures: ["https://placehold.co/520x520", "https://placehold.co/520x520", "https://placehold.co/520x520", "https://placehold.co/520x520", "https://placehold.co/520x520"]
    }
]

export function Component() {
    const [list, setList] = useState([]);

    const {eventBrowsing} = useSocket();

    const [activeItem, setActiveItem] = useState(1);

    useEffect(() => {
        eventBrowsing( (err, profiles) => {
            if (err) {
                console.log(err);
            } else {
                setList(profiles);
                console.log(profiles);
            }
        });
    }, []);

    return (
        <div className="flex flex-row gap-6 justify-center w-screen h-screen">
            <div className="pt-8 flex-1 flex flex-col gap-7 max-w-sm max-h-full">
                <Matchview activeItem={activeItem} setActiveItem={setActiveItem} />
            </div>
            <div className="pt-8 flex flex-col gap-6">
                <Button asChild className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <Link to='/profile'>
                        <SettingsIcon size={30} />
                    </Link>
                </Button>
                <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <Link to='/chat'>
                        <MessageSquareTextIcon size={30} />
                    </Link>
                </Button>
                <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <PowerIcon size={30} />
                </Button>
            </div>
        </div>
    );
};

