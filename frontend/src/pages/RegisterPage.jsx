import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, Lock, User, IndianRupee, ArrowRight, Eye, EyeOff } from 'lucide-react'
import PigLogo from '../components/PigLogo'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phoneNumber: '', password: '', monthlyBudget: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({
        ...form,
        monthlyBudget: form.monthlyBudget ? parseFloat(form.monthlyBudget) : 0
      })
      toast.success('Account created! Welcome to gudugudu')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md slide-up">
        <div className="card auth-card">
          <div className="auth-brand flex flex-col items-center px-6 py-7 text-center">
            <div className="brand-badge mb-4 flex h-20 w-20 items-center justify-center rounded-3xl">
              <PigLogo size={56} />
            </div>
            <h1 className="font-display text-3xl font-bold">gudugudu</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Create your account</p>
          </div>

          <div className="p-6">
          <h2 className="font-display font-semibold text-xl mb-6">Get started</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-9" type="text" placeholder="Rahul Sharma" autoComplete="name" value={form.name} onChange={set('name')} required />
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-9" type="tel" placeholder="9876543210" autoComplete="tel" value={form.phoneNumber} onChange={set('phoneNumber')} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-9 pr-10" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password" value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Monthly Budget (₹) — Optional</label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-9" type="number" placeholder="e.g. 30000" value={form.monthlyBudget} onChange={set('monthlyBudget')} min="0" />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>You can set or change this later</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
