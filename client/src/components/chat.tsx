import { Message, UserData } from "./data";
import ChatTopbar from "./chat-topbar.tsx";
import { ChatList } from "./chat-list.tsx";
import React, { useEffect } from "react";
import { Button } from "./ui/button.tsx";
import PreviewCard from "./preview-card.tsx";

interface ChatProps {
  selectedUser: UserData;
  isMobile: boolean;
  sendLogics: Function;
  toggleViewProfile: Function;
}

export function Chat({ selectedUser, isMobile, sendLogics, toggleViewProfile }: ChatProps) {

  const [messagesState, setMessages] = React.useState<Message[]>(selectedUser.messages ?? []);

  useEffect(() => {
    setMessages(selectedUser.messages)
  }, [selectedUser]);

  const sendMessage = (newMessage: Message) => {
    sendLogics(selectedUser.id, newMessage.message)
  };

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar selectedUser={selectedUser} />
      <Button variant="secondary" onClick={() => toggleViewProfile()}>
        <h1>View profile</h1>
      </Button>
      <ChatList
        messages={messagesState}
        selectedUser={selectedUser}
        sendMessage={sendMessage}
        isMobile={isMobile}
      />
    </div>
  );
}
