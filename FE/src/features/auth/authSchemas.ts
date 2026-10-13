import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Inserisci un indirizzo email valido'),
  password: z.string().min(1, 'Inserisci la password'),
})

export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Almeno 2 caratteri').max(40, 'Al massimo 40 caratteri'),
  email: z.string().trim().email('Inserisci un indirizzo email valido'),
  password: z
    .string()
    .min(8, 'Almeno 8 caratteri')
    .max(72, 'Al massimo 72 caratteri')
    .regex(/[A-Za-z]/, 'Serve almeno una lettera')
    .regex(/\d/, 'Serve almeno una cifra'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
