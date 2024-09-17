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
}

interface ChatStore {
  usersstored: User[];

  setUsersstored: (users: User[]) => void;
  addUser: (user: User) => void;
  addMessage: (userId: number, message: Message) => void;

  removeUser: (userId: number) => void;
}

const useChatStore = create(
  persist<ChatStore>(
    (set, get) => ({
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
        set((state) => ({
          usersstored: state.usersstored.map((user) =>
            user.id === userId
              ? { ...user, messages: [...user.messages, message] }
              : user
          ),
        }));
      },
      removeUser: (userId: number) => {
        set((state) => ({
          usersstored: state.usersstored.filter((user) => user.id !== userId),
        }));
      },
  }),
  {
    name: 'chat-storage',
    getStorage: () => localStorage
  }

));

export default useChatStore;
