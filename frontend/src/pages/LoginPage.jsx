import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import PigLogo from '../components/PigLogo'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ phoneNumber: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.phoneNumber.replace(/\D/g, ''), form.password)
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md slide-up">
        <div className="card auth-card">
          <div className="auth-brand flex flex-col items-center px-6 py-8 text-center">
            <div className="brand-badge mb-4 flex h-20 w-20 items-center justify-center rounded-3xl">
              <PigLogo size={56} />
            </div>
            <h1 className="font-display text-3xl font-bold">gudugudu</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>cant u track on paper okay fine use me atleast</p>
          </div>

          <div className="p-6">
          <h2 className="font-display font-semibold text-xl mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input
                  className="input-field pl-9"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10,15}"
                  placeholder="9876543210"
                  autoComplete="tel"
                  value={form.phoneNumber}
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input
                  className="input-field pl-9 pr-10"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
          New here?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--brand)' }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
