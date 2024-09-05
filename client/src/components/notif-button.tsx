import { useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BellIcon } from 'lucide-react'
import { useSocket } from "@/api/Socket";
import NotifCard from "./notif-card";

export default function NotifButton () {
    const {notifications, clearNotifications} = useSocket()

    const notificationCount = notifications.length

    const handleOpenChange = (open) => {
        if (!open) {
            clearNotifications()
        }
    };

    return (
        <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger>
                <div
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={`${notificationCount} unread notifications`}
                >
                    <BellIcon className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {notificationCount}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[400px] p-4">
                <DropdownMenuLabel className="mb-2 text-lg font-medium">Notifications</DropdownMenuLabel>
                <div className="grid gap-4">
                    {notifications.map((notif, index) => (
                        <NotifCard key={index} type={notif.type} account={notif.account} />
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
