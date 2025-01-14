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
    password: z.string().min(8).max(20)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/,
      "Password must contain at least one digit, one uppercase letter, and one lowercase letter"),
    username: z.string().min(4).max(20),
})

export const login = z.object({
    email: z.string().min(6).max(50).email(),
    password: z.string().max(20)
})

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
    biography: z.string().max(255).optional(),
    common_tags: z.array(z.string(z.enum(constants.interests))).optional(),
    pictures: z.array(z.union([z.string(), z.null()])).max(5),
    geolocation: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional()
})

export enum AuthStatus {
  Unknown,
  Authenticated,
  Guest,
}
