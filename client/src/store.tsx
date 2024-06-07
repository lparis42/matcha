import {  create } from 'zustand'
import { persist } from 'zustand/middleware'

const socketioStore = create(
    persist(
        (set) => ({
            socket: null,
            setSocket: (socket) => set({ socket }),
        }),
        {
            name: 'authentification_token',
        }
    )
)
