import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { registerSchema } from '../auth/authSchemas'
import { profileApi } from './profileApi'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Inserisci la password attuale'),
    newPassword: registerSchema.shape.password, // stesse regole della registrazione
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { message: 'Le due password non coincidono', path: ['confirm'] })
type Values = z.infer<typeof schema>

/** Cambio password: serve quella attuale; le altre sessioni restano aperte fino alla scadenza del token. */
export function PasswordSection() {
  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })
  const change = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => reset({ currentPassword: '', newPassword: '', confirm: '' }),
    onError: (err) => {
      if (err instanceof ApiError) for (const e of err.errors) setError(e.field as keyof Values, { message: e.message })
    },
  })
  const fieldErrors = change.error instanceof ApiError && change.error.errors.length > 0
  return (
    <form noValidate className="stack" onSubmit={handleSubmit((v) => change.mutate({ currentPassword: v.currentPassword, newPassword: v.newPassword }))}>
      <Field label="Password attuale" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
      <Field label="Nuova password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
      <Field label="Conferma la nuova password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
      <p className="muted hint">Almeno 8 caratteri, con almeno una lettera e una cifra.</p>
      {!fieldErrors && <FormError error={change.error} />}
      {change.isSuccess && <p role="status" className="money-positive">Password cambiata</p>}
      <Button type="submit" loading={change.isPending}>Cambia password</Button>
    </form>
  )
}
