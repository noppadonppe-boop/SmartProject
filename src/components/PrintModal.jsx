import { useState } from 'react'
import { Printer, X, File, AlignLeft } from 'lucide-react'

export default function PrintModal({ onClose, onPrint, scheduleWidth = 1200 }) {
  const [paperSize, setPaperSize] = useState('A4')
  const [fitToPage, setFitToPage] = useState(true)

  const handlePrint = () => {
    onPrint({ paperSize, fitToPage })
  }

  // Calculate proportional widths for the schematic preview
  // Base is the schedule width
  const paperPx = paperSize === 'A3' ? 1526 : 1062;
  const scaledWidth = fitToPage ? Math.min(100, (paperPx / scheduleWidth) * 100) : 100;
  const overflow = !fitToPage && scheduleWidth > paperPx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col sm:flex-row">
        
        {/* Settings Panel */}
        <div className="flex-1 border-r border-slate-100 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-lg font-display font-semibold text-slate-800 flex items-center gap-2">
              <Printer size={20} className="text-brand-600" />
              Print Settings
            </h3>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Paper Size</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaperSize('A4')}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                    paperSize === 'A4'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold mb-0.5">A4</div>
                  <div className="text-xs font-normal opacity-80">297 × 210 mm</div>
                </button>
                <button
                  onClick={() => setPaperSize('A3')}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                    paperSize === 'A3'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold mb-0.5">A3</div>
                  <div className="text-xs font-normal opacity-80">420 × 297 mm</div>
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={fitToPage}
                    onChange={(e) => setFitToPage(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 group-hover:text-brand-700 transition-colors">
                    Scale to fit paper width
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Automatically shrinks the Gantt chart and tasks to fit on a single page horizontally.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Schematic Preview Panel */}
        <div className="hidden sm:flex w-64 bg-slate-50 p-6 flex-col items-center border-l border-slate-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 w-full text-center">
            Print Preview
          </div>
          
          {/* Paper representation */}
          <div 
            className="bg-white shadow-md border border-slate-200 rounded flex flex-col p-2 transition-all duration-300 relative"
            style={{ 
              width: paperSize === 'A3' ? '180px' : '140px', 
              height: paperSize === 'A3' ? '127px' : '99px' 
            }}
          >
            {/* Header/KPI mock */}
            <div className="flex gap-1 mb-2">
               <div className="h-1.5 bg-brand-100 rounded flex-1"></div>
               <div className="h-1.5 bg-slate-100 rounded flex-1"></div>
               <div className="h-1.5 bg-emerald-100 rounded flex-1"></div>
               <div className="h-1.5 bg-slate-100 rounded flex-1"></div>
            </div>
            <div className="flex gap-1 mb-2">
              <div className="w-8 h-1 bg-slate-200 rounded"></div>
              <div className="w-6 h-1 bg-slate-200 rounded"></div>
              <div className="w-10 h-1 bg-slate-200 rounded"></div>
            </div>

            {/* Schedule Table mock */}
            <div className="flex-1 border border-slate-100 rounded overflow-hidden flex bg-slate-50">
               {/* Data scaling representation */}
               <div className="h-full bg-white border-r border-slate-100 flex flex-col gap-0.5 p-1" style={{ width: '30%' }}>
                  <div className="h-1 w-full bg-slate-200 rounded-sm"></div>
                  <div className="h-0.5 w-3/4 bg-slate-100 rounded-sm mt-1"></div>
                  <div className="h-0.5 w-1/2 bg-slate-100 rounded-sm"></div>
                  <div className="h-0.5 w-full bg-slate-100 rounded-sm mt-1"></div>
               </div>
               
               {/* Gantt Area */}
               <div className="h-full flex-1 relative overflow-hidden p-1">
                 <div className="absolute top-2 left-1 h-0.5 bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${scaledWidth * 0.4}%` }}></div>
                 <div className="absolute top-4 left-4 h-0.5 bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${scaledWidth * 0.3}%` }}></div>
                 <div className="absolute top-6 left-8 h-0.5 bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${scaledWidth * 0.5}%` }}></div>
                 <div className="absolute top-8 left-12 h-0.5 bg-red-400 rounded-full transition-all duration-300" style={{ width: `${scaledWidth * 0.6}%` }}></div>
               </div>
            </div>

            {overflow && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[8px] px-1 py-0.5 rounded flex items-center shadow-sm">
                Clipped
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center text-xs text-slate-500">
            {fitToPage 
              ? "Content will be scaled down to fit one page width." 
              : "Content will print at 100% scale. Wide schedules may span multiple pages."}
          </div>
        </div>

      </div>
    </div>
  )
}
