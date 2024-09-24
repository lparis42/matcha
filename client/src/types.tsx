import { z } from 'zod'
import { constants } from './constants'

export const register = z.object({
    first_name: z.string().min(2, {
        message: "Fisrt Name must be at least 2 characters.",
      }).max(35).regex(/^[A-Za-z]+$/, { message: "First Name must contain only letters." }),
    last_name: z.string().min(2, {
        message: "Last Name must be at least 2 characters.",
      }).max(35).regex(/^[A-Za-z]+$/, { message: "First Name must contain only letters." }),
    email: z.string().min(6).max(50).email(),
    password: z.string().min(8).max(20),
    username: z.string().min(4).max(20),
})

export const login = z.object({
    email: z.string().min(6).max(50).email(),
    password: z.string().max(60)
})


//const editable_fields = ['first_name', 'last_name', 'email', 'date_of_birth', 'gender', 'sexual_orientation', 'biography', 'interests', 'pictures', 'geolocation'];

export const profile = z.object({
    first_name: z.string().min(2, {
        message: "Fisrt Name must be at least 2 characters.",
      }).max(35),
    last_name: z.string().min(2, {
        message: "Last Name must be at least 2 characters.",
      }).max(35),
    email: z.string().min(6).max(50).email(),
    date_of_birth: z.date(),
    gender: z.string(z.enum(constants.genders)),
    sexual_orientation: z.string(z.enum(constants.sexual_orientations)),
    biography: z.string().min(1).max(255),
    common_tags: z.array(z.string(z.enum(constants.interests))).min(1),
    pictures: z.array(z.union([z.string(), z.null()])).max(5),
    geolocation: z.object({
        lat: z.number(),
        lng: z.number()
    })
})

