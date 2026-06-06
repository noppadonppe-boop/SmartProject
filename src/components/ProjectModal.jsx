import { useState } from 'react'
import { Building2, Paperclip, Plus, Trash2, Upload, Loader2 } from 'lucide-react'
import Modal, { Field, inputCls } from './Modal'
import { USE_FIREBASE } from '../firebase'
import { uploadAttachment } from '../services/dataService'

const empty = {
  name: '',
  companyId: '',
  owner: '',
  description: '',
  startDate: '',
  endDate: '',
  attachments: [],
}

export default function ProjectModal({
  project,
  companies = [],
  defaultCompanyId = '',
  currentCompanyId = '',
  allowCompanyChange = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    project ? { ...empty, ...project, companyId: project.companyId || defaultCompanyId || '' } : { ...empty, companyId: defaultCompanyId || '' }
  )
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const visibleCompanies = allowCompanyChange
    ? (currentCompanyId ? companies.filter((c) => c.id === currentCompanyId) : companies)
    : []

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addAttachment = () => {
    const name = fileName.trim()
    if (!name) return
    setForm((f) => ({ ...f, attachments: [...(f.attachments || []), { name, url: '#' }] }))
    setFileName('')
  }

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        let entry
        if (USE_FIREBASE) {
          entry = await uploadAttachment(file, project?.id || 'new')
        } else {
          entry = { name: file.name, url: URL.createObjectURL(file) }
        }
        setForm((f) => ({ ...f, attachments: [...(f.attachments || []), entry] }))
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeAttachment = (i) =>
    setForm((f) => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))

  const submit = async () => {
    if (!form.name.trim() || !form.companyId) return
    try {
      await onSave(form, project?.id)
      onClose()
    } catch (err) {
      console.error('Save project failed', err)
    }
  }

  return (
    <Modal
      title={project ? 'Edit Project' : 'New Project'}
      subtitle="Project details, duration and attachments"
      icon={Building2}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!form.name.trim() || !form.companyId}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {allowCompanyChange && (
          <Field label="Company *">
            <select className={inputCls} value={form.companyId} onChange={set('companyId')}>
              <option value="">Select a company</option>
              {visibleCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Project Name *">
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. 50 MW Power Plant" />
        </Field>

        <Field label="Owner">
          <input className={inputCls} value={form.owner} onChange={set('owner')} placeholder="Department / Person" />
        </Field>

        <Field label="Description">
          <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={set('description')} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date">
            <input type="date" className={inputCls} value={form.startDate || ''} onChange={set('startDate')} />
          </Field>
          <Field label="End Date">
            <input type="date" className={inputCls} value={form.endDate || ''} onChange={set('endDate')} />
          </Field>
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1">Attachments</span>
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttachment())}
              placeholder="File name or URL…"
            />
            <button onClick={addAttachment} className="shrink-0 px-3 rounded-lg bg-slate-800 text-white hover:bg-slate-900">
              <Plus size={16} />
            </button>
          </div>
          <label className="mt-2 flex items-center justify-center gap-2 text-sm border-2 border-dashed border-slate-300 rounded-lg py-3 cursor-pointer hover:bg-slate-50 text-slate-600">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading…' : USE_FIREBASE ? 'Upload files to Storage' : 'Add files (local preview)'}
            <input type="file" multiple className="hidden" onChange={onFiles} disabled={uploading} />
          </label>
          <ul className="mt-2 space-y-1">
            {(form.attachments || []).map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <Paperclip size={14} className="text-slate-400" />
                <span className="flex-1 truncate">{a.name}</span>
                <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  )
}
