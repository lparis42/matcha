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
  avatar: string;
  messages: Message[];
  name: string;
}

interface SocketStore {
  users: User[];
  addUser: (user: User) => void;
  addMessage: (userId: number, message: Message) => void;
}

const useSocketStore = create(
  persist<SocketStore>(
    (set, get) => ({
      users: [],

      addUser: (user: User) => {
        set((state) => ({
          users: [...state.users, user],
        }));
      },
      addMessage: (userId: number, message: Message) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? { ...user, messages: [...user.messages, message] }
              : user
          ),
        }));
      },
  }),
  {
    name: 'chat-storage',
    getStorage: () => localStorage
  }

));

export default useSocketStore;
