import { useSocket } from '@/api/Socket';
import React, { useEffect, useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from './ui/carousel';
import { Badge } from './ui/badge';
import { constants } from '@/constants';


const PreviewCard = ({index}) => {
    const { eventView } = useSocket();
    const [items, setItems] = useState<object | undefined>(undefined);

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
        <Card className={`z-0 absolute break-all w-full h-full`}>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                    <CarouselItem key={index}>
                        <img src={"https://placehold.co/520x520"} alt="" />
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
            <CardHeader className="flex justify-center p-6">
                <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
        </Card>
    )

    return (
        <Card className={`z-0 absolute break-all w-full h-full`}>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                {items?.pictures?.map((picture, index) => (
                    <CarouselItem key={index}>
                        <img src={picture} alt="" />
                    </CarouselItem>
                ))}
                </CarouselContent>
            </Carousel>
            <CardHeader className="flex justify-center p-6">
                <CardTitle className="text-2xl">{items?.first_name} {items?.last_name}</CardTitle>
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
            <CardDescription>{items?.biography} {index}</CardDescription>
            </CardHeader>
        </Card>
    );
};

export default PreviewCard;
