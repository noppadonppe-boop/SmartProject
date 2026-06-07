import { useState } from 'react'
import { X, Layers, Calendar, User, Check, Trash2 } from 'lucide-react'

export default function SelectBaselineModal({ baselines = [], selectedRev, onClose, onSelect, onClear }) {
  const [selected, setSelected] = useState(selectedRev)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 text-slate-800">
            <Layers size={20} className="text-blue-600" />
            <h2 className="text-lg font-display font-bold">Select Baseline</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scroll-thin space-y-3 bg-slate-50/50">
          {baselines.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Layers size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No baselines saved yet.</p>
              <p className="text-xs mt-1">Use the "Set Baseline" button to create one.</p>
            </div>
          ) : (
            baselines.map((b) => (
              <div
                key={b.rev}
                onClick={() => setSelected(b.rev)}
                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                  selected === b.rev
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                {selected === b.rev && (
                  <div className="absolute top-4 right-4 text-blue-600">
                    <Check size={18} strokeWidth={3} />
                  </div>
                )}
                <div className="font-semibold text-slate-800 mb-1 pr-6">{b.name}</div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {b.date}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[150px]" title={b.setBy}>
                    <User size={13} /> {b.setBy}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Legacy Baseline fallback option */}
          <div
            onClick={() => setSelected('legacy')}
            className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
              selected === 'legacy'
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            {selected === 'legacy' && (
              <div className="absolute top-4 right-4 text-blue-600">
                <Check size={18} strokeWidth={3} />
              </div>
            )}
            <div className="font-semibold text-slate-800 mb-1 pr-6">Legacy Baseline</div>
            <div className="text-xs text-slate-500">
              Show baseline dates stored on individual tasks.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={() => {
              onClear()
              onClose()
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={16} /> Turn Off
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelect(selected)
                onClose()
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 rounded-xl transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
