import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

// Reusable multi-select dropdown. Used for assigning multiple Roles and
// multiple Projects to a user. Panel renders at z-[10010] per spec.
export default function MultiSelect({ options, value = [], onChange, placeholder = 'Select…', renderLabel, compact, showCountOnly }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const panelRef = useRef(null)
  const [panelStyle, setPanelStyle] = useState(null)

  const updatePanelStyle = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const preferredTop = rect.bottom + 6
    const estimatedHeight = 240
    const spaceBelow = viewportHeight - rect.bottom - 12
    const spaceAbove = rect.top - 12
    const openUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
    const top = openUp
      ? Math.max(12, rect.top - 6 - Math.min(estimatedHeight, spaceAbove))
      : preferredTop
    const left = Math.min(Math.max(12, rect.left), viewportWidth - 12 - rect.width)
    setPanelStyle({
      position: 'fixed',
      top,
      left,
      width: rect.width,
      zIndex: 10050,
    })
  }

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && ref.current.contains(e.target)) return
      if (panelRef.current && panelRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    updatePanelStyle()
    const onReflow = () => updatePanelStyle()
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return () => {
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open])

  const toggle = (val) => {
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    onChange(next)
  }

  const selectedLabels = useMemo(() => options.filter((o) => value.includes(o.value)).map((o) => o.label), [options, value])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full min-w-[160px] flex items-center justify-between gap-2 border border-slate-300 bg-white hover:bg-slate-50 ${compact ? 'px-1.5 py-0 text-[11px] rounded min-h-[22px]' : 'px-2.5 py-1.5 text-sm rounded-lg'}`}
      >
        <span className={`flex flex-wrap gap-0.5 items-center text-left py-0.5 ${compact ? 'min-h-[14px]' : 'min-h-[20px]'}`}>
          {selectedLabels.length === 0 && <span className="text-slate-400">{placeholder}</span>}
          {selectedLabels.length > 0 && showCountOnly && (
            <span className={`leading-none rounded-full bg-blue-100 text-blue-700 ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'}`}>{selectedLabels.length} selected</span>
          )}
          {selectedLabels.length > 0 && !showCountOnly && selectedLabels.map((l) => (
            <span key={l} className={`leading-none rounded-full bg-blue-100 text-blue-700 ${compact ? 'text-[10px] px-1 py-0.5' : 'text-[11px] px-1.5 py-0.5'}`}>{l}</span>
          ))}
        </span>
        <ChevronDown size={compact ? 13 : 15} className="text-slate-400 shrink-0" />
      </button>

      {open && (
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle || undefined}
            className="max-h-60 overflow-y-auto scroll-thin bg-white rounded-lg border border-slate-200 shadow-lg"
          >
            {options.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">No options</div>}
            {options.map((o) => {
              const checked = value.includes(o.value)
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {checked && <Check size={12} />}
                  </span>
                  <span className="flex-1 truncate">{renderLabel ? renderLabel(o) : o.label}</span>
                </button>
              )
            })}
          </div>,
          document.body
        )
      )}
    </div>
  )
}
