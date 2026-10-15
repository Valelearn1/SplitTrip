import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../../shared/api/client'
import type { User } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { useAuth } from '../auth/useAuth'
import { profileApi } from './profileApi'

const schema = z.object({
  displayName: z.string().trim().min(2, 'Almeno 2 caratteri').max(40, 'Al massimo 40 caratteri'),
  email: z.string().trim().email('Inserisci un indirizzo email valido'),
})
type Values = z.infer<typeof schema>

/** Nome ed email: la sessione aperta resta valida, il prossimo accesso usa i dati nuovi. */
export function ProfileDataSection({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: user.displayName, email: user.email },
  })
  const save = useMutation({
    mutationFn: profileApi.update,
    onSuccess: (u) => updateUser(u),
    onError: (err) => {
      if (err instanceof ApiError) for (const e of err.errors) setError(e.field as keyof Values, { message: e.message })
    },
  })
  const fieldErrors = save.error instanceof ApiError && save.error.errors.length > 0
  return (
    <form noValidate className="stack" onSubmit={handleSubmit((v) => save.mutate({ displayName: v.displayName, email: v.email }))}>
      <Field label="Nome" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} />
      <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      {!fieldErrors && <FormError error={save.error} />}
      {save.isSuccess && <p role="status" className="money-positive">Dati salvati</p>}
      <Button type="submit" loading={save.isPending}>Salva i dati</Button>
    </form>
  )
}
