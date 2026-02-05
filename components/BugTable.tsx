
import React, { useState } from 'react';
import { Bug, BugPriority, BugStatus, UserRole, User } from '../types';

interface BugTableProps {
  bugs: Bug[];
  currentUser: User;
  onUpdateStatus: (bugId: number, status: BugStatus, fixedCode?: string) => void;
  onAssign: (bugId: number, developerId: number) => void;
  developers: User[];
}

const BugTable: React.FC<BugTableProps> = ({ bugs, currentUser, onUpdateStatus, onAssign, developers }) => {
  const [expandedBugId, setExpandedBugId] = useState<number | null>(null);
  const [tempFixedCode, setTempFixedCode] = useState<string>('');
  const [isConfirmingResolve, setIsConfirmingResolve] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getPriorityConfig = (priority: BugPriority) => {
    switch (priority) {
      case BugPriority.HIGH: return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
      case BugPriority.MEDIUM: return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
      case BugPriority.LOW: return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' };
    }
  };

  const getStatusBadge = (status: BugStatus) => {
    switch (status) {
      case BugStatus.OPEN: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case BugStatus.IN_PROGRESS: return 'bg-purple-50 text-purple-700 border-purple-100';
      case BugStatus.RESOLVED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  const downloadAttachment = (attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBugs = bugs.filter(bug => 
    bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bug.id.toString().includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text"
            placeholder="Search incident reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref ID</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">State</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignee</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredBugs.map((bug) => {
              const priority = getPriorityConfig(bug.priority);
              const isAssignedToMe = currentUser.role === UserRole.DEVELOPER && bug.developerId === currentUser.id;
              const isExpanded = expandedBugId === bug.id;
              const canAssign = (currentUser.role === UserRole.MANAGER && bug.status !== BugStatus.RESOLVED) || (currentUser.role === UserRole.TESTER && bug.status === BugStatus.OPEN);

              return (
                <React.Fragment key={bug.id}>
                  <tr 
                    className={`group transition-all hover:bg-slate-50/80 cursor-pointer ${isAssignedToMe ? 'bg-indigo-50/20' : ''} ${isExpanded ? 'bg-slate-50' : ''}`}
                    onClick={() => { setExpandedBugId(isExpanded ? null : bug.id); setTempFixedCode(bug.fixedCode || ''); setIsConfirmingResolve(false); }}
                  >
                    <td className="px-8 py-6 font-black text-slate-400 text-xs">#{bug.id.toString().padStart(4, '0')}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-extrabold text-slate-900 leading-tight">{bug.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{bug.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${priority.bg} ${priority.text} text-[10px] font-black uppercase tracking-wider`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                        {bug.priority}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getStatusBadge(bug.status)}`}>{bug.status}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {bug.developerId ? (
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">{bug.developerName?.substring(0, 1)}</div>
                             <span className="text-xs font-bold text-slate-700">{bug.developerName}</span>
                          </div>
                        ) : <span className="text-[10px] font-black uppercase text-slate-300">Unassigned</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                       {isAssignedToMe && bug.status !== BugStatus.RESOLVED && (
                         <button onClick={() => setExpandedBugId(bug.id)} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800">Review Now</button>
                       )}
                       {canAssign && (
                         <select onChange={(e) => onAssign(bug.id, Number(e.target.value))} value={bug.developerId || ""} className="text-[10px] font-black uppercase border border-slate-200 rounded-lg p-2 bg-white">
                           <option value="" disabled>Dispatch...</option>
                           {developers.map(dev => <option key={dev.id} value={dev.id}>{dev.fullName}</option>)}
                         </select>
                       )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={6} className="px-10 py-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">Detected Issue Source</h4>
                            <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl overflow-hidden">
                              <pre className="font-mono text-xs text-rose-300/80 leading-relaxed overflow-x-auto custom-scrollbar"><code>{bug.failingCode || '// No code provided'}</code></pre>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">Proposed Implementation</h4>
                            </div>
                            <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl min-h-[250px] flex flex-col">
                              <textarea 
                                readOnly={!isAssignedToMe || bug.status === BugStatus.RESOLVED}
                                value={tempFixedCode}
                                onChange={(e) => setTempFixedCode(e.target.value)}
                                placeholder="// Implementation placeholder..."
                                className="flex-1 bg-transparent font-mono text-xs text-emerald-400 outline-none resize-none leading-relaxed placeholder:text-slate-700"
                              />
                              {isAssignedToMe && bug.status !== BugStatus.RESOLVED && (
                                <button 
                                  onClick={() => onUpdateStatus(bug.id, BugStatus.RESOLVED, tempFixedCode)}
                                  className="mt-6 w-full py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/40"
                                >
                                  Deploy & Resolve Incident
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {bug.attachments.length > 0 && (
                          <div className="p-8 bg-white border border-slate-200 rounded-[2rem]">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidence Files</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {bug.attachments.map((file, idx) => (
                                <div key={idx} onClick={() => downloadAttachment(file)} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50 cursor-pointer transition-all">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                                  <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BugTable;
