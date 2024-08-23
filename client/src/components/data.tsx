export const userData = [
    {
        id: 1,
        avatar: 'https://placehold.co/520x520',
        messages: [
            {
                id: 1,
                avatar: 'https://placehold.co/520x520',
                name: 'Jane Doe',
                message: 'Hey, Jakob',
            },
            {
                id: 2,
                avatar: '/LoggedInUser.jpg',
                name: 'Jakob Hoeg',
                message: 'Hey!',
            }
        ],
        name: 'Jane Doe',
    },
    {
        id: 2,
        avatar: 'https://placehold.co/520x520',
        name: 'John Doe',
    },
    {
        id: 3,
        avatar: 'https://placehold.co/520x520',
        name: 'Elizabeth Smith',
    },
    {
        id: 4,
        avatar: 'https://placehold.co/520x520',
        name: 'John Smith',
    }
];

export type UserData = (typeof userData)[number];

export const loggedInUserData = {
    id: 5,
    avatar: '/LoggedInUser.jpg',
    name: 'Jakob Hoeg',
};

export type LoggedInUserData = (typeof loggedInUserData);

export interface Message {
    id: number;
    avatar: string;
    name: string;
    message: string;
}

export interface User {
    id: number;
    avatar: string;
    messages: Message[];
    name: string;
}
