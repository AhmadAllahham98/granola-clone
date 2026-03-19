import { Link } from 'react-router-dom'
import LoginForm from './LoginForm.tsx'
import RegisterForm from './RegisterForm.tsx'

type Props = {
  mode: 'login' | 'register'
}

function AuthPage({ mode }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded-xl">

        <h1 className="text-2xl font-bold text-text mb-6">Granola Notes</h1>

        {mode === 'login' ? <LoginForm /> : <RegisterForm />}

        <p className="mt-4 text-sm text-muted text-center">
          {mode === 'login' ? (
            <>Don't have an account?{' '}<Link to="/register" className="text-accent hover:underline">Sign up</Link></>
          ) : (
            <>Already have an account?{' '}<Link to="/login" className="text-accent hover:underline">Log in</Link></>
          )}
        </p>
      </div>
    </div>
  )
}

export default AuthPage
