
import React from 'react';
import { Bug } from '../types';

interface FixedCodeGalleryProps {
  bugs: Bug[];
}

const FixedCodeGallery: React.FC<FixedCodeGalleryProps> = ({ bugs }) => {
  if (bugs.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center animate-pop">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-900">No Resolved Solutions Yet</h3>
        <p className="text-sm font-medium text-slate-500 mt-2">Audit data will appear here once developers deploy fixes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-pop">
      {bugs.map((bug) => (
        <div key={bug.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident #{bug.id.toString().padStart(4, '0')}</span>
                 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-100">Audited Solution</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 mt-1">{bug.title}</h4>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                Fixed by <span className="font-bold text-slate-700">{bug.developerName}</span> 
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                Reported by <span className="font-bold text-slate-700">{bug.testerName}</span>
              </p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved Date</p>
               <p className="text-xs font-bold text-slate-900 mt-1">{new Date(bug.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Failing Logic */}
            <div className="p-8 bg-slate-50/50 border-r border-slate-100">
               <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                 Failing Logic
               </h5>
               <div className="bg-[#0f172a] rounded-2xl p-6 shadow-inner relative group">
                 <div className="absolute top-4 right-4 text-[9px] font-black text-slate-600 uppercase">Input</div>
                 <pre className="font-mono text-[11px] text-rose-300/80 leading-relaxed overflow-x-auto custom-scrollbar max-h-[250px]">
                   <code>{bug.failingCode || '// No code snippet provided by tester.'}</code>
                 </pre>
               </div>
            </div>

            {/* Implemented Solution */}
            <div className="p-8">
               <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 Implemented Solution
               </h5>
               <div className="bg-[#0f172a] rounded-2xl p-6 shadow-inner relative group">
                 <div className="absolute top-4 right-4 text-[9px] font-black text-slate-600 uppercase">Output</div>
                 <pre className="font-mono text-[11px] text-emerald-300/90 leading-relaxed overflow-x-auto custom-scrollbar max-h-[250px]">
                   <code>{bug.fixedCode || '// Problem marked as resolved without a code fix snippet.'}</code>
                 </pre>
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FixedCodeGallery;
