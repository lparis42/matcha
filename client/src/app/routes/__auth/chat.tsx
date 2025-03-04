import { useSocket } from '@/api/Socket';
import { Chat } from '@/components/chat';
import ChatProfileCard from '@/components/chat-profile-card';
import { userData, Message, User } from '@/components/data';
import { Sidebar } from '@/components/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { toast } from '@/components/ui/use-toast';
import { useAccount } from '@/hook/useAccount';
import { cn } from '@/lib/utils';
import useChatStore from '@/store';
import React, { useEffect, useState } from 'react';

const DATA = [
    {
      "id": 0,
      "username": "hxkvdy",
      "first_name": "User",
      "last_name": "hxkvdy",
      "date_of_birth": "1990-01-01",
      "gender": "Male",
      "sexual_orientation": "Heterosexual",
      "biography": "This is a test biography for hxkvdy.",
      "common_tags": [1, 2, 4],
      "pictures": ["1_1722959364213_0.WebP"],
      "fame_rating": 1,
      "geolocation": [40.7128, -74.0060],
      "location": "New York, USA",
      "online": false,
      "last_connection": "2024-09-07T17:45:36.622Z"
  },
]

interface ChatLayoutProps {
    defaultLayout: number[] | undefined;
    defaultCollapsed?: boolean;
    navCollapsedSize: number;
  }

export function Component ({
    defaultLayout = [320, 480],
    defaultCollapsed = false,
    navCollapsedSize,
  }: ChatLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const { eventChatHistories, eventChat, eventView } = useSocket()
    const { account: user } = useAccount();
    const [ifViewProfile, setIfViewProfile] = useState(false)

    const {usersstored, setUsersstored, addMessage} = useChatStore();

    function transformData(data: string[], profile): Message[] {
      const transformed: Message[] = [];
      data.forEach((item, index) => {
          const [username, message] = item.split(':');
          transformed.push({
              id: index,
              avatar: username === user.username ? `https://${window.location.hostname}:2000/images/${user.pictures[0]}` : `https://localhost:2000/images/${profile.pictures[0]}`,
              name: username,
              message: message
          });
      });
  
      return transformed;
    }

    async function sendLogic(target_account: number, message: string) {
      const [err, data] = await eventChat(target_account, message)
      if (!err)
        addMessage(target_account, {
          id: selectedUser.messages.length,
          avatar: user.pictures[0] ? `https://${window.location.hostname}:2000/images/${user.pictures[0]}` : '',
          message: message,
          name: user.username
        })
    }

    useEffect(() => {
      const fetch_chat_histories = async () => {
        const [err, data] = await eventChatHistories();

        const users = []
        const set_users = async () => {
          await Promise.all(
            data.map(async (user) => {
              const [err, profile] = await eventView(user.account)
              if (profile) {
                users.push({
                  id: user.account,
                  avatar: `https://${window.location.hostname}:2000/images/${profile.pictures[0]}`,
                  messages: transformData(user.messages, profile),
                  name: profile.username,
                  ...profile
                })
              }
            })
          );
          setUsersstored(users)
          setSelectedUser(users[0])
        }

        if (err) {
          toast({title: err.message})
        } else {
          await set_users()
        }
      }

      fetch_chat_histories();

      const checkScreenWidth = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      // Initial check
      checkScreenWidth();
  
      // Event listener for screen width changes
      window.addEventListener("resize", checkScreenWidth);
  
      // Cleanup the event listener on component unmount
      return () => {
        window.removeEventListener("resize", checkScreenWidth);
      };
    }, []);

    useEffect(()=>{
      if (selectedUser) {
        const updatedUser = usersstored.find(user => user.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    }, [usersstored])

    return (
        <main className="flex h-[calc(100dvh)] flex-col items-center justify-center lg:p-4 md:px-24 lg:py-32 gap-4 sm:p-0 sm:py-0">
            <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex">
        <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={isMobile ? 0 : 24}
          maxSize={isMobile ? 8 : 30}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`;
          }}
          className={cn(
            isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out"
          )}
        >
            <Sidebar
              isCollapsed={isCollapsed || isMobile}
              links={usersstored.map((user) => ({
                ...user,
                variant: "ghost",
              }))}
              onSelect={(user) => {
                setSelectedUser(user)
              }}
              isMobile={isMobile}
            />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          {selectedUser ?
          <Chat
            selectedUser={selectedUser}
            isMobile={isMobile}
            sendLogics={sendLogic}
            toggleViewProfile={() => setIfViewProfile(!ifViewProfile)}
          />
         : <></>}
        </ResizablePanel>
        {ifViewProfile &&
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={20} maxSize={30} style={{overflow: 'scroll'}}>
            <ChatProfileCard items={selectedUser}/>
          </ResizablePanel>
        }
      </ResizablePanelGroup>
      </div>
      </main>
    );
};
