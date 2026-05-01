import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Gift, IndianRupee, LogOut, Sparkles } from 'lucide-react'
import PigLogo from './PigLogo'

const navItems = [
  { to: '/', icon: Sparkles, label: 'Dashboard', exact: true },
  { to: '/expenses', icon: IndianRupee, label: 'Expenses' },
  { to: '/categories', icon: Gift, label: 'Categories' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
            <PigLogo size={24} />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>gudugudu</span>
        </div>

        {/* User info */}
        <div className="mb-8 px-3 py-3 rounded-xl" style={{ background: 'var(--elevated)' }}>
          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted)' }}>Welcome back</div>
          <div className="font-semibold text-sm truncate">{user?.name}</div>
          <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--muted)' }}>+{user?.phoneNumber}</div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'hover:bg-[var(--elevated)]'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--muted)' }
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium mt-4 transition-all hover:bg-red-500/10"
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 sticky top-0 z-10 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
              <PigLogo size={19} />
            </div>
            <span className="font-display font-bold" style={{ color: 'var(--text)' }}>gudugudu</span>
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{user?.name}</div>
        </div>

        <div className="px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-20" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-all"
            style={({ isActive }) => ({ color: isActive ? 'var(--brand)' : 'var(--muted)' })}
          >
            <Icon size={20} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium"
          style={{ color: 'var(--muted)' }}
        >
          <LogOut size={20} strokeWidth={2} />
          Logout
        </button>
      </nav>
    </div>
  )
}
