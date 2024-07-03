import { useEffect, useState, useCallback } from "react";
import PreviewCard from "./preview-card";
import { Button } from "./ui/button";
import { HeartIcon, XIcon } from "lucide-react";
import { useSocket } from "@/api/Socket";

export const Matchview = ({ activeItem, setActiveItem }: {activeItem: number, setActiveItem: Function}) => {

    const {eventLike} = useSocket();

    const handlelike = () => {
        console.log('like');
        eventLike(activeItem, (err, message) => {
            if (err) {
                console.log(err);
                return;
            }
            setActiveItem(activeItem + 1);
        })
    }

    const handleunlike = () => {
        console.log('unlike', activeItem);
        setActiveItem(activeItem + 1);
    }

    return (
        <>
            <div className='basis-5/6 overflow-scroll no-scrollbar relative'>
                <PreviewCard index={activeItem}/>
            </div>
            <div className='basis-1/6 flex justify-around'>
                <Button onClick={handleunlike} className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <XIcon size={30} />
                </Button>
                <Button onClick={handlelike} className='rounded-full bg-gray-400 flex items-center justify-center w-16 h-16'>
                    <HeartIcon size={30} />
                </Button>
            </div>
        </>
    );
}

