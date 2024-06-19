import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import {HeartIcon, XIcon, SettingsIcon, MessageSquareTextIcon, PowerIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function Component() {

    const transition = () => {
        document.querySelector('.transition').classList.toggle('-translate-y-full');
    }

    return (
        <div className="flex flex-row gap-6 justify-center w-screen h-screen">
            <div className="pt-8 flex-1 flex flex-col gap-7 max-w-lg max-h-full">
                <div className='basis-5/6 overflow-scroll no-scrollbar relative'>
{/*  */}
                        <Card className='transition z-10 absolute break-all'>
                            <img src="https://placehold.co/520x520" alt="" className="" />
                            <CardContent className="flex items-center justify-center p-6">
                            <span className="text-3xl font-semibold">{1}</span>
                            djzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqd
                            </CardContent>
                        </Card>
                        <Card className='other absolute z-0 transition break-all'>
                            <img src="https://placehold.co/520x520" alt="" className="" />
                            <CardContent className="flex items-center justify-center p-6">
                            <span className="text-3xl font-semibold">{1}</span>
                            djzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqddzqddjzaejddezdzqddzqdzqdzdqqqqqqdzqdzqdzqdqzdzqzdqddzqdzqdzqdqzdzqzdqddqzddzqdzqdzqdqdzqdqzdzqzdqdqdzqd
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

