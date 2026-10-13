import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../../shared/api/client'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
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
      <h1>Crea il tuo account</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <Field label="Nome" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} />
        <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <FormError error={mutation.error} />
        <Button type="submit" loading={mutation.isPending}>Registrati</Button>
      </form>
      <p>
        Hai già un account? <Link to="/login" state={location.state}>Entra</Link>
      </p>
    </section>
  )
}
