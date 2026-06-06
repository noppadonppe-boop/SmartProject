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
}

const GROUPS = [
  { value: 'eng', label: 'Engineering & Procurement' },
  { value: 'civil', label: 'Local Construction' },
  { value: 'equip', label: 'Equipment for Installation' },
  { value: 'commission', label: 'Commissioning' },
]

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? { ...empty, ...task } : empty)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const num = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))

  const submit = async () => {
    if (!form.taskName.trim()) return
    try {
      const res = await onSave({ ...form, isHeader: form.group === 'header' }, task?.id)
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
          <Field label="WBS Code" className="col-span-3">
            <input className={inputCls} value={form.wbsCode} onChange={set('wbsCode')} placeholder="2.1" />
          </Field>
          <Field label="Task Name *" className="col-span-9">
            <input className={inputCls} value={form.taskName} onChange={set('taskName')} placeholder="Civil work…" />
          </Field>
          <Field label="Category" className="col-span-5">
            <select className={inputCls} value={form.group} onChange={set('group')}>
              {GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Weight (%)" className="col-span-3">
            <input type="number" step="0.01" className={inputCls} value={form.weight} onChange={num('weight')} />
          </Field>
          <Field label="Resource" className="col-span-4">
            <input className={inputCls} value={form.resource} onChange={set('resource')} placeholder="Crew / Vendor" />
          </Field>
        </div>

        {/* Planning */}
        <section className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-3">
            <CalendarClock size={16} /> Planning (Scheduled)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Plan Start">
              <input type="date" className={inputCls} value={form.planStartDate || ''} onChange={set('planStartDate')} />
            </Field>
            <Field label="Plan End">
              <input type="date" className={inputCls} value={form.planEndDate || ''} onChange={set('planEndDate')} />
            </Field>
            <Field label="Plan Progress (%)">
              <input type="number" min="0" max="100" className={inputCls} value={form.planProgress} onChange={num('planProgress')} />
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
              <input type="date" className={inputCls} value={form.actualStartDate || ''} onChange={set('actualStartDate')} />
            </Field>
            <Field label="Actual End">
              <input type="date" className={inputCls} value={form.actualEndDate || ''} onChange={set('actualEndDate')} />
            </Field>
            <Field label="Actual % Complete">
              <input type="number" min="0" max="100" className={inputCls} value={form.actualProgress} onChange={num('actualProgress')} />
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
            <input className={inputCls} value={form.taskNote} onChange={set('taskNote')} placeholder="e.g. Local purchase / Install" />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
