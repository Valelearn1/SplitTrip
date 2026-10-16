import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Logo } from '../../shared/ui/Logo'
import { authApi } from './authApi'
import { forgotSchema, type ForgotForm } from './authSchemas'

/** Password dimenticata (D-61): lo stesso messaggio per qualsiasi email, così nessuno scopre chi è registrato. */
export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) })
  const mutation = useMutation({ mutationFn: (v: ForgotForm) => authApi.requestReset(v.email) })
  return (
    <section className="auth-page">
      <div className="auth-logo">
        <Logo size={64} />
        <h1>Password dimenticata</h1>
        <p className="muted">Ti mandiamo un link per sceglierne una nuova.</p>
      </div>
      {mutation.isSuccess ? (
        <div className="card info-card" role="status">
          <Icon name="mark_email_read" />
          <p>Se l'indirizzo è registrato ti abbiamo scritto: controlla anche lo spam.</p>
          <small className="muted">Il link vale 30 minuti.</small>
        </div>
      ) : (
        <form className="card" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <Field label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
          <FormError error={mutation.error} />
          <Button type="submit" loading={mutation.isPending}>Mandami il link</Button>
        </form>
      )}
      <p className="muted" style={{ textAlign: 'center' }}><Link to="/login">Torna all'accesso</Link></p>
    </section>
  )
}
