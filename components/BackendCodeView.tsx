
import React, { useState } from 'react';
import { BACKEND_FILES } from '../constants';

const BackendCodeView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<keyof typeof BACKEND_FILES>('models_py');

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xl">
      <div className="flex bg-slate-800 border-b border-slate-700 p-1">
        <button 
          onClick={() => setActiveFile('models_py')}
          className={`px-4 py-2 text-xs font-mono transition-colors rounded-lg ${activeFile === 'models_py' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          models.py
        </button>
        <button 
          onClick={() => setActiveFile('app_py')}
          className={`px-4 py-2 text-xs font-mono transition-colors rounded-lg ${activeFile === 'app_py' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          app.py
        </button>
        {/* Fix: Changed 'init_db_py' to 'schema_sql' to match keys in BACKEND_FILES constant and fixed line 24/25 errors */}
        <button 
          onClick={() => setActiveFile('schema_sql')}
          className={`px-4 py-2 text-xs font-mono transition-colors rounded-lg ${activeFile === 'schema_sql' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          schema.sql
        </button>
      </div>
      <pre className="p-6 overflow-auto max-h-[500px] text-xs font-mono leading-relaxed text-slate-300">
        <code>{BACKEND_FILES[activeFile]}</code>
      </pre>
    </div>
  );
};

export default BackendCodeView;
