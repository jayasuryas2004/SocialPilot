"use client";
import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import AccountsOverview from '@/components/accounts/AccountsOverview';
import ConnectAccountsGrid from '@/components/accounts/ConnectAccountsGrid';
import AccountsKpiGrid from '@/components/accounts/AccountsKpiGrid';
import PlatformDistribution from '@/components/accounts/PlatformDistribution';
import TotalFollowers from '@/components/accounts/TotalFollowers';
import OAuthConnectModal from '@/components/accounts/OAuthConnectModal';
import ManageAccountModal from '@/components/accounts/ManageAccountModal';
import { fetchAccounts, reconnectAccount, connectPlatform } from '@/lib/api/accounts';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [managingAccount, setManagingAccount] = useState(null);
  const [reconnectingId, setReconnectingId] = useState(null);
  const [showFbModal, setShowFbModal] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccounts();
      if (Array.isArray(data)) {
        setAccounts(data);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnected = (newAccounts) => {
    let accountsToAdd = [];
    if (Array.isArray(newAccounts)) {
      for (let i = 0; i < newAccounts.length; i++) {
        accountsToAdd.push(newAccounts[i]);
      }
    } else if (newAccounts) {
      accountsToAdd.push(newAccounts);
    }
    let combined = [];
    for (let i = 0; i < accountsToAdd.length; i++) {
      combined.push(accountsToAdd[i]);
    }
    for (let i = 0; i < accounts.length; i++) {
      combined.push(accounts[i]);
    }
    setAccounts(combined);
  };

  const handleDisconnected = (accountId) => {
    let remaining = [];
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].id !== accountId) {
        remaining.push(accounts[i]);
      }
    }
    setAccounts(remaining);
  };

  const handleUpdated = (accountId, updates) => {
    let updatedList = [];
    for (let i = 0; i < accounts.length; i++) {
      let acc = accounts[i];
      if (acc.id === accountId) {
        let merged = Object.assign({}, acc, updates);
        updatedList.push(merged);
      } else {
        updatedList.push(acc);
      }
    }
    setAccounts(updatedList);
  };

  const handleReconnect = async (account) => {
    setReconnectingId(account.id);
    try {
      await reconnectAccount(account.id, account.platform);
      let updatedList = [];
      for (let i = 0; i < accounts.length; i++) {
        let acc = accounts[i];
        if (acc.id === account.id) {
          let merged = Object.assign({}, acc, { status: 'connected' });
          updatedList.push(merged);
        } else {
          updatedList.push(acc);
        }
      }
      setAccounts(updatedList);
    } catch (err) {
      let errMsg = 'Reconnect failed. Please try again.';
      if (err.message) {
        errMsg = err.message;
      }
      alert(errMsg);
    } finally {
      setReconnectingId(null);
    }
  };

  const handleConnectSinglePlatform = (platformId) => {
    if (platformId === 'facebook') {
      setShowFbModal(true);
      return;
    }
    if (platformId === 'fb') {
      setShowFbModal(true);
      return;
    }
    connectPlatform(platformId);
  };

  const handleConfirmFacebookConnect = () => {
    setShowFbModal(false);
    connectPlatform('facebook');
  };

  const connectedPlatformIds = useMemo(() => {
    const ids = [];
    for (let i = 0; i < accounts.length; i++) {
      const a = accounts[i];
      if (a) {
        if (a.platform) {
          let st = 'connected';
          if (a.status) {
            st = a.status;
          }
          if (st === 'connected') {
            ids.push(a.platform.toLowerCase());
          }
        }
      }
    }
    return ids;
  }, [accounts]);

  // Pre-OAuth Intercept Modal for Facebook
  let fbModalComponent = null;
  if (showFbModal) {
    fbModalComponent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center font-black text-2xl shadow-sm">
              f
            </div>
            <button
              onClick={() => setShowFbModal(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Facebook Page Required
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-2 leading-relaxed">
              To publish posts, Meta requires you to connect a Business or Creator Page. Personal profiles are not supported.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <a
              href="https://www.facebook.com/pages/create/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-colors shadow-xs"
            >
              Create a Free Page
            </a>
            <button
              onClick={handleConfirmFacebookConnect}
              className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold text-center transition-colors shadow-md cursor-pointer"
            >
              I have a Page, Connect Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  let analyticsSection = null;
  if (accounts.length > 0) {
    analyticsSection = (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-1">
          <PlatformDistribution accounts={accounts} />
        </div>
        <div className="xl:col-span-2">
          <TotalFollowers />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">Social Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Connect and manage all your social media accounts from one place</p>
        </div>
        <button
          onClick={() => setIsConnectOpen(true)}
          className="bg-[#311b92] dark:bg-[#5b21b6] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-colors shadow-sm whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} /> Connect Account
        </button>
      </div>

      {/* KPI Cards */}
      <AccountsKpiGrid accounts={accounts} />

      {/* Live Accounts Overview */}
      <AccountsOverview
        accounts={accounts}
        isLoading={isLoading}
        onManage={setManagingAccount}
        onReconnect={handleReconnect}
        onOpenConnect={() => setIsConnectOpen(true)}
        onRefresh={loadAccounts}
      />

      {/* Dynamic Platform Connection Status Grid */}
      <ConnectAccountsGrid
        accounts={accounts}
        onConnectPlatform={handleConnectSinglePlatform}
      />

      {/* Analytics Breakdown */}
      {analyticsSection}

      {/* Modals */}
      <OAuthConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onConnected={handleConnected}
        connectedPlatformIds={connectedPlatformIds}
      />
      <ManageAccountModal
        account={managingAccount}
        onClose={() => setManagingAccount(null)}
        onDisconnected={handleDisconnected}
        onUpdated={handleUpdated}
      />

      {/* Pre-OAuth Facebook Intercept Modal */}
      {fbModalComponent}
    </div>
  );
}
