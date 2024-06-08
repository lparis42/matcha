import { StateCreator, create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { socket } from "@/api/Socket";
import { io } from 'socket.io-client';

const useSocketStore = create(persist((set) => ({
    socket: null,
    connect: () => {
      set({ socket: socket });
    },
    disconnect: (state) => {
      const { socket } = state.socket;
      if (socket) {
        socket.disconnect();
        set({ socket: null });
      }
    },
  }), {name: 'socket'}));
  
  export default useSocketStore;
