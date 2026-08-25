"use client";
import { useState } from 'react';
import {
  X, ShieldCheck, Loader2, AlertCircle, ChevronLeft,
  CheckCircle2, Check, RotateCcw
} from 'lucide-react';
import { PLATFORM_LIST, connectPlatforms } from '@/lib/api/accounts';
import { getUser, getToken } from '@/lib/auth/session';

// step: 'pick' -> 'permissions' -> 'connecting' -> 'summary'
export default function OAuthConnectModal({ isOpen, onClose, onConnected, connectedPlatformIds = [] }) {
  const [step, setStep] = useState('pick');
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { platformId: { status, error, account } }
  const [showFbWarning, setShowFbWarning] = useState(false);

  let selectedPlatforms = [];
  for (let i = 0; i < PLATFORM_LIST.length; i++) {
    let p = PLATFORM_LIST[i];
    if (selectedIds.includes(p.id)) {
      selectedPlatforms.push(p);
    }
  }

  const reset = () => {
    setStep('pick');
    setSelectedIds([]);
    setStatusMap({});
    setShowFbWarning(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const togglePlatformSelect = (platformId) => {
    let nextIds = [];
    if (selectedIds.includes(platformId)) {
      for (let i = 0; i < selectedIds.length; i++) {
        if (selectedIds[i] !== platformId) {
          nextIds.push(selectedIds[i]);
        }
      }
    } else {
      for (let i = 0; i < selectedIds.length; i++) {
        nextIds.push(selectedIds[i]);
      }
      nextIds.push(platformId);
    }
    setSelectedIds(nextIds);
  };

  const startConnecting = async () => {
    const currentUser = typeof window !== 'undefined' ? getUser() : null;
    const token = typeof window !== 'undefined' ? getToken() : null;
    let userId = null;
    if (currentUser) {
      userId = currentUser.id || currentUser.user_id;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    if (selectedIds.includes('facebook') || selectedIds.includes('instagram')) {
      if (!showFbWarning) {
        setShowFbWarning(true);
        return;
      }

      if (typeof window !== 'undefined') {
        let url = `${apiBase}/api/social/facebook/login`;
        if (userId) {
          url += `?user_id=${userId}`;
        } else if (token) {
          url += `?token=${token}`;
        }
        window.location.href = url;
      }
      return;
    }

    if (selectedIds.includes('linkedin')) {
      if (typeof window !== 'undefined') {
        let url = `${apiBase}/oauth/linkedin/login?redirect=true`;
        if (userId) {
          url += `&user_id=${userId}`;
        } else if (token) {
          url += `&token=${token}`;
        }
        window.location.href = url;
      }
      return;
    }

    setStep('connecting');
    const initialStatus = {};
    for (let i = 0; i < selectedIds.length; i++) {
      let id = selectedIds[i];
      initialStatus[id] = { status: 'pending' };
    }
    setStatusMap(initialStatus);

    const connectedAccounts = [];

    await connectPlatforms(selectedIds, (platformId, status, account, errorMsg) => {
      setStatusMap((prev) => {
        let nextMap = Object.assign({}, prev);
        nextMap[platformId] = { status: status, account: account, error: errorMsg };
        return nextMap;
      });
      if (status === 'success') {
        if (account) {
          connectedAccounts.push(account);
        }
      }
    });

    if (connectedAccounts.length > 0) {
      if (onConnected) {
        onConnected(connectedAccounts);
      }
    }
    setStep('summary');
  };

  const retryFailed = () => {
    let failedIds = [];
    let keys = Object.keys(statusMap);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      let val = statusMap[k];
      if (val) {
        if (val.status === 'error') {
          failedIds.push(k);
        }
      }
    }
    setSelectedIds(failedIds);
    startConnecting();
  };

  if (!isOpen) {
    return null;
  }

  let successCount = 0;
  let errorCount = 0;
  let statusKeys = Object.keys(statusMap);
  for (let i = 0; i < statusKeys.length; i++) {
    let k = statusKeys[i];
    let v = statusMap[k];
    if (v) {
      if (v.status === 'success') {
        successCount = successCount + 1;
      }
      if (v.status === 'error') {
        errorCount = errorCount + 1;
      }
    }
  }

  let headerTitle = 'Connect Account';
  if (step === 'permissions') {
    if (showFbWarning) {
      headerTitle = 'Facebook Page Required';
    } else {
      headerTitle = `Review Permissions (${selectedPlatforms.length})`;
    }
  } else if (step === 'connecting') {
    headerTitle = 'Connecting Accounts...';
  } else if (step === 'summary') {
    headerTitle = 'Connection Summary';
  }

  let modalContent = null;

  if (showFbWarning) {
    modalContent = (
      <div className="flex flex-col gap-5 py-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
            f
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Facebook Page Required</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Meta Graph API v19.0 Requirement</p>
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Meta requires a Business or Creator Page. Personal profiles are not supported.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <a
            href="https://www.facebook.com/pages/create/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold text-center transition-colors shadow-xs"
          >
            Create a Free Page
          </a>
          <button
            onClick={startConnecting}
            className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold text-center transition-colors shadow-md cursor-pointer"
          >
            I have a Page, Connect Now
          </button>
        </div>
      </div>
    );
  } else if (step === 'pick') {
    let pickButtons = [];
    for (let i = 0; i < PLATFORM_LIST.length; i++) {
      let platform = PLATFORM_LIST[i];
      let Icon = platform.icon;
      let alreadyConnected = false;
      if (connectedPlatformIds.includes(platform.id)) {
        alreadyConnected = true;
      }
      let isSelected = false;
      if (selectedIds.includes(platform.id)) {
        isSelected = true;
      }

      let cardClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
      if (alreadyConnected) {
        cardClass = 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed';
      } else if (isSelected) {
        cardClass = 'border-[#311b92] bg-[#f8f5ff]';
      }

      let checkIndicator = null;
      if (!alreadyConnected) {
        let boxClass = 'border-slate-300 bg-white';
        let checkIcon = null;
        if (isSelected) {
          boxClass = 'bg-[#311b92] border-[#311b92]';
          checkIcon = <Check size={12} className="text-white" strokeWidth={3} />;
        }
        checkIndicator = (
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${boxClass}`}>
            {checkIcon}
          </div>
        );
      }

      let connectedLabel = null;
      if (alreadyConnected) {
        connectedLabel = <p className="text-[10px] font-bold text-green-600">Connected</p>;
      }

      pickButtons.push(
        <button
          key={platform.id}
          onClick={() => {
            if (!alreadyConnected) {
              togglePlatformSelect(platform.id);
            }
          }}
          disabled={alreadyConnected}
          className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${cardClass}`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{platform.name}</p>
            {connectedLabel}
          </div>
          {checkIndicator}
        </button>
      );
    }

    modalContent = (
      <>
        <p className="text-sm text-slate-500 font-medium mb-5">
          Select one or more platforms to connect. You'll review permissions once, then be redirected to sign in for each.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {pickButtons}
        </div>
      </>
    );
  } else if (step === 'permissions') {
    let platformPermissions = [];
    for (let i = 0; i < selectedPlatforms.length; i++) {
      let platform = selectedPlatforms[i];
      let Icon = platform.icon;
      let scopeRows = [];
      if (platform.scopes) {
        for (let j = 0; j < platform.scopes.length; j++) {
          let scope = platform.scopes[j];
          scopeRows.push(
            <div key={`scope-${platform.id}-${j}`} className="flex items-start gap-2.5">
              <ShieldCheck size={14} className="text-[#311b92] shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-slate-600 leading-snug">{scope}</p>
            </div>
          );
        }
      }

      platformPermissions.push(
        <div key={platform.id} className="border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
              <Icon size={16} />
            </div>
            <p className="text-sm font-bold text-slate-800">{platform.name}</p>
          </div>
          <div className="space-y-2 pl-1">
            {scopeRows}
          </div>
        </div>
      );
    }

    modalContent = (
      <div className="space-y-4">
        {platformPermissions}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-snug">
            You'll sign in separately to each platform. You can revoke access anytime from Manage Account.
          </p>
        </div>
      </div>
    );
  } else if (step === 'connecting') {
    let connectingRows = [];
    for (let i = 0; i < selectedPlatforms.length; i++) {
      let platform = selectedPlatforms[i];
      let Icon = platform.icon;
      let entry = { status: 'pending' };
      if (statusMap[platform.id]) {
        entry = statusMap[platform.id];
      }

      let statusDisplay = <span className="text-xs font-bold text-slate-400">Waiting...</span>;
      if (entry.status === 'connecting') {
        statusDisplay = <Loader2 size={16} className="text-[#311b92] animate-spin" />;
      } else if (entry.status === 'success') {
        statusDisplay = <CheckCircle2 size={18} className="text-green-500" />;
      } else if (entry.status === 'error') {
        statusDisplay = (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
            <AlertCircle size={14} /> Failed
          </span>
        );
      }

      connectingRows.push(
        <div key={platform.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
            <Icon size={16} />
          </div>
          <p className="text-sm font-bold text-slate-800 flex-1">{platform.name}</p>
          {statusDisplay}
        </div>
      );
    }

    modalContent = (
      <div className="space-y-3">
        {connectingRows}
      </div>
    );
  } else if (step === 'summary') {
    let summaryRows = [];
    for (let i = 0; i < selectedPlatforms.length; i++) {
      let platform = selectedPlatforms[i];
      let Icon = platform.icon;
      let entry = {};
      if (statusMap[platform.id]) {
        entry = statusMap[platform.id];
      }

      let statusIndicator = <span className="text-xs font-bold text-rose-600">{entry.error || 'Failed'}</span>;
      if (entry.status === 'success') {
        statusIndicator = <CheckCircle2 size={16} className="text-green-500" />;
      }

      summaryRows.push(
        <div key={platform.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${platform.bg}`}>
            <Icon size={14} />
          </div>
          <p className="text-sm font-bold text-slate-800 flex-1">{platform.name}</p>
          {statusIndicator}
        </div>
      );
    }

    let errorSummaryBox = null;
    if (errorCount > 0) {
      errorSummaryBox = (
        <div className="text-center">
          <p className="text-2xl font-black text-rose-600">{errorCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Failed</p>
        </div>
      );
    }

    modalContent = (
      <div>
        <div className="flex items-center justify-center gap-6 mb-6 py-4">
          <div className="text-center">
            <p className="text-2xl font-black text-green-600">{successCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Connected</p>
          </div>
          {errorSummaryBox}
        </div>

        <div className="space-y-2">
          {summaryRows}
        </div>
      </div>
    );
  }

  let modalFooter = null;
  if (!showFbWarning) {
    if (step === 'pick') {
      let continueText = 'Select a platform to continue';
      if (selectedIds.length === 1) {
        continueText = 'Continue with 1 platform';
      } else if (selectedIds.length > 1) {
        continueText = `Continue with ${selectedIds.length} platforms`;
      }
      modalFooter = (
        <button
          onClick={() => {
            if (selectedIds.length > 0) {
              setStep('permissions');
            }
          }}
          disabled={selectedIds.length === 0}
          className="w-full py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {continueText}
        </button>
      );
    } else if (step === 'permissions') {
      let authBtnText = 'Authorize & Connect';
      if (selectedPlatforms.length > 1) {
        authBtnText = `Authorize & Connect All (${selectedPlatforms.length})`;
      }
      modalFooter = (
        <button
          onClick={startConnecting}
          className="w-full py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors cursor-pointer"
        >
          {authBtnText}
        </button>
      );
    } else if (step === 'connecting') {
      modalFooter = (
        <div className="text-center text-xs font-bold text-slate-400">
          Complete the sign-in for each platform as it opens...
        </div>
      );
    } else if (step === 'summary') {
      let retryBtn = null;
      if (errorCount > 0) {
        retryBtn = (
          <button
            onClick={retryFailed}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw size={15} /> Retry Failed
          </button>
        );
      }
      modalFooter = (
        <div className="flex gap-3">
          {retryBtn}
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      );
    }
  }

  let backButton = null;
  if (showFbWarning) {
    backButton = (
      <button
        onClick={() => setShowFbWarning(false)}
        className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
    );
  } else if (step === 'permissions') {
    backButton = (
      <button
        onClick={() => setStep('pick')}
        className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
    );
  }

  let footerSection = null;
  if (modalFooter) {
    footerSection = (
      <div className="px-6 py-5 border-t border-slate-100 shrink-0">
        {modalFooter}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">

        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {backButton}
            <h2 className="text-lg font-black text-slate-900">
              {headerTitle}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {modalContent}
        </div>

        {footerSection}

      </div>
    </div>
  );
}
