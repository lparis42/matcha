import { Link } from "react-router-dom";

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { MenuIcon, XIcon, BellIcon } from 'lucide-react'
import NotifButton from "./notif-button";
import { useSocket } from "@/api/Socket";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const { eventLogout } = useSocket()

  const navItems = [
    {name: 'Browse', href: '/browse'},
    {name: 'Chat', href: '/chat'},
    {name: 'Profile', href: '/profile'},
    {name: 'History', href: '/history'},
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    eventLogout()
    window.location.reload()
  }

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
          <div className="hidden sm:flex sm:items-center gap-3">
            <Button className="h-6 bg-red-500" onClick={handleLogout}>Logout</Button>
            <NotifButton />
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
              <Link
                key={item.name}
                to={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.name}
              </Link>
            ))}
          <div className="flex gap-3">
            <Button className="h-6 bg-red-500" onClick={handleLogout}>Logout</Button>
            <NotifButton />
          </div>
        </div>
      </div>
      
    </nav>
  )
}
