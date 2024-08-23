import { useSocket } from '@/api/Socket';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from './ui/carousel';
import { Badge } from './ui/badge';
import { constants } from '@/constants';
import { BriefcaseIcon, GraduationCapIcon, HeartIcon, MapPinIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';

interface ProfileCardProps {
    profile: {
        gender: string;
        sexual_orientation: string;
        first_name: string;
        last_name: string;
        email: string;
        birth_date: Date;
        biography: string;
        interests: string[];
        pictures: string[];
    }
  }

const PreviewCard = ({index}) => {
    const { eventView } = useSocket();
    const [items, setItems] = useState<object | undefined>(undefined);
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleCard = () => {
      setIsExpanded(!isExpanded)
      console.log("toggle")
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

    useEffect(() => {
        eventView(index, (err, profile) => {
            if (err) {
                console.log(err);
            } else {
                setItems(profile);
            }
        });
    }, [index]);

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
        <Card className={`overflow-hidden cursor-pointer transition-all duration-300 ease-in-out ${
            isExpanded ? 'sm:col-span-2 sm:row-span-2 scale-105' : 'hover:scale-102'
          }`}
          onClick={toggleCard}
          aria-expanded={isExpanded}>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                {!items?.pictures[0] &&
                    <CarouselItem key={index}>
                        <img src={"https://placehold.co/520x520"} alt="" />
                    </CarouselItem>}
                {items?.pictures?.map((picture, index) => (
                    <CarouselItem key={index}>
                        <img src={picture} alt="" />
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
            {/*<CardHeader className="flex justify-center p-6">
                <div className='flex gap-2'>
                    {items?.interests?.map((interest, index) => {
                        return (
                            <Badge key={index}>
                                {interest}
                            </Badge>
                        )
                        })
                    }
                </div>
            </CardHeader>*/}
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{items?.first_name}<br></br> {items?.last_name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  New York, NY
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <BriefcaseIcon className="mr-2 h-4 w-4" />
                  Software Engineer
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <GraduationCapIcon className="mr-2 h-4 w-4" />
                  Bachelor's in Computer Science
                </div>
                {isExpanded && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">{items?.biography}</p>
                    <div className="flex justify-between items-center">
                    <Button className="flex-grow mr-2">
                        <HeartIcon className="mr-2 h-4 w-4" /> Connect
                    </Button>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); toggleCard(); }}>
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                    </div>
                </div>
                )}
                {!isExpanded && (
                <Button className="w-full">
                    <HeartIcon className="mr-2 h-4 w-4" /> Connect
                </Button>
                )}
              </CardContent>
        </Card>
    );
};

export default PreviewCard;
