import { useSocket } from '@/api/Socket';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from './ui/carousel';
import { Badge } from './ui/badge';
import { constants } from '@/constants';
import { BriefcaseIcon, GraduationCapIcon, HeartIcon, MapPinIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import ViewCard from './view-card';

interface ProfileCardProps {
    items: {
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
  }

const PreviewCard = ({items, handleExpend}: {items: ProfileCardProps, handleExpend: (index: number) => void;}) => {

    if (!items) return (
        <Card className='overflow-hidden'>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                    {[...Array(1)].map((_, index) => (
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
        <Card className={`overflow-hidden cursor-pointer transition-all duration-300 ease-in-out flex flex-col h-full hover:scale-105 z-0`}>
            <CardHeader className="p-0">
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
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
                <div className=''>
                    <h3 className="font-semibold text-lg mb-2">{items?.first_name}</h3>
                    {items?.online ?
                        <h2 className="text-sm mb-2 text-green-600">Online</h2>
                        : <h2 className="text-sm mb-2 text-red-600">Offline</h2>}
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
                    {items?.fame_rating}
                    </div>
                    <div className="flex flex-wrap gap-1 items-center text-sm text-gray-500 mb-4">
                        {items?.common_tags?.map((interest, index) => {
                            if (index > 4)
                                return null;
                            return (
                                <Badge key={index}>
                                    {constants.interests[interest]}
                                </Badge>
                            )
                            })
                        }
                        {items?.common_tags?.length > 4 && (
                            <Badge>...</Badge>
                        )}
                    </div>
                </div>
                <div className='mt-auto'>
                    <Button className="w-full" onClick={()=> {handleExpend(items.id)}}>
                        <HeartIcon className="mr-2 h-4 w-4" /> View
                    </Button>
                </div>
              </CardContent>
        </Card>
    );
};

export default PreviewCard;
