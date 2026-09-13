import React, { useState } from 'react';
import { FolderOpen, FileText, Upload, CheckCircle2, ShieldCheck, X, Plus } from 'lucide-react';
import { MOCK_MEDICAL_RECORDS, MOCK_USER_HORSES } from '../data/mockData';

interface DriveVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveVaultModal: React.FC<DriveVaultModalProps> = ({ isOpen, onClose }) => {
  const [records, setRecords] = useState(MOCK_MEDICAL_RECORDS);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('coggins');

  if (!isOpen) return null;

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = {
      id: `rec-${Date.now()}`,
      horseName: MOCK_USER_HORSES[0].name,
      title: title || 'New Health Document',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: category as any,
      verified: true
    };
    setRecords([newDoc, ...records]);
    setShowUpload(false);
    setTitle('');
    alert('Document synchronized to horsez Google Drive Health Records Vault!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Google Drive Health Records Vault
              </h2>
              <p className="text-[11px] text-slate-500">Coggins, Vaccination Cards, Passports & Microchip Records</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="font-bold">Cloud Sync Status: All Records Auto-Forwarded to Haulers & Vets</span>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <form onSubmit={handleUploadDoc} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800">Upload New Health Certificate</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 Rabies & EHV-1 Vaccination Record"
                className="w-full border p-2 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border p-2 rounded-lg font-medium"
              >
                <option value="coggins">Negative Coggins Certificate</option>
                <option value="vaccine">Vaccination Log</option>
                <option value="dental">Dental & Health Passport</option>
                <option value="waiver">Liability Waiver</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="w-1/2 bg-slate-200 text-slate-700 py-2 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-teal-700 hover:bg-teal-800 text-white py-2 rounded-lg font-bold"
              >
                Sync to Google Drive
              </button>
            </div>
          </form>
        )}

        {/* List of Documents */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto">
          {records.map((rec) => (
            <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">{rec.title}</h4>
                  <p className="text-[10px] text-slate-500">Patient: {rec.horseName} • Issued: {rec.date}</p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400 font-medium">
          Documents automatically provided to verified emergency vets & transportation drivers upon dispatch.
        </div>

      </div>
    </div>
  );
};
