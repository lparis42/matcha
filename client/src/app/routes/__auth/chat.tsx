import { useSocket } from '@/api/Socket';
import { Chat } from '@/components/chat';
import ChatProfileCard from '@/components/chat-profile-card';
import { userData, Message, User } from '@/components/data';
import { Sidebar } from '@/components/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
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
    const [histories, setHistories] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const { eventChatHistories, eventChat, subListenChat, eventView } = useSocket()
    const [ifViewProfile, setIfViewProfile] = useState(false)

    const {usersstored, setUsersstored} = useChatStore();

    function transformData(data: string[]): Message[] {
      const transformed: Message[] = [];
  
      data.forEach((item, index) => {
          const [username, message] = item.split(':');
          transformed.push({
              id: index + 1,
              avatar: `https://placehold.co/520x520`,
              name: username,
              message: message
          });
      });
  
      return transformed;
    }

    async function sendLogic(target_account: number, message: string) {
      const [err, data] = await eventChat(target_account, message)
      return data;
    }

    function receiveLogic(message: string) {
      if (selectedUser === null)
        {
          console.log('selectedUser', selectedUser)
          return
        }
          
        const test = []
        test.push(message)
        const transformed = transformData(test)
        console.log("subListen", transformed)
        setSelectedUser(selectedUser => {
          selectedUser.messages.push(transformed[0])
        })
        console.log(selectedUser)
    }

    useEffect(() => {
      eventChatHistories((err, data: any[]) => {

          const set_users = async () => {
            await Promise.all(
              data.map(async (user) => {
                const [err, profile] = await eventView(user.account)
                if (profile) {
                  users.push({
                    id: user.account,
                    avatar: `https://localhost:2000/images/${profile.pictures[0]}`,
                    messages: transformData(user.messages),
                    name: profile.username,
                    ...profile
                  })
                }
              })
            );
            setUsers(users)
            setUsersstored(users)
            setSelectedUser(users[0])
            console.log(users)
          }

          if (err) {
            console.error(err);
          } else {
            setHistories(data);
            set_users()
          }
      })
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

    useEffect(() => {
      // subListenChat((err, data) => {
      //   if (err) {
      //     console.error(err);
      //   } else {
      //     receiveLogic(data.message)
      //   }
      // })
    }, [selectedUser])

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
              links={users.map((user) => ({
                name: user.name,
                messages: [],
                avatar: user.avatar,
                variant: selectedUser.name === user.name ? "grey" : "ghost",
              }))}
              isMobile={isMobile}
            />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          {selectedUser ?
          <Chat
            //messages={selectedUser.messages}
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
