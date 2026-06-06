import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react'

let dialogStateSetter = null;

export const showAlert = (message, title = 'Alert', icon = 'info') => {
  return new Promise((resolve) => {
    if (dialogStateSetter) {
      dialogStateSetter({ type: 'alert', message, title, icon, resolve });
    } else {
      alert(message);
      resolve();
    }
  });
}

export const showConfirm = (message, title = 'Confirm', icon = 'help') => {
  return new Promise((resolve) => {
    if (dialogStateSetter) {
      dialogStateSetter({ type: 'confirm', message, title, icon, resolve });
    } else {
      resolve(confirm(message));
    }
  });
}

export const showPrompt = (message, title = 'Input Required', defaultValue = '') => {
  return new Promise((resolve) => {
    if (dialogStateSetter) {
      dialogStateSetter({ type: 'prompt', message, title, defaultValue, resolve });
    } else {
      resolve(prompt(message, defaultValue));
    }
  });
}

export default function GlobalDialog() {
  const [config, setConfig] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    dialogStateSetter = setConfig;
    return () => {
      if (dialogStateSetter === setConfig) dialogStateSetter = null;
    }
  }, []);

  useEffect(() => {
    if (config?.type === 'prompt') {
      setInputValue(config.defaultValue || '');
    }
  }, [config]);

  if (!config) return null;

  const close = (result) => {
    setConfig(null);
    config.resolve(result);
  }

  const getIcon = () => {
    switch (config.icon) {
      case 'success': return <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />;
      case 'error': return <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />;
      case 'help': return <HelpCircle className="w-12 h-12 text-blue-500 mx-auto" />;
      case 'info':
      default: return <Info className="w-12 h-12 text-blue-500 mx-auto" />;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 transition-transform">
        <div className="p-6 text-center">
          <div className="mb-4">
            {getIcon()}
          </div>
          {config.title && <h3 className="text-xl font-bold text-slate-800 mb-2">{config.title}</h3>}
          <p className="text-sm text-slate-600 mb-6 whitespace-pre-line leading-relaxed">{config.message}</p>

          {config.type === 'prompt' && (
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') close(inputValue)
                if (e.key === 'Escape') close(null)
              }}
              className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          )}

          <div className="flex gap-3 justify-center">
            {(config.type === 'confirm' || config.type === 'prompt') && (
              <button
                onClick={() => close(config.type === 'prompt' ? null : false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => close(config.type === 'prompt' ? inputValue : true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-colors"
            >
              {config.type === 'alert' ? 'OK' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
