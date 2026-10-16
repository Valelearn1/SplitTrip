import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
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
  const from = (location.state as { from?: string } | null)?.from ?? '/trips'
  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })
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
      <form className="card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <Field label="Nome" autoComplete="name" placeholder="Come ti chiamano gli amici" error={errors.displayName?.message} {...register('displayName')} />
        <Field label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
        <PasswordField label="Password" autoComplete="new-password" placeholder="Almeno 8 caratteri, una lettera e una cifra" error={errors.password?.message} {...register('password')} />
        <FormError error={mutation.error} />
        <Button type="submit" loading={mutation.isPending}>Registrati</Button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>
        Hai già un account? <Link to="/login" state={location.state}>Entra</Link>
      </p>
    </section>
  )
}
