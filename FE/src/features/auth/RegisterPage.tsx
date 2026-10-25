import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { PasswordField } from '../../shared/ui/PasswordField'
import { FormError } from '../../shared/ui/FormError'
import { Logo } from '../../shared/ui/Logo'
import { authApi } from './authApi'
import { registerSchema, type RegisterForm } from './authSchemas'
import { useAuth } from './useAuth'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  // ?next= arriva dalla presentazione («Ho un codice invito»): solo percorsi interni, mai un altro sito («//…»), come nel login
  const next = params.get('next')
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
  const from = (location.state as { from?: string } | null)?.from ?? safeNext ?? '/trips'
  const withCode = safeNext?.startsWith('/join') ?? false
  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), defaultValues: { acceptedTerms: false } })
  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data)
      navigate(from, { replace: true })
    },
    onError: (err) => {
      // Gli errori di campo del backend finiscono sotto il campo giusto
      if (err instanceof ApiError) {
        for (const e of err.errors) setError(e.field as keyof RegisterForm, { message: e.message })
      }
    },
  })

  return (
    <section className="auth-page">
      <div className="auth-logo">
        <Logo size={64} />
        <h1>Crea il tuo account</h1>
        <p className="muted">Bastano un nome, un'email e una password.</p>
      </div>
      {withCode && (
        <p className="card invite-note">
          Hai un codice invito? Per entrare nel viaggio con un codice serve un account: ci vuole un minuto.
          Chi non vuole l'app è nel viaggio lo stesso: chi organizza lo aggiunge per nome.
        </p>
      )}
      <form className="card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <Field label="Nome" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} />
        <Field label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
        <PasswordField label="Password" autoComplete="new-password" hint="Almeno 8 caratteri, con una lettera e una cifra" error={errors.password?.message} {...register('password')} />
        <div className="terms">
          <label className="check">
            <input type="checkbox" aria-invalid={errors.acceptedTerms ? true : undefined} aria-describedby={errors.acceptedTerms ? 'terms-err' : undefined} {...register('acceptedTerms')} />
            <span>Accetto i <Link to="/termini">Termini e condizioni</Link> e ho letto l'<Link to="/privacy">Informativa sulla privacy</Link></span>
          </label>
          {errors.acceptedTerms && <p id="terms-err" className="field-error">{errors.acceptedTerms.message}</p>}
        </div>
        <FormError error={mutation.error} offlineMessage="Serve la rete per entrare" />
        <Button type="submit" needsNetwork={false} loading={mutation.isPending}>Registrati</Button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>
        Hai già un account? <Link to={safeNext ? `/login?next=${safeNext}` : '/login'} state={location.state}>Entra</Link>
      </p>
    </section>
  )
}
