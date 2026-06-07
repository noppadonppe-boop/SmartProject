import { useState } from 'react'
import { ListTree, CalendarClock, CheckCircle2, Flag } from 'lucide-react'
import Modal, { Field, inputCls } from './Modal'
import { showAlert } from './GlobalDialog'

const empty = {
  wbsCode: '',
  taskName: '',
  group: 'civil',
  weight: 0,
  planStartDate: '',
  planEndDate: '',
  planProgress: 0,
  actualStartDate: '',
  actualEndDate: '',
  actualProgress: 0,
  milestone: false,
  resource: '',
  taskNote: '',
  dependencies: [],
  isHeader: false,
}

const GROUPS = [
  { value: 'eng', label: 'Engineering & Procurement' },
  { value: 'civil', label: 'Local Construction' },
  { value: 'equip', label: 'Equipment for Installation' },
  { value: 'commission', label: 'Commissioning' },
]

const getNextWbsCode = (allTasks, parentWbs) => {
  if (!parentWbs) {
    let max = 0
    allTasks.forEach(t => {
      const p = (t.wbsCode || '').split('.')
      if (p.length === 1 && !isNaN(p[0])) max = Math.max(max, parseInt(p[0], 10))
    })
    return String(max + 1)
  }
  let max = 0
  const prefix = parentWbs + '.'
  allTasks.forEach(t => {
    if (t.wbsCode?.startsWith(prefix)) {
      const suffix = t.wbsCode.substring(prefix.length)
      const firstNum = suffix.split('.')[0]
      if (!isNaN(firstNum)) max = Math.max(max, parseInt(firstNum, 10))
    }
  })
  return `${parentWbs}.${max + 1}`
}

export default function TaskModal({ task, tasks, onClose, onSave }) {
  const existingCategories = (tasks || [])
    .filter(t => t.isHeader)
    .sort((a, b) => (a.wbsCode || '').localeCompare(b.wbsCode || '', undefined, { numeric: true }))

  const defaultParentWbs = existingCategories.length > 0 ? existingCategories[existingCategories.length - 1].wbsCode : ''

  const [selectedParentWbs, setSelectedParentWbs] = useState(() => {
    if (task) {
      if (task.isHeader) return ''
      const parts = (task.wbsCode || '').split('.')
      if (parts.length > 1) {
        parts.pop()
        return parts.join('.')
      }
      return ''
    }
    return defaultParentWbs
  })

  const [form, setForm] = useState(() => {
    if (task) return { ...empty, ...task }
    return { ...empty, wbsCode: getNextWbsCode(tasks || [], defaultParentWbs) }
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const num = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))

  const handleParentChange = (e) => {
    const parentWbs = e.target.value
    setSelectedParentWbs(parentWbs)
    setForm(f => ({ ...f, wbsCode: getNextWbsCode(tasks || [], parentWbs) }))
  }

  const handleIsHeaderChange = (e) => {
    const isH = e.target.checked
    setForm(f => ({ 
      ...f, 
      isHeader: isH,
      wbsCode: isH ? getNextWbsCode(tasks || [], '') : getNextWbsCode(tasks || [], selectedParentWbs)
    }))
  }

  const submit = async () => {
    if (!form.taskName.trim()) return
    if (form.wbsCode && tasks?.some(t => t.id !== task?.id && t.wbsCode === form.wbsCode)) {
      await showAlert(`WBS Code "${form.wbsCode}" is already in use. Please use a unique code (e.g. 5.1, 5.2).`, 'Duplicate WBS Code', 'error')
      return
    }
    try {
      const res = await onSave({ ...form, isHeader: form.isHeader || form.group === 'header' }, task?.id)
      if (res === false) return
      onClose()
    } catch (err) {
      await showAlert(err.message, 'Error', 'error')
    }
  }

  return (
    <Modal
      title={task ? 'Edit Task' : 'New Task'}
      subtitle="WBS task with separate Planning and Actual tracking"
      icon={ListTree}
      maxWidth="max-w-3xl"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">
            Cancel
          </button>
          <button onClick={submit} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* General */}
        <div className="grid grid-cols-12 gap-4">
          <Field 
            label={
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={!!form.isHeader}
                  onChange={handleIsHeaderChange}
                />
                Category
              </label>
            } 
            className="col-span-12"
          >
            {form.isHeader ? (
              <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center h-10">
                Main Category (WBS code will be auto-generated as a main sequence)
              </div>
            ) : (
              <select className={inputCls} value={selectedParentWbs} onChange={handleParentChange}>
                <option value="">-- No Parent (Top Level) --</option>
                {existingCategories.map(cat => (
                  <option key={cat.id} value={cat.wbsCode}>{cat.wbsCode} - {cat.taskName}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="WBS Code" className="col-span-3">
            <input className={inputCls} value={form.wbsCode} onChange={set('wbsCode')} placeholder="2.1" />
          </Field>
          <Field label="Task Name *" className="col-span-9">
            <input className={inputCls} value={form.taskName} onChange={set('taskName')} placeholder="Civil work…" />
          </Field>
          <Field label="Work Group" className="col-span-5">
            <select className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.group} onChange={set('group')} disabled={form.isHeader}>
              {GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Weight (%)" className="col-span-3">
            <input 
              type="number" step="0.01" 
              className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} 
              value={form.weight} onChange={num('weight')} 
              disabled={form.isHeader} 
            />
          </Field>
          <Field label="Resource" className="col-span-4">
            <input 
              className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} 
              value={form.resource} onChange={set('resource')} placeholder="Crew / Vendor" 
              disabled={form.isHeader} 
            />
          </Field>
        </div>

        {/* Planning */}
        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-3">
            <CalendarClock size={16} /> Planning (Scheduled)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Plan Start">
              <input type="date" className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.planStartDate || ''} onChange={set('planStartDate')} disabled={form.isHeader} />
            </Field>
            <Field label="Plan End">
              <input type="date" className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.planEndDate || ''} onChange={set('planEndDate')} disabled={form.isHeader} />
            </Field>
            <Field label="Plan Progress (%)">
              <input type="number" min="0" max="100" className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.planProgress} onChange={num('planProgress')} disabled={form.isHeader} />
            </Field>
          </div>
        </section>

        {/* Actual */}
        <section className="rounded-xl border border-red-200 bg-red-50/50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-3">
            <CheckCircle2 size={16} /> Actual (Realized)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Actual Start">
              <input type="date" className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.actualStartDate || ''} onChange={set('actualStartDate')} disabled={form.isHeader} />
            </Field>
            <Field label="Actual End">
              <input type="date" className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.actualEndDate || ''} onChange={set('actualEndDate')} disabled={form.isHeader} />
            </Field>
            <Field label="Actual % Complete">
              <input type="number" min="0" max="100" className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.actualProgress} onChange={num('actualProgress')} disabled={form.isHeader} />
            </Field>
          </div>
        </section>

        {/* Extra */}
        <div className="grid grid-cols-12 gap-4 items-end">
          <label className="col-span-4 flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
            <input
              type="checkbox"
              checked={!!form.milestone}
              onChange={(e) => setForm((f) => ({ ...f, milestone: e.target.checked }))}
            />
            <Flag size={15} className="text-amber-500" /> Milestone
          </label>
          <Field label="Task Note" className="col-span-8">
            <input className={`${inputCls} ${form.isHeader ? 'bg-slate-100 text-slate-400' : ''}`} value={form.taskNote} onChange={set('taskNote')} placeholder="e.g. Local purchase / Install" disabled={form.isHeader} />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
