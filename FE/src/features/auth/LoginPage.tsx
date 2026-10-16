import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Logo } from '../../shared/ui/Logo'
import { authApi } from './authApi'
import { loginSchema, type LoginForm } from './authSchemas'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  // ?next= arriva dalla pagina di presentazione: solo percorsi interni, mai un altro sito («//…»)
  const next = params.get('next')
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
  const from = (location.state as { from?: string } | null)?.from ?? safeNext ?? '/trips'
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data)
      navigate(from, { replace: true })
    },
  })

  return (
    <section className="auth-page">
      <div className="auth-logo">
        <Logo size={64} />
        <h1>Bentornata su SplitTrip</h1>
        <p className="muted">Spese divise, conti chiari.</p>
      </div>
      <form className="card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <Field label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
        <Field label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <FormError error={mutation.error} />
        <Button type="submit" loading={mutation.isPending}>Entra</Button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>
        Prima volta qui? <Link to="/register" state={location.state}>Crea un account</Link>
      </p>
    </section>
  )
}
