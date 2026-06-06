import { useState } from 'react'
import { Building, Plus, Pencil, Trash2 } from 'lucide-react'
import Modal, { Field, inputCls } from './Modal'

export default function CompanyManagement({ companies = [], users = [], upsertCompany, removeCompany }) {
  const [modal, setModal] = useState(null) // {company} | {} | null

  const companyUserCount = Object.fromEntries(companies.map((c) => [c.id, users.filter((u) => u.companyId === c.id).length]))

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-6 space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="bg-slate-800 text-white p-2 rounded-lg"><Building size={22} /></div>
        <div>
          <h1 className="text-lg font-bold">Company Management</h1>
          <p className="text-sm text-slate-500">
            {companies.length} companies · {users.length} users
          </p>
        </div>
        <div className="flex-1" />
      </header>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Manage company records and keep user assignments organized.</p>
        <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
          <Plus size={16} /> New Company
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-1 font-semibold">Company</th>
              <th className="px-2 py-1 font-semibold">Code</th>
              <th className="px-2 py-1 font-semibold">Contact</th>
              <th className="px-2 py-1 font-semibold">Users</th>
              <th className="px-2 py-1 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 align-middle">
                <td className="px-2 py-1 font-medium text-[13px] text-slate-800">{c.name}</td>
                <td className="px-2 py-1 text-[13px] text-slate-600">{c.code || '—'}</td>
                <td className="px-2 py-1 text-[13px] text-slate-600">{c.contact || '—'}</td>
                <td className="px-2 py-1 text-[13px] text-slate-600">{companyUserCount[c.id] || 0}</td>
                <td className="px-2 py-1">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setModal({ company: c })} className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"><Pencil size={13} /></button>
                    <button onClick={() => removeCompany(c.id)} className="p-1 rounded border border-red-300 bg-red-50 hover:bg-red-100 text-red-600"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No companies yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <CompanyModal
          company={modal.company}
          onClose={() => setModal(null)}
          onSave={(data) => { upsertCompany(data, modal.company?.id); setModal(null) }}
        />
      )}
    </div>
  )
}

function CompanyModal({ company, onClose, onSave }) {
  const [form, setForm] = useState({ name: company?.name || '', code: company?.code || '', contact: company?.contact || '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <Modal
      title={company ? 'Edit Company' : 'New Company'}
      icon={Building}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">Cancel</button>
          <button onClick={() => form.name.trim() && onSave(form)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Save</button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Company Name *"><input className={inputCls} value={form.name} onChange={set('name')} /></Field>
        <Field label="Code"><input className={inputCls} value={form.code} onChange={set('code')} /></Field>
        <Field label="Contact"><input className={inputCls} value={form.contact} onChange={set('contact')} /></Field>
      </div>
    </Modal>
  )
}
