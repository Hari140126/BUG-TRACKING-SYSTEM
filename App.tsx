
import React, { useState, useEffect } from 'react';
import { User, UserRole, Bug, BugPriority, BugStatus } from './types';
import { MOCK_USERS, INITIAL_BUGS } from './constants';
import BugTable from './components/BugTable';
import BugModal from './components/BugModal';
import LoginPage from './components/LoginPage';
import FixedCodeGallery from './components/FixedCodeGallery';
import PerformanceView from './components/PerformanceView';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bt_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bt_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [bugs, setBugs] = useState<Bug[]>(() => {
    const saved = localStorage.getItem('bt_bugs');
    return saved ? JSON.parse(saved) : INITIAL_BUGS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'my-tasks' | 'manager' | 'fixed-code' | 'performance'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => localStorage.setItem('bt_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('bt_current_user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('bt_bugs', JSON.stringify(bugs)), [bugs]);

  const handleSignup = (name: string, password?: string) => {
    const newUser: User = {
      id: Date.now(),
      fullName: name,
      username: name.toLowerCase().replace(' ', '_'),
      email: `${name.toLowerCase().replace(' ', '')}@example.com`,
      role: UserRole.TESTER,
      designation: 'Staff',
      password: password || 'password123',
      isApproved: false,
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
  };

  const handleApprove = (userId: number, role: UserRole, designation?: string) => {
    setUsers(users.map(u => u.id === userId ? { 
      ...u, 
      isApproved: true, 
      role, 
      designation: designation || (role === UserRole.TESTER ? 'Standard Tester' : 'General Developer') 
    } : u));
  };

  const handleUpdateUser = (userId: number, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('all');
  };

  if (!currentUser) {
    return <LoginPage users={users} onLogin={setCurrentUser} onSignup={handleSignup} />;
  }

  if (!currentUser.isApproved && currentUser.role !== UserRole.MANAGER) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-6 animate-bounce">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Awaiting Approval</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">Hello {currentUser.fullName}! Your account has been registered but requires a Manager's approval before you can access the tracker.</p>
        <button onClick={handleLogout} className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Back to Login</button>
      </div>
    );
  }

  const developers = users.filter(u => u.role === UserRole.DEVELOPER && u.isApproved);
  
  const filteredBugs = bugs.filter(b => {
    if (activeTab === 'my-tasks') return b.developerId === currentUser.id;
    return true;
  });

  const calculateDueDate = (priority: BugPriority): string => {
    const now = new Date();
    switch (priority) {
      case BugPriority.HIGH: now.setDate(now.getDate() + 1); break;
      case BugPriority.MEDIUM: now.setDate(now.getDate() + 3); break;
      case BugPriority.LOW: now.setDate(now.getDate() + 7); break;
    }
    return now.toISOString();
  };

  const handleReportBug = (data: any) => {
    const newBug: Bug = {
      id: bugs.length + 1,
      title: data.title,
      description: data.description,
      priority: data.priority,
      failingCode: data.failingCode,
      attachments: data.attachments || [],
      dueDate: calculateDueDate(data.priority),
      status: BugStatus.OPEN,
      createdAt: new Date().toISOString(),
      testerId: currentUser.id,
      testerName: currentUser.fullName,
      developerId: null
    };
    setBugs([newBug, ...bugs]);
  };

  const handleUpdateBugStatus = (id: number, status: BugStatus, fixedCode?: string) => {
    setBugs(bugs.map(b => b.id === id ? { 
      ...b, 
      status, 
      fixedCode: fixedCode !== undefined ? fixedCode : b.fixedCode 
    } : b));
  };

  const stats = {
    total: bugs.length,
    critical: bugs.filter(b => b.priority === BugPriority.HIGH).length,
    active: bugs.filter(b => b.status === BugStatus.IN_PROGRESS).length,
    resolved: bugs.filter(b => b.status === BugStatus.RESOLVED).length,
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">BugTracker AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Edition</p>
            </div>
          </div>

          <nav className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Navigation</p>
            <button 
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
              </svg>
              Table View
            </button>
            {currentUser.role !== UserRole.MANAGER && (
              <button 
                onClick={() => setActiveTab('my-tasks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-tasks' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Assignments
              </button>
            )}
            {currentUser.role === UserRole.MANAGER && (
              <>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mt-6 mb-4">Management</p>
                <button 
                  onClick={() => setActiveTab('manager')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'manager' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Staff Management
                </button>
                <button 
                  onClick={() => setActiveTab('performance')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'performance' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Performance
                </button>
                <button 
                  onClick={() => setActiveTab('fixed-code')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'fixed-code' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Audit Trail
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-indigo-600">
                   {currentUser.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {currentUser.role}
                  </p>
                </div>
             </div>
             <button onClick={handleLogout} className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all">Sign Out</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-10 max-w-[1400px] mx-auto custom-scrollbar overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab.replace('-', ' ')} view
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Manage and track {activeTab} within the system
            </p>
          </div>

          {currentUser.role === UserRole.TESTER && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Report Incident
            </button>
          )}
        </header>

        {activeTab === 'manager' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl animate-pop">
            <div className="p-10 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Personnel Directory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => u.role !== UserRole.MANAGER).map(user => (
                    <tr key={user.id} className="group hover:bg-slate-50 transition-all">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600">{user.fullName[0]}</div>
                           <div><p className="text-sm font-bold text-slate-900">{user.fullName}</p><p className="text-[10px] text-slate-400 font-medium">@{user.username}</p></div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <select value={user.role} onChange={(e) => handleUpdateUser(user.id, { role: e.target.value as UserRole })} className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-indigo-600">
                          <option value={UserRole.TESTER}>Tester</option>
                          <option value={UserRole.DEVELOPER}>Developer</option>
                        </select>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {!user.isApproved ? (
                          <button onClick={() => handleApprove(user.id, user.role)} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100">Approve</button>
                        ) : (
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fixed-code' && <FixedCodeGallery bugs={bugs.filter(b => b.status === BugStatus.RESOLVED)} />}
        {activeTab === 'performance' && <PerformanceView bugs={bugs} users={users} />}
        {(activeTab === 'all' || activeTab === 'my-tasks') && (
          <BugTable 
            bugs={filteredBugs} 
            currentUser={currentUser} 
            developers={developers}
            onUpdateStatus={handleUpdateBugStatus}
            onAssign={(id, devId) => {
               const dev = developers.find(d => d.id === devId);
               setBugs(bugs.map(b => b.id === id ? { ...b, developerId: devId, developerName: dev?.fullName, status: BugStatus.OPEN } : b));
            }}
          />
        )}
      </main>

      <BugModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleReportBug} currentUser={currentUser} />
    </div>
  );
};

export default App;
