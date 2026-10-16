import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Logo } from '../../shared/ui/Logo'
import { PasswordField } from '../../shared/ui/PasswordField'
import { authApi } from './authApi'
import { resetSchema, type ResetForm } from './authSchemas'

function InvalidLink() {
  return (
    <div className="card info-card" role="alert">
      <Icon name="link_off" />
      <p>Link non valido o scaduto</p>
      <Link to="/password-dimenticata" className="btn btn-secondary">Chiedi un nuovo link</Link>
    </div>
  )
}

/** Il link dell'email (D-61): nuova password scritta due volte, con l'occhiolino; il token è monouso e vale 30 minuti. */
export function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token') ?? ''
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })
  const mutation = useMutation({ mutationFn: (v: ResetForm) => authApi.confirmReset(token, v.newPassword) })
  const expired = mutation.error instanceof ApiError && mutation.error.status === 400 && mutation.error.errors.length === 0
  return (
    <section className="auth-page">
      <div className="auth-logo">
        <Logo size={64} />
        <h1>Nuova password</h1>
      </div>
      {!token || expired ? <InvalidLink /> : mutation.isSuccess ? (
        <div className="card info-card" role="status">
          <Icon name="check_circle" />
          <p>Password cambiata</p>
          <Link to="/login" className="btn btn-primary">Accedi</Link>
        </div>
      ) : (
        <form className="card" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <PasswordField label="Nuova password" autoComplete="new-password" placeholder="Almeno 8 caratteri, una lettera e una cifra"
            error={errors.newPassword?.message} {...register('newPassword')} />
          <PasswordField label="Conferma la nuova password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
          <FormError error={mutation.error} />
          <Button type="submit" loading={mutation.isPending}>Cambia password</Button>
        </form>
      )}
      <p className="muted" style={{ textAlign: 'center' }}><Link to="/login">Torna all'accesso</Link></p>
    </section>
  )
}
