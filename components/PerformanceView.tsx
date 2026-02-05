
import React from 'react';
import { Bug, User, UserRole, BugStatus, BugPriority } from '../types';

interface PerformanceViewProps {
  bugs: Bug[];
  users: User[];
}

const PerformanceView: React.FC<PerformanceViewProps> = ({ bugs, users }) => {
  const developers = users.filter(u => u.role === UserRole.DEVELOPER && u.isApproved);
  const testers = users.filter(u => u.role === UserRole.TESTER && u.isApproved);

  const getDevStats = (devId: number) => {
    const devBugs = bugs.filter(b => b.developerId === devId);
    const resolved = devBugs.filter(b => b.status === BugStatus.RESOLVED).length;
    const inProgress = devBugs.filter(b => b.status === BugStatus.IN_PROGRESS).length;
    const highPriorityResolved = devBugs.filter(b => b.priority === BugPriority.HIGH && b.status === BugStatus.RESOLVED).length;
    
    return {
      total: devBugs.length,
      resolved,
      inProgress,
      highPriorityResolved,
      efficiency: devBugs.length > 0 ? Math.round((resolved / devBugs.length) * 100) : 0
    };
  };

  const getTesterStats = (testerId: number) => {
    const reportedBugs = bugs.filter(b => b.testerId === testerId);
    const impactHigh = reportedBugs.filter(b => b.priority === BugPriority.HIGH).length;
    
    return {
      totalReported: reportedBugs.length,
      impactHigh,
      verified: reportedBugs.filter(b => b.status === BugStatus.RESOLVED).length
    };
  };

  return (
    <div className="space-y-12 animate-pop">
      {/* High-Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Development Velocity</p>
           <h3 className="text-4xl font-black mt-2">
             {bugs.length > 0 ? Math.round((bugs.filter(b => b.status === BugStatus.RESOLVED).length / bugs.length) * 100) : 0}%
           </h3>
           <p className="text-xs font-medium mt-2 opacity-90">Overall resolution rate across all projects</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Load</p>
           <h3 className="text-4xl font-black text-slate-900 mt-2">
             {bugs.filter(b => b.status !== BugStatus.RESOLVED).length}
           </h3>
           <p className="text-xs font-medium text-slate-500 mt-2">Bugs currently in backlog or progress</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">High Priority Resolved</p>
           <h3 className="text-4xl font-black text-rose-500 mt-2">
             {bugs.filter(b => b.priority === BugPriority.HIGH && b.status === BugStatus.RESOLVED).length}
           </h3>
           <p className="text-xs font-medium text-slate-500 mt-2">Critical issues successfully addressed</p>
        </div>
      </div>

      {/* Developers Section */}
      <section>
        <div className="flex items-center gap-4 mb-6 px-4">
           <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
             </svg>
           </div>
           <div>
             <h4 className="text-xl font-black text-slate-900">Engineering Performance</h4>
             <p className="text-sm font-medium text-slate-500 italic">Tracking resolution efficiency and workload</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map(dev => {
            const stats = getDevStats(dev.id);
            return (
              <div key={dev.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {dev.fullName[0]}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900">{dev.fullName}</h5>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dev.designation || 'Developer'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Solved</p>
                     <p className="text-2xl font-black text-indigo-600 mt-1">{stats.resolved}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Solved (High)</p>
                     <p className="text-2xl font-black text-rose-500 mt-1">{stats.highPriorityResolved}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Efficiency</span>
                     <span className="text-indigo-600">{stats.efficiency}%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                       style={{ width: `${stats.efficiency}%` }} 
                     />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testers Section */}
      <section>
        <div className="flex items-center gap-4 mb-6 px-4">
           <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <div>
             <h4 className="text-xl font-black text-slate-900">QA Impact Analytics</h4>
             <p className="text-sm font-medium text-slate-500 italic">Measuring discovery rate and verification quality</p>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
           <table className="w-full text-left">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tester</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reports Discovered</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Critical Impact</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Closed Loops</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Discovery Weight</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {testers.map(tester => {
                 const stats = getTesterStats(tester.id);
                 const weight = bugs.length > 0 ? Math.round((stats.totalReported / bugs.length) * 100) : 0;
                 return (
                   <tr key={tester.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">
                           {tester.fullName[0]}
                         </div>
                         <span className="text-sm font-bold text-slate-900">{tester.fullName}</span>
                       </div>
                     </td>
                     <td className="px-10 py-6 text-center text-sm font-black text-slate-700">{stats.totalReported}</td>
                     <td className="px-10 py-6 text-center text-sm font-black text-rose-500">{stats.impactHigh}</td>
                     <td className="px-10 py-6 text-center text-sm font-black text-emerald-500">{stats.verified}</td>
                     <td className="px-10 py-6 text-right">
                       <div className="inline-flex items-center gap-2">
                         <span className="text-xs font-black text-slate-400">{weight}%</span>
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400" style={{ width: `${weight}%` }} />
                         </div>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>
      </section>
    </div>
  );
};

export default PerformanceView;
