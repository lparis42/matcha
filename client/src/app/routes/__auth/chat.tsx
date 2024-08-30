import { useSocket } from '@/api/Socket';
import { Chat } from '@/components/chat';
import { userData, Message, User } from '@/components/data';
import PreviewCard from '@/components/preview-card';
import { Sidebar } from '@/components/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

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
    const [users, setUsers] = React.useState(userData);
    const [selectedUser, setSelectedUser] = React.useState(userData[0]);
    const { eventChatHistories, eventChat, subListenChat } = useSocket()

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

    function sendLogic(target_account: number, message: string) {
      eventChat(target_account, message, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          console.log("retour", data)
        }
      })
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
          if (err) {
            console.error(err);
          } else {
            setHistories(data);
            data.map((user) => {
              users.push({
                id: user.account,
                avatar: `https://placehold.co/520x520`,
                messages: transformData(user.messages),
                name: "b2j1tm"
              })
            })
            setUsers(users)
            setSelectedUser(users[0])
            console.log(users[0])

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
        <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
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
          />
         : <></>}
         
        </ResizablePanel>
      </ResizablePanelGroup>
      </div>
      </main>
    );
};
