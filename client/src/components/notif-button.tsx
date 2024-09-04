import { useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { BellIcon } from 'lucide-react'

export default function NotifButton () {
    const [notificationCount, setNotificationCount] = useState(3) // Example count
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button
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
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[400px] p-4">
                <DropdownMenuLabel className="mb-2 text-lg font-medium">Notifications</DropdownMenuLabel>
                <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">Your call has been confirmed</p>
                            <p className="text-xs text-muted-foreground">5 min ago</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your call with the client has been scheduled for tomorrow at 2pm.
                        </p>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
