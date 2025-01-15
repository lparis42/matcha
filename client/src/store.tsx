import { StateCreator, create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

interface Message {
  id: number;
  avatar: string;
  name: string;
  message: string;
}

interface User {
  id: number;
  gender: string;
  sexual_orientation: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: Date;
  biography: string;
  interests: string[];
  pictures: string[];
  location: string;
  fame_rating: number;
  avatar: string;
  messages: Message[];
  name: string;
  username: string;
  date_of_birth: string;
  online: boolean;
  last_connection: string;
  common_tags: number[];
  geolocation: {lat: number, lng: number};
}

interface ChatStore {
  usersstored: User[];

  setUsersstored: (users: User[]) => void;
  addUser: (user: User) => void;
  addMessage: (userId: number, message: Message) => void;
  receiveMessage: (message: string) =>void;
  removeUser: (userId: number) => void;

}

function transformData (item, state: User[]) {
  const [username, message] = item.split(':');
  const user = state.filter((user) => user.name === username)[0]
  const result = {
      id: user.messages.length,
      avatar: `https://${window.location.hostname}:2000/images/${user.pictures[0]}`,
      name: username,
      message: message
  };
  return result
}

const useChatStore = create<ChatStore>(
  
    (set) => ({
      usersstored: [],


      setUsersstored: (users: User[]) => {
        set({ usersstored : users });
      },
      addUser: (user: User) => {
        set((state) => ({
          usersstored: [...state.usersstored, user],
        }));
      },
      addMessage: (userId: number, message: Message) => {
        set((state) => {
          return ({usersstored: state.usersstored.map((user) =>
            user.id === userId
              ? ({ ...user, messages: [...user.messages, message] })
              : user
          )})
        });
      },
      receiveMessage: (receive: string) => {
        set((state) => {
          const message = transformData(receive, state.usersstored);
          return ({
            usersstored: state.usersstored.map((user) =>
              user.name === message.name
              ? ({ ...user, messages: [...user.messages, message] })
              : user
            ),
          })
        })
      },
      removeUser: (userId: number) => {
        set((state) => ({
          usersstored: state.usersstored.filter((user) => user.id !== userId),
        }));
      },
  }

));

export const useAccountStore = create(
  persist(
    combine(
      {
        account: null as undefined | null | User,
      },
      (set) => ({
        setAccount: (account: User | null) => set({ account }),
      })
    ),
    { name: "account" }
  )
);

export default useChatStore;

