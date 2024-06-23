import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import {HeartIcon, XIcon, SettingsIcon, MessageSquareTextIcon, PowerIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { constants } from '@/constants';
import { Badge } from '@/components/ui/badge';

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

    const transition = () => {
        document.querySelector('.transition').classList.toggle('-translate-y-full');
    }

    return (
        <div className="flex flex-row gap-6 justify-center w-screen h-screen">
            <div className="pt-8 flex-1 flex flex-col gap-7 max-w-sm max-h-full">
                <div className='basis-5/6 overflow-scroll no-scrollbar relative'>
{/*  */}
                        <Card className='transition z-10 absolute break-all'>
                            <Carousel>
                                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                                <CarouselContent>
                                {items[0].pictures.map((picture, index) => {
                                    return (
                                        <CarouselItem key={index}>
                                            <img src={picture} alt="" />
                                        </CarouselItem>
                                    )
                                })}
                                </CarouselContent>
                            </Carousel>
                            <CardHeader className="flex justify-center p-6">
                                <CardTitle className="text-2xl">{items[0].first_name} {items[0].last_name}</CardTitle>
                                <div className='flex gap-2'>
                                    {items[0].interests.map((interest, index) => {
                                        return (
                                            <Badge key={index}>
                                                {interest}
                                            </Badge>
                                        )
                                        })
                                    }
                                </div>
                                <CardDescription>{items[0].biography}</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className='other absolute z-0 transition break-all'>
                            <img src="https://placehold.co/520x520" alt="" className="" />
                            <CardContent className="flex items-center justify-center p-6">
                            </CardContent>
                        </Card>
                </div>
                <div className='basis-1/6 flex justify-around'>
                    <Button onClick={transition} className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                        <XIcon size={30} />
                    </Button>
                    <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                        <HeartIcon size={30} />
                    </Button>
                </div>
            </div>
            <div className="pt-8 flex flex-col gap-6">
                <Button asChild className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <Link to='/profile'>
                        <SettingsIcon size={30} />
                    </Link>
                </Button>
                <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <MessageSquareTextIcon size={30} />
                </Button>
                <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <PowerIcon size={30} />
                </Button>
            </div>
        </div>
    );
};

