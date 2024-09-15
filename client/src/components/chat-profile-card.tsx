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
    const { eventUnLike, eventReport, eventBlock } = useSocket();
    //const [items, setItems] = useState<ProfileCardProps | undefined>(undefined);

    const handleUnLike = (index: number) => {
        eventUnLike(index, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
    }

    const handleReport = (index: number) => {
        eventReport(index, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
    }

    const handleBlock = (index: number) => {
        eventBlock(index, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
    }

    if (!items) return (
        <Card className=''>
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
        <div className={`cursor-pointer transition-all duration-300 ease-in-out`}>
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
                  {calculateAge(items?.date_of_birth)} years
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <GraduationCapIcon className="mr-2 h-4 w-4" />
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
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <Button className="flex-grow mr-2 bg-red-600" onClick={(e) => { e.stopPropagation(); handleUnLike(items?.id); }}>
                            <HeartIcon className="mr-2 h-4 w-4" /> Unlike
                        </Button>
                        <Button className="flex-grow mr-2 bg-gray-500" onClick={(e) => { e.stopPropagation(); handleReport(items?.id); }}>
                            <HeartIcon className="mr-2 h-4 w-4" /> Report as fake
                        </Button>
                        <Button className="flex-grow mr-2 bg-slate-900" onClick={(e) => { e.stopPropagation(); handleBlock(items?.id); }}>
                            <HeartIcon className="mr-2 h-4 w-4" /> Block
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
