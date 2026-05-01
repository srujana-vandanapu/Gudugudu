import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, Edit3, IndianRupee, X, Calendar } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

function ExpenseModal({ expense, categories, onClose, onSave }) {
  const isEdit = !!expense?.id
  const [form, setForm] = useState({
    title: expense?.title || '',
    description: expense?.description || '',
    amount: expense?.amount || '',
    categoryId: expense?.categoryId || (categories[0]?.id || ''),
    expenseDate: expense?.expenseDate ? expense.expenseDate.slice(0, 16) : new Date().toISOString().slice(0, 16),
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/expenses/${expense.id}`, { ...form, amount: parseFloat(form.amount), categoryId: parseInt(form.categoryId) })
        toast.success('Expense updated!')
      } else {
        await api.post('/expenses', { ...form, amount: parseFloat(form.amount), categoryId: parseInt(form.categoryId) })
        toast.success('Expense added!')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md card slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">{isEdit ? 'Edit' : 'Add'} Expense</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--elevated)]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="e.g. Lunch at Café" value={form.title} onChange={set('title')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-8" type="number" placeholder="0" min="0" step="0.01" value={form.amount} onChange={set('amount')} required />
              </div>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.categoryId} onChange={set('categoryId')} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Date & Time</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
              <input className="input-field pl-8" type="datetime-local" value={form.expenseDate} onChange={set('expenseDate')} />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input-field" placeholder="Any notes..." value={form.description} onChange={set('description')} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Update' : 'Add Expense')}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | {} | expense
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  const load = useCallback(async () => {
    try {
      const [expRes, catRes] = await Promise.all([api.get('/expenses'), api.get('/categories')])
      setExpenses(expRes.data)
      setCategories(catRes.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteExpense = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await api.delete(`/expenses/${id}`)
      toast.success('Expense deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const filtered = expenses.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.categoryName?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || e.categoryId === parseInt(filterCat)
    return matchSearch && matchCat
  })

  const totalFiltered = filtered.reduce((s, e) => s + parseFloat(e.amount), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand)' }} />
    </div>
  }

  // Group by date
  const grouped = filtered.reduce((acc, exp) => {
    const d = new Date(exp.expenseDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    if (!acc[d]) acc[d] = []
    acc[d].push(exp)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Expenses</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{filtered.length} transactions • {fmt(totalFiltered)} total</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input className="input-field pl-9 py-2 text-sm" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field py-2 text-sm w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Expense list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">💸</div>
          <div className="font-semibold mb-1">No expenses yet</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Tap "Add" to record your first expense</div>
        </div>
      ) : (
        Object.entries(grouped).map(([date, exps]) => (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{date}</div>
              <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{fmt(exps.reduce((s, e) => s + parseFloat(e.amount), 0))}</div>
            </div>
            <div className="card divide-y p-0 overflow-hidden" style={{ padding: 0 }}>
              {exps.map(exp => (
                <div key={exp.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--elevated)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--elevated)' }}>
                    {exp.categoryIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{exp.title}</div>
                    <div className="text-xs mt-0.5 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium" style={{ background: 'var(--elevated)', color: 'var(--muted)' }}>{exp.categoryName}</span>
                      {exp.description && <span style={{ color: 'var(--muted)' }}>{exp.description}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="font-mono font-semibold text-sm" style={{ color: '#e65f73' }}>-{fmt(exp.amount)}</div>
                    <button onClick={() => setModal(exp)} className="p-1.5 rounded-lg hover:bg-[var(--brand-soft)] opacity-50 hover:opacity-100 transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => deleteExpense(exp.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 opacity-50 hover:opacity-100 transition-all" style={{ color: '#e65f73' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {modal !== null && (
        <ExpenseModal
          expense={modal.id ? modal : null}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
