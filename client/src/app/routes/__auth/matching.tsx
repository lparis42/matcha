import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import {HeartIcon, XIcon, SettingsIcon, MessageSquareTextIcon, PowerIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { constants } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/api/Socket';
import PreviewCard from '@/components/preview-card';

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

    const ChildComponent = ({ activeItem }) => {

        useEffect(() => {
        }, [activeItem]);

        const transition = () => {
            const tag = document.querySelector('.transition')
            if (tag) {
                tag.classList.toggle('-translate-y-full');
                const onTransitionEnd = () => {
                    tag.removeEventListener('transitionend', onTransitionEnd);
                    setActiveItem(activeItem + 1);
                };
                tag.addEventListener('transitionend', onTransitionEnd);
            }
        }

        return (
            <><div className='basis-5/6 overflow-scroll no-scrollbar relative'>
                {/*{list.map((profile, index) => (<PreviewCard index={index + 1} />))}
                <Card className='other absolute z-0 transition break-all'>
                    <img src="https://placehold.co/520x520" alt="" className="" />
                    <CardContent className="flex items-center justify-center p-6">
                    </CardContent>
                </Card>*/}
                    <PreviewCard index={activeItem} classname={"transition z-10"}/>
                    <PreviewCard index={activeItem + 1} classname={""}/>
                </div>
                
                <div className='basis-1/6 flex justify-around'>
                    <Button onClick={transition} className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                        <XIcon size={30} />
                    </Button>
                    <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                        <HeartIcon size={30} />
                    </Button>
                </div></>);

    }
    return (
        <div className="flex flex-row gap-6 justify-center w-screen h-screen">
            <div className="pt-8 flex-1 flex flex-col gap-7 max-w-sm max-h-full">
                <ChildComponent activeItem={activeItem} />
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

