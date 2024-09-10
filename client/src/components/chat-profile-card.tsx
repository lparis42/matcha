import { useSocket } from '@/api/Socket';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from './ui/carousel';
import { Badge } from './ui/badge';
import { constants } from '@/constants';
import { BriefcaseIcon, GraduationCapIcon, HeartIcon, MapPinIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';

interface ProfileCardProps {
        id: number;
        gender: string;
        sexual_orientation: string;
        first_name: string;
        last_name: string;
        email: string;
        birth_date: Date;
        biography: string;
        interests: string[];
        pictures: string[];
        location: string;
        fame_rating: number;
  }

const ChatProfileCard = ({items}: ProfileCardProps) => {
    const { eventLike } = useSocket();
    //const [items, setItems] = useState<ProfileCardProps | undefined>(undefined);

    const handleClick = (index: number) => {
        eventLike(index, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
    }

    //{
    //    gender: constants.genders[0],
    //    sexual_orientation: constants.sexual_orientations[0],
    //    first_name: "pierre",
    //    last_name: "semsari",
    //    email: "",
    //    birth_date: new Date(),
    //    biography: "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    //    interests: [ "sport", "music", "cinema", "travel", "cooking"],
    //    pictures: ["https://placehold.co/520x520", "https://placehold.co/520x520", "https://placehold.co/520x520", "https://placehold.co/520x520", "https://placehold.co/520x520"]
    //}

    //useEffect(() => {

    //    setItems(DATA[index]);
    //}, [index]);

    if (!items) return (
        <Card className='overflow-hidden'>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                    {[...Array(7)].map((_, index) => (
                        <CarouselItem key={index}>
                        <img src={"https://placehold.co/520x520"} alt="" />
                    </CarouselItem>))}
                </CarouselContent>
            </Carousel>
            <CardHeader className="flex justify-center p-6">
                <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
        </Card>
    )

    return (
        <div className={`overflow-hidden cursor-pointer transition-all duration-300 ease-in-out`}>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                {items?.pictures?.map((picture, index) => {
                    if (!picture)
                        return null;
                    return (
                    <CarouselItem key={index} className=''>
                        <img src={`https://localhost:2000/images/${picture}`} alt="" className='object-cover aspect-square'/>
                    </CarouselItem>)
                })}
                </CarouselContent>
            </Carousel>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{items?.first_name}<br></br> {items?.last_name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  {items?.location}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <BriefcaseIcon className="mr-2 h-4 w-4" />
                  {items?.age} years
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <GraduationCapIcon className="mr-2 h-4 w-4" />
                  {items?.fame_rating} / 10
                </div>
                <div className="flex flex-wrap gap-1 items-center text-sm text-gray-500 mb-4">
                    {items?.common_tags?.map((interest, index) => {
                        return (
                            <Badge key={index}>
                                {interest}
                            </Badge>
                        )
                        })
                    }
                </div>
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">{items?.biography}</p>
                    <div className="flex justify-between items-center">
                    <Button className="flex-grow mr-2" onClick={(e) => { e.stopPropagation(); handleClick(items?.id); }}>
                        <HeartIcon className="mr-2 h-4 w-4" /> Connect
                    </Button>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); }}>
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                    </div>
                </div>
              </CardContent>
        </div>
    );
};

export default ChatProfileCard;
