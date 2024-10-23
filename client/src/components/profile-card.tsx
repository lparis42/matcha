import { useSocket } from '@/api/Socket';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselPrevious, CarouselNext, CarouselContent, CarouselItem } from './ui/carousel';
import { Badge } from './ui/badge';
import { constants } from '@/constants';
import { GaugeIcon, HeartIcon, MapPinIcon, UserIcon, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface ProfileCardProps {
    items: {
        id: number,
        username: string,
        first_name: string,
        last_name: string,
        date_of_birth: Date,
        gender: string,
        sexual_orientation: string,
        biography: string,
        common_tags: string[],
        pictures: string[],
        fame_rating: number,
        geolocation: number[],
        location: string,
        online: boolean,
        last_connection: Date
    },
    handleExpend: (index: number) => void 
  }

const ProfileCard = ({items, handleExpend}: ProfileCardProps) => {
    const { eventLike } = useSocket();
    const [isliked, setIsLiked] = useState(false);

    const handleClick = async () => {
        const [err, res] = await eventLike(items?.id);
        if (err) {
            toast({title: err});
        } else {
            setIsLiked(true);
        }
    }

    console.log(items);

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
        <Card className={`profile overflow-hidden cursor-pointer transition-all duration-300 ease-in-out sm:col-span-2 sm:row-span-2`}>
            <Carousel>
                <CarouselPrevious className='absolute top-1/2 left-0 transform -translate-y-1/2 z-10'/>
                <CarouselNext className='absolute top-1/2 right-0 transform -translate-y-1/2 z-10' />
                <CarouselContent>
                {items?.pictures?.map((picture, index) => {
                    if (!picture)
                        return null;
                    return (
                    <CarouselItem key={index} className='overflow-hidden w-full aspect-square'>
                        <img src={`https://localhost:2000/images/${picture}`} alt="" className='aspect-square object-contain mx-auto'/>
                    </CarouselItem>)
                })}
                </CarouselContent>
            </Carousel>
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{items?.first_name}<br></br> {items?.last_name}</h3>
                {items?.online ? "Online" : `Last seen ${items?.last_connection}`}
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  {items?.location}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <UserIcon className="mr-2 h-4 w-4" />
                  {calculateAge(items?.date_of_birth)} years
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <GaugeIcon className="mr-2 h-4 w-4" />
                  {items?.fame_rating}
                </div>
                <div className="flex flex-wrap gap-1 items-center text-sm text-gray-500 mb-4">
                    {items?.common_tags?.map((interest, index) => {
                        return (
                            <Badge key={index}>
                                {constants.interests[interest]}
                            </Badge>
                        )
                        })
                    }
                </div>
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">{items?.biography}</p>
                    <div className="flex justify-between items-center">
                    {isliked ? <Button variant="outline" disabled>Connected</Button> :
                        <Button className="flex-grow mr-2" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                            <HeartIcon className="mr-2 h-4 w-4" /> Connect
                        </Button>
                    }
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleExpend(items?.id)}}>
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                    </div>
                </div>
              </CardContent>
        </Card>
    );
};

export default ProfileCard;

function calculateAge(birthDate: Date): number {
    const convertDate = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - convertDate.getFullYear();
    const monthDifference = today.getMonth() - convertDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < convertDate.getDate())) {
      age--;
    }
    return age;
  }
