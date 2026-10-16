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

export const forgotSchema = z.object({
  email: z.string().trim().email('Inserisci un indirizzo email valido'),
})

/** Nuova password: stesse regole della registrazione, scritta due volte. */
export const resetSchema = z
  .object({ newPassword: registerSchema.shape.password, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { message: 'Le due password non coincidono', path: ['confirm'] })

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ForgotForm = z.infer<typeof forgotSchema>
export type ResetForm = z.infer<typeof resetSchema>
