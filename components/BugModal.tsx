
import React, { useState, useRef } from 'react';
import { BugPriority, User, BugAttachment } from '../types';

interface BugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bug: { title: string; description: string; priority: BugPriority; failingCode?: string, attachments: BugAttachment[] }) => void;
  currentUser: User;
}

const BugModal: React.FC<BugModalProps> = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [failingCode, setFailingCode] = useState('');
  const [priority, setPriority] = useState<BugPriority>(BugPriority.MEDIUM);
  const [attachments, setAttachments] = useState<BugAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = async (files: FileList) => {
    const newAttachments: BugAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const filePromise = new Promise<BugAttachment>((resolve) => {
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string
          });
        };
      });
      reader.readAsDataURL(file);
      newAttachments.push(await filePromise);
    }
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    onSubmit({ title, description, priority, failingCode, attachments });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFailingCode('');
    setAttachments([]);
    setPriority(BugPriority.MEDIUM);
  };

  const priorityConfigs = {
    [BugPriority.LOW]: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100',
    [BugPriority.MEDIUM]: 'border-amber-200 text-amber-600 hover:bg-amber-50 active:bg-amber-100',
    [BugPriority.HIGH]: 'border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100',
  };

  const priorityActiveConfigs = {
    [BugPriority.LOW]: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200',
    [BugPriority.MEDIUM]: 'bg-amber-600 border-amber-600 text-white shadow-amber-200',
    [BugPriority.HIGH]: 'bg-rose-600 border-rose-600 text-white shadow-rose-200',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-pop max-h-[90vh] flex flex-col">
        <div className="px-10 py-8 bg-slate-50/50 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Report Incident</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tester Workflow</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observations</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What steps did you take to find this?..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failing Code Snippet</label>
               <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">Editor Mode</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-[#0f172a] border border-slate-800 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900/50 border-r border-slate-800/50 flex flex-col items-center pt-4 select-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <span key={n} className="text-[9px] font-mono text-slate-700 h-5 leading-relaxed">{n}</span>
                    ))}
                </div>
                <textarea
                  rows={8}
                  value={failingCode}
                  onChange={(e) => setFailingCode(e.target.value)}
                  placeholder="// Paste the problematic code block here..."
                  className="w-full pl-14 pr-6 py-4 bg-transparent font-mono text-xs text-emerald-400 outline-none resize-none placeholder:text-slate-700 leading-relaxed scrollbar-hide"
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachments (Docs/PDF/PPT)</label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full px-6 py-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group ${
                isDragging 
                  ? 'bg-indigo-50 border-indigo-400 shadow-inner' 
                  : 'bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-300 group-hover:text-indigo-400'}`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-500">
                {isDragging ? 'Drop to upload' : 'Click or drag files to upload'}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, DOC, DOCX, PPT, PPTX</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                onChange={handleFileChange}
                className="hidden" 
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
            </div>
            
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-4 animate-in slide-in-from-top-2 duration-300">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="truncate max-w-[280px]">
                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeAttachment(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Urgency Level</label>
            <div className="grid grid-cols-3 gap-4">
              {Object.values(BugPriority).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${
                    priority === p 
                    ? `${priorityActiveConfigs[p]} shadow-lg transform -translate-y-1` 
                    : `${priorityConfigs[p]} bg-white`
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
              High: 24h | Medium: 3 Days | Low: 7 Days
            </p>
          </div>

          <div className="pt-4 flex gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugModal;
