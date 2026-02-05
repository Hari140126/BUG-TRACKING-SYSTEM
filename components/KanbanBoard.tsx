
import React from 'react';
import { Bug, BugStatus, BugPriority, User, UserRole } from '../types';

interface KanbanBoardProps {
  bugs: Bug[];
  onUpdateStatus: (id: number, status: BugStatus) => void;
  currentUser: User;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ bugs, onUpdateStatus, currentUser }) => {
  const columns = [
    { title: 'Open Backlog', status: BugStatus.OPEN, color: 'indigo' },
    { title: 'Development', status: BugStatus.IN_PROGRESS, color: 'amber' },
    { title: 'Verified Fixes', status: BugStatus.RESOLVED, color: 'emerald' },
  ];

  const getPriorityStyle = (priority: BugPriority) => {
    switch (priority) {
      case BugPriority.HIGH: return 'border-rose-200 bg-rose-50 text-rose-600';
      case BugPriority.MEDIUM: return 'border-amber-200 bg-amber-50 text-amber-600';
      case BugPriority.LOW: return 'border-emerald-200 bg-emerald-50 text-emerald-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full min-h-[70vh] animate-pop">
      {columns.map((col) => {
        const columnBugs = bugs.filter(b => b.status === col.status);
        return (
          <div key={col.status} className="flex flex-col bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-lg shadow-${col.color}-200`} />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{col.title}</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full">{columnBugs.length}</span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
              {columnBugs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center opacity-40 grayscale">
                   <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Tickets</p>
                </div>
              ) : (
                columnBugs.map((bug) => (
                  <div 
                    key={bug.id} 
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
                    onClick={() => {
                        // Logic to open detail or change status if developer assigned
                        if (currentUser.role === UserRole.DEVELOPER && bug.developerId === currentUser.id) {
                            if (bug.status === BugStatus.OPEN) onUpdateStatus(bug.id, BugStatus.IN_PROGRESS);
                        }
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-300">#{bug.id.toString().padStart(4, '0')}</span>
                      <div className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${getPriorityStyle(bug.priority)}`}>
                        {bug.priority}
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{bug.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{bug.description}</p>
                    
                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         {bug.developerId ? (
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600">{bug.developerName?.substring(0, 1)}</div>
                             <span className="text-[9px] font-bold text-slate-500">{bug.developerName}</span>
                           </div>
                         ) : <span className="text-[9px] font-black text-slate-300 uppercase italic">Unassigned</span>}
                       </div>
                       {bug.attachments.length > 0 && (
                         <div className="flex items-center text-slate-300">
                           <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                           <span className="text-[9px] font-black">{bug.attachments.length}</span>
                         </div>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
