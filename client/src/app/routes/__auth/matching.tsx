import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import {HeartIcon, XIcon, SettingsIcon, MessageSquareTextIcon, PowerIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function Component() {

    return (
        <div className="flex flex-row gap-6 justify-center w-screen h-screen ">
            <div className="pt-8 flex-1 flex flex-col gap-7 max-w-lg h-screen">
                <div className='basis-5/6 overflow-scroll no-scroll'>
                    {/* <Card className='h-full shadow-md bg-gray-50'>
                        <CardHeader>
                            <CardTitle>Test</CardTitle>
                        </CardHeader>
                        <CardContent>
                            test
                        </CardContent>
                    </Card>
                    <Card className='h-full shadow-md bg-gray-50'>
                        <CardHeader>
                            <CardTitle>Test</CardTitle>
                        </CardHeader>
                        <CardContent>
                            test
                        </CardContent>
                    </Card> */}
                     <Carousel
      opts={{
        align: "start",
      }}
      orientation="vertical"
      className="w-full max-w-xs"
    >
      <CarouselContent className="-mt-1 h-[200px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pt-1 md:basis-1/2">
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
                </div>
                <div className='flex justify-around'>
                    <Button className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
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

