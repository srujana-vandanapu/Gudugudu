import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  AlertCircle, AlertTriangle, Bell, CalendarDays, ChevronRight, Info,
  IndianRupee, PiggyBank, Plus, Settings, TrendingDown, TrendingUp, Wallet
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const monthValue = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
const monthLabel = (month) => {
  const [year, monthIndex] = month.split('-').map(Number)
  return new Date(year, monthIndex - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}
const nextMonthValue = () => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return monthValue(date)
}
const toNumber = (value) => parseFloat(value || 0)

function AlertBadge({ alert }) {
  const cfg = {
    DANGER: { bg: 'rgba(230,95,115,0.10)', border: 'rgba(230,95,115,0.26)', icon: AlertCircle, color: '#e65f73' },
    WARNING: { bg: 'rgba(217,154,31,0.10)', border: 'rgba(217,154,31,0.26)', icon: AlertTriangle, color: '#d99a1f' },
    INFO: { bg: 'rgba(91,141,239,0.10)', border: 'rgba(91,141,239,0.26)', icon: Info, color: '#5b8def' },
  }[alert.type] || {}
  const Icon = cfg.icon

  return (
    <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <Icon size={16} color={cfg.color} className="mt-0.5 shrink-0" />
      <div>
        {alert.categoryIcon && <span className="mr-1">{alert.categoryIcon}</span>}
        <span>{alert.message}</span>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="card flex min-h-[118px] flex-col justify-between gap-2">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}22` }}>
          <Icon size={18} color={color} />
        </div>
        {trend !== undefined && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              background: trend >= 0 ? 'rgba(58,169,120,0.14)' : 'rgba(230,95,115,0.14)',
              color: trend >= 0 ? '#3aa978' : '#e65f73',
            }}
          >
            {trend >= 0 ? '+' : ''}{trend?.toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <div className="stat-number">{value}</div>
        <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
      </div>
      {sub && <div className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { user, updateBudget } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [budgetEdit, setBudgetEdit] = useState(false)
  const [newBudget, setNewBudget] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(monthValue())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [catRes, expRes] = await Promise.all([
        api.get('/categories'),
        api.get('/expenses'),
      ])
      const selectedExpenses = expRes.data.filter(exp => exp.expenseDate?.slice(0, 7) === selectedMonth)
      const monthlyBudget = toNumber(user?.monthlyBudget)
      const totalSpent = selectedExpenses.reduce((sum, exp) => sum + toNumber(exp.amount), 0)
      const remainingMoney = monthlyBudget - totalSpent
      const totalSaved = remainingMoney > 0 ? remainingMoney : 0
      const actualBudgetPct = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0

      const categories = catRes.data.map(cat => {
        const spent = selectedExpenses
          .filter(exp => exp.categoryId === cat.id)
          .reduce((sum, exp) => sum + toNumber(exp.amount), 0)
        const estimated = toNumber(cat.estimatedCost)
        const percentUsed = estimated > 0 ? (spent / estimated) * 100 : 0
        const alertThreshold = toNumber(cat.alertThreshold || 80)

        return {
          ...cat,
          spentThisMonth: spent,
          remainingBudget: estimated - spent,
          percentUsed,
          isOverBudget: percentUsed > 100,
          isNearAlert: percentUsed >= alertThreshold && percentUsed <= 100,
        }
      })

      const alerts = []
      if (actualBudgetPct >= 100 && monthlyBudget > 0) {
        alerts.push({ type: 'DANGER', message: 'You have exceeded your monthly budget!', percentUsed: actualBudgetPct })
      } else if (actualBudgetPct >= 80 && monthlyBudget > 0) {
        alerts.push({ type: 'WARNING', message: `You've used ${actualBudgetPct.toFixed(1)}% of your monthly budget`, percentUsed: actualBudgetPct })
      }
      categories.forEach(cat => {
        if (cat.isOverBudget) {
          alerts.push({
            type: 'DANGER',
            message: `Over budget in ${cat.name} by ${fmt(Math.abs(cat.remainingBudget))}`,
            categoryName: cat.name,
            categoryIcon: cat.icon,
            percentUsed: cat.percentUsed,
          })
        } else if (cat.isNearAlert) {
          alerts.push({
            type: 'WARNING',
            message: `${cat.percentUsed.toFixed(0)}% spent in ${cat.name}`,
            categoryName: cat.name,
            categoryIcon: cat.icon,
            percentUsed: cat.percentUsed,
          })
        }
      })

      setData({
        month: selectedMonth,
        monthlyBudget,
        totalSpent,
        totalSaved,
        remainingMoney,
        budgetUsedPercent: Math.min(actualBudgetPct, 100),
        categories,
        recentExpenses: selectedExpenses.slice(0, 10),
        alerts,
      })
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, user?.monthlyBudget])

  useEffect(() => { load() }, [load])

  const saveBudget = async () => {
    if (!newBudget || parseFloat(newBudget) <= 0) return toast.error('Enter a valid budget')
    try {
      await api.put('/budget', { monthlyBudget: parseFloat(newBudget) })
      updateBudget(parseFloat(newBudget))
      toast.success('Budget updated!')
      setBudgetEdit(false)
      load()
    } catch { toast.error('Failed to update budget') }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand)' }} />
      </div>
    )
  }

  const pieData = data?.categories?.filter(c => c.spentThisMonth > 0).map(c => ({
    name: c.name,
    value: parseFloat(c.spentThisMonth),
    color: c.color,
    icon: c.icon,
  })) || []

  const budgetPct = data?.budgetUsedPercent || 0
  const budgetColor = budgetPct >= 100 ? '#e65f73' : budgetPct >= 80 ? '#d99a1f' : '#9c5c9c'
  const now = new Date()
  const selectedMonthName = monthLabel(data?.month || selectedMonth)
  const isCurrentMonth = selectedMonth === monthValue()
  const isFutureMonth = selectedMonth > monthValue()

  return (
    <div className="mx-auto max-w-6xl space-y-5 fade-in">
      <div className="card dashboard-panel flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--muted)' }}>
            {selectedMonthName} overview {isFutureMonth ? '- fresh month' : isCurrentMonth ? '- current month' : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block">
            <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="month"
              className="input-field py-2 pl-9 text-sm"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </label>
          {isCurrentMonth && (
            <button
              type="button"
              onClick={() => setSelectedMonth(nextMonthValue())}
              className="btn-ghost whitespace-nowrap py-2"
            >
              Next month
            </button>
          )}
          <Link to="/expenses" className="btn-primary flex items-center justify-center gap-1.5 text-sm">
            <Plus size={15} /> Add Expense
          </Link>
        </div>
      </div>

      {data?.alerts?.length > 0 && (
        <div className="space-y-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Bell size={15} color="var(--warning)" /> Alerts
          </div>
          {data.alerts.map((a, i) => <AlertBadge key={i} alert={a} />)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Wallet} label="Monthly Budget" value={fmt(data?.monthlyBudget)} color="#9c5c9c" />
        <StatCard icon={TrendingDown} label="Total Spent" value={fmt(data?.totalSpent)} color="#e65f73" trend={-(budgetPct)} />
        <StatCard icon={PiggyBank} label="Saved" value={fmt(data?.totalSaved)} color="#3aa978" />
        <StatCard icon={TrendingUp} label="Remaining" value={fmt(data?.remainingMoney)} color="#5b8def" />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="card min-h-[252px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-display font-semibold">Monthly Budget Usage</div>
              <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                {fmt(data?.totalSpent)} of {fmt(data?.monthlyBudget)} spent in {selectedMonthName}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold" style={{ color: budgetColor }}>{budgetPct.toFixed(1)}%</span>
              <button onClick={() => { setBudgetEdit(!budgetEdit); setNewBudget(data?.monthlyBudget || '') }} className="btn-ghost px-3 py-1.5 text-xs">
                <Settings size={13} />
              </button>
            </div>
          </div>

          <div className="progress-bar">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetColor }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
            <span>0%</span>
            <span>Monthly limit</span>
            <span>100%</span>
          </div>
          <div className="mt-6 border-t pt-4 text-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="font-semibold" style={{ color: budgetColor }}>
              {budgetPct >= 100 ? 'Over budget' : budgetPct >= 80 ? 'Near limit' : 'On track'}
            </div>
            <div className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>
              {budgetPct >= 100 ? 'Spending crossed the monthly limit.' : budgetPct >= 80 ? 'A little careful spending from here.' : 'This month still looks comfortable.'}
            </div>
          </div>

          {budgetEdit && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field py-2 pl-8 text-sm" type="number" placeholder="New budget" value={newBudget} onChange={e => setNewBudget(e.target.value)} />
              </div>
              <button onClick={saveBudget} className="btn-primary px-4 py-2 text-sm">Save</button>
              <button onClick={() => setBudgetEdit(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="card min-h-[252px]">
          <div className="mb-4 font-display font-semibold">Spending by Category</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} innerRadius={46}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                    <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    {d.icon} {d.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-52 items-center justify-center text-sm" style={{ color: 'var(--muted)' }}>No spending data for this month</div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display font-semibold">Categories This Month</div>
          <Link to="/categories" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand)' }}>
            Manage <ChevronRight size={13} />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data?.categories?.map(cat => {
            const pct = Math.min(cat.percentUsed, 100)
            const barColor = cat.isOverBudget ? '#e65f73' : cat.isNearAlert ? '#d99a1f' : '#9c5c9c'
            return (
              <div key={cat.id} className="card flex items-start gap-3">
                <div className="text-2xl">{cat.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="truncate text-sm font-medium">{cat.name}</div>
                    <div className="font-mono text-xs font-medium" style={{ color: barColor }}>{pct.toFixed(0)}%</div>
                  </div>
                  <div className="progress-bar mb-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="flex justify-between gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                    <span>{fmt(cat.spentThisMonth)} spent</span>
                    <span>of {fmt(cat.estimatedCost)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {data?.recentExpenses?.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-display font-semibold">Recent Expenses</div>
            <Link to="/expenses" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--brand)' }}>
              See all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="card divide-y" style={{ '--tw-divide-color': 'var(--border)' }}>
            {data.recentExpenses.map(exp => (
              <div key={exp.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xl">{exp.categoryIcon}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{exp.title}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {exp.categoryName} - {new Date(exp.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div className="font-mono text-sm font-semibold" style={{ color: '#e65f73' }}>-{fmt(exp.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
