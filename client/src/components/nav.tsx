import { Link } from "react-router-dom";

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { MenuIcon, XIcon, BellIcon } from 'lucide-react'

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3) // Example count

  const navItems = [
    {name: 'Browse', href: '/browse'},
    {name: 'Chat', href: '/chat'},
    {name: 'Profile', href: '/profile'},
    {name: 'Matchings', href: '/matching'},
  ]

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex justify-center flex-1 sm:items-stretch">
            <div className="hidden sm:flex sm:space-x-8 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
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
          </div>
          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
              {isOpen ? (
                <XIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
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
        </div>
      </div>
      
    </nav>
  )
}