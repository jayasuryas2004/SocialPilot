"use client";
import { useState } from 'react';
import {
  X, ShieldCheck, Loader2, AlertCircle, ChevronLeft,
  CheckCircle2, Check, RotateCcw
} from 'lucide-react';
import { PLATFORM_LIST, connectPlatforms } from '@/lib/api/accounts';

// step: 'pick' -> 'permissions' -> 'connecting' -> 'summary'
export default function OAuthConnectModal({ isOpen, onClose, onConnected, connectedPlatformIds = [] }) {
  const [step, setStep] = useState('pick');
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { platformId: { status, error, account } }

  const reset = () => {
    setStep('pick');
    setSelectedIds([]);
    setStatusMap({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const togglePlatformSelect = (platformId) => {
    setSelectedIds((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const selectedPlatforms = PLATFORM_LIST.filter((p) => selectedIds.includes(p.id));

  const startConnecting = async () => {
    setStep('connecting');
    const initialStatus = {};
    selectedIds.forEach((id) => { initialStatus[id] = { status: 'pending' }; });
    setStatusMap(initialStatus);

    const connectedAccounts = [];

    await connectPlatforms(selectedIds, (platformId, status, account, errorMsg) => {
      setStatusMap((prev) => ({
        ...prev,
        [platformId]: { status, account, error: errorMsg },
      }));
      if (status === 'success' && account) {
        connectedAccounts.push(account);
      }
    });

    if (connectedAccounts.length > 0) {
      onConnected?.(connectedAccounts);
    }
    setStep('summary');
  };

  const retryFailed = () => {
    const failedIds = Object.entries(statusMap)
      .filter(([, v]) => v.status === 'error')
      .map(([id]) => id);
    setSelectedIds(failedIds);
    startConnecting();
  };

  if (!isOpen) return null;

  const successCount = Object.values(statusMap).filter((v) => v.status === 'success').length;
  const errorCount = Object.values(statusMap).filter((v) => v.status === 'error').length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">

        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {step === 'permissions' && (
              <button onClick={() => setStep('pick')} className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100">
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-black text-slate-900">
              {step === 'pick' && 'Connect Account'}
              {step === 'permissions' && `Review Permissions (${selectedPlatforms.length})`}
              {step === 'connecting' && 'Connecting Accounts...'}
              {step === 'summary' && 'Connection Summary'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">

          {/* STEP 1: multi-select platforms */}
          {step === 'pick' && (
            <>
              <p className="text-sm text-slate-500 font-medium mb-5">
                Select one or more platforms to connect. You'll review permissions once, then be redirected to sign in for each.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORM_LIST.map((platform) => {
                  const Icon = platform.icon;
                  const alreadyConnected = connectedPlatformIds.includes(platform.id);
                  const isSelected = selectedIds.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => !alreadyConnected && togglePlatformSelect(platform.id)}
                      disabled={alreadyConnected}
                      className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                        alreadyConnected
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#311b92] bg-[#f8f5ff]'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{platform.name}</p>
                        {alreadyConnected && <p className="text-[10px] font-bold text-green-600">Connected</p>}
                      </div>

                      {!alreadyConnected && (
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-[#311b92] border-[#311b92]' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* STEP 2: permissions review for all selected platforms */}
          {step === 'permissions' && (
            <div className="space-y-4">
              {selectedPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.id} className="border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
                        <Icon size={16} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{platform.name}</p>
                    </div>
                    <div className="space-y-2 pl-1">
                      {platform.scopes.map((scope, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <ShieldCheck size={14} className="text-[#311b92] shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-slate-600 leading-snug">{scope}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-snug">
                  You'll sign in separately to each platform. You can revoke access anytime from Manage Account.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: connecting — live per-platform status */}
          {step === 'connecting' && (
            <div className="space-y-3">
              {selectedPlatforms.map((platform) => {
                const Icon = platform.icon;
                const entry = statusMap[platform.id] || { status: 'pending' };
                return (
                  <div key={platform.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
                      <Icon size={16} />
                    </div>
                    <p className="text-sm font-bold text-slate-800 flex-1">{platform.name}</p>
                    {entry.status === 'pending' && (
                      <span className="text-xs font-bold text-slate-400">Waiting...</span>
                    )}
                    {entry.status === 'connecting' && (
                      <Loader2 size={16} className="text-[#311b92] animate-spin" />
                    )}
                    {entry.status === 'success' && (
                      <CheckCircle2 size={18} className="text-green-500" />
                    )}
                    {entry.status === 'error' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                        <AlertCircle size={14} /> Failed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 4: summary */}
          {step === 'summary' && (
            <div>
              <div className="flex items-center justify-center gap-6 mb-6 py-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{successCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Connected</p>
                </div>
                {errorCount > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-rose-600">{errorCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Failed</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {selectedPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const entry = statusMap[platform.id] || {};
                  return (
                    <div key={platform.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
                        <Icon size={14} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 flex-1">{platform.name}</p>
                      {entry.status === 'success' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : (
                        <span className="text-xs font-bold text-rose-600">{entry.error || 'Failed'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 border-t border-slate-100 shrink-0">
          {step === 'pick' && (
            <button
              onClick={() => selectedIds.length > 0 && setStep('permissions')}
              disabled={selectedIds.length === 0}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedIds.length === 0
                ? 'Select a platform to continue'
                : `Continue with ${selectedIds.length} platform${selectedIds.length > 1 ? 's' : ''}`}
            </button>
          )}

          {step === 'permissions' && (
            <button
              onClick={startConnecting}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors"
            >
              Authorize & Connect {selectedPlatforms.length > 1 ? `All (${selectedPlatforms.length})` : ''}
            </button>
          )}

          {step === 'connecting' && (
            <div className="text-center text-xs font-bold text-slate-400">
              Complete the sign-in for each platform as it opens...
            </div>
          )}

          {step === 'summary' && (
            <div className="flex gap-3">
              {errorCount > 0 && (
                <button
                  onClick={retryFailed}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <RotateCcw size={15} /> Retry Failed
                </button>
              )}
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}