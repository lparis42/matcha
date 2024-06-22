import {
    FileImage,
    Mic,
    Paperclip,
    PlusCircle,
    SendHorizontal,
    Smile,
    ThumbsUp,
  } from "lucide-react";
  import { Link } from 'react-router-dom';
  import React, { useRef, useState } from "react";
  import { buttonVariants } from "./ui/button";
  import { cn } from "@/lib/utils";
  import { Message, loggedInUserData } from "./data";
  import { Textarea } from "./ui/textarea";
  import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
  
  interface ChatBottombarProps {
    sendMessage: (newMessage: Message) => void;
    isMobile: boolean;
  }
  
  export default function ChatBottombar({
    sendMessage, isMobile,
  }: ChatBottombarProps) {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
  
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
    };
  
    const handleThumbsUp = () => {
      const newMessage: Message = {
        id: message.length + 1,
        name: loggedInUserData.name,
        avatar: loggedInUserData.avatar,
        message: "👍",
      };
      sendMessage(newMessage);
      setMessage("");
    };
  
    const handleSend = () => {
      if (message.trim()) {
        const newMessage: Message = {
          id: message.length + 1,
          name: loggedInUserData.name,
          avatar: loggedInUserData.avatar,
          message: message.trim(),
        };
        sendMessage(newMessage);
        setMessage("");
  
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
  
    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
  
      if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        setMessage((prev) => prev + "\n");
      }
    };
  
    return (
      <div className="p-2 flex justify-between w-full items-center gap-2">
          <div className="w-full relative">
            <Textarea
              autoComplete="off"
              value={message}
              ref={inputRef}
              onKeyDown={handleKeyPress}
              onChange={handleInputChange}
              name="message"
              placeholder="Aa"
              className=" w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background"
            ></Textarea>
            {/*<div className="absolute right-2 bottom-0.5  ">
            </div>*/}
          </div>
  
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
              )}
              onClick={handleSend}
            >
              <SendHorizontal size={20} className="text-muted-foreground" />
            </Link>
      </div>
    );
  }
