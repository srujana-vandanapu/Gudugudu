import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit3, X, IndianRupee, Bell } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const ICONS = ['🍓','🧁','🫧','🌷','🎀','✨','🏡','🎁','☁️','📚','🪴','🧸','🎮','☕','🌼','👗','💊','🎵','🍕','🛍️']
const COLORS = ['#9C5C9C','#E65F73','#F7B731','#5B8DEF','#3AA978','#B875B8','#F3A6C8','#82C6D9','#D99A1F','#7F437F','#6BBF9D','#C98BC9']

function CategoryModal({ cat, onClose, onSave }) {
  const isEdit = !!cat?.id
  const [form, setForm] = useState({
    name: cat?.name || '',
    icon: cat?.icon || '🎁',
    color: cat?.color || '#9C5C9C',
    estimatedCost: cat?.estimatedCost || '',
    alertThreshold: cat?.alertThreshold || 80,
  })
  const [saving, setSaving] = useState(false)

  const set = k => v => setForm({ ...form, [k]: v })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/categories/${cat.id}`, { ...form, estimatedCost: parseFloat(form.estimatedCost), alertThreshold: parseFloat(form.alertThreshold) })
        toast.success('Category updated!')
      } else {
        await api.post('/categories', { ...form, estimatedCost: parseFloat(form.estimatedCost), alertThreshold: parseFloat(form.alertThreshold) })
        toast.success('Category created!')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md card slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">{isEdit ? 'Edit' : 'New'} Category</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--elevated)]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Icon picker */}
          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => set('icon')(ic)}
                  className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
                  style={{ background: form.icon === ic ? 'var(--brand)' : 'var(--elevated)', transform: form.icon === ic ? 'scale(1.1)' : 'scale(1)' }}
                >{ic}</button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color')(c)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, transform: form.color === c ? 'scale(1.25)' : 'scale(1)', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Name</label>
            <input className="input-field" placeholder="e.g. Groceries" value={form.name} onChange={e => set('name')(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Estimated Budget (₹)</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-8" type="number" placeholder="0" min="0" value={form.estimatedCost} onChange={e => set('estimatedCost')(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Alert at (%)</label>
              <div className="relative">
                <Bell size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input className="input-field pl-8" type="number" placeholder="80" min="1" max="100" value={form.alertThreshold} onChange={e => set('alertThreshold')(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: `${form.color}18`, border: `1px solid ${form.color}44` }}>
            <div className="text-2xl">{form.icon}</div>
            <div>
              <div className="font-semibold text-sm">{form.name || 'Category Name'}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Budget: {fmt(form.estimatedCost)} • Alert at {form.alertThreshold}%</div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Update' : 'Create')}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch { toast.error('Failed to load categories') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? All linked expenses will also be removed.')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted')
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete') }
  }

  const totalBudget = categories.reduce((s, c) => s + parseFloat(c.estimatedCost), 0)
  const totalSpent = categories.reduce((s, c) => s + parseFloat(c.spentThisMonth), 0)

  if (loading) return <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand)' }} />
  </div>

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Categories</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {fmt(totalSpent)} spent of {fmt(totalBudget)} total budget
          </p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} /> New
        </button>
      </div>

      <div className="grid gap-3">
        {categories.map(cat => {
          const pct = Math.min(cat.percentUsed, 100)
          const barColor = cat.isOverBudget ? '#e65f73' : cat.isNearAlert ? '#d99a1f' : cat.color
          return (
            <div key={cat.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${cat.color}22` }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-semibold">{cat.name}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal(cat)} className="p-1.5 rounded-lg hover:bg-[var(--brand-soft)] opacity-60 hover:opacity-100 transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 opacity-60 hover:opacity-100 transition-all" style={{ color: '#e65f73' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--muted)' }}>
                    <span>Budget: <strong style={{ color: 'var(--text)' }}>{fmt(cat.estimatedCost)}</strong></span>
                    <span>Alert: {cat.alertThreshold}%</span>
                    {cat.isOverBudget && <span className="text-[#e65f73] font-semibold">Over budget!</span>}
                    {cat.isNearAlert && !cat.isOverBudget && <span className="text-[#d99a1f] font-semibold">Near limit</span>}
                  </div>

                  <div className="progress-bar mb-2">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)' }}>{fmt(cat.spentThisMonth)} spent this month</span>
                    <span className="font-mono font-semibold" style={{ color: barColor }}>{pct.toFixed(0)}%</span>
                  </div>

                  {cat.remainingBudget >= 0 ? (
                    <div className="text-xs mt-1" style={{ color: '#3aa978' }}>↑ {fmt(cat.remainingBudget)} remaining</div>
                  ) : (
                    <div className="text-xs mt-1" style={{ color: '#e65f73' }}>↓ {fmt(Math.abs(cat.remainingBudget))} over budget</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modal !== null && (
        <CategoryModal
          cat={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}

