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

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnected = (newAccounts) => {
    const accountsToAdd = Array.isArray(newAccounts) ? newAccounts : [newAccounts];
    setAccounts((prev) => [...accountsToAdd, ...prev]);
  };

  const handleDisconnected = (accountId) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
  };

  const handleUpdated = (accountId, updates) => {
    setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, ...updates } : a)));
  };

  const handleReconnect = async (account) => {
    setReconnectingId(account.id);
    try {
      await reconnectAccount(account.id, account.platform);
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, status: 'connected' } : a))
      );
    } catch (err) {
      alert(err.message || 'Reconnect failed. Please try again.');
    } finally {
      setReconnectingId(null);
    }
  };

  const handleConnectSinglePlatform = (platformId) => {
    connectPlatform(platformId);
  };

  const connectedPlatformIds = useMemo(() => {
    const ids = [];
    for (let i = 0; i < accounts.length; i++) {
      const a = accounts[i];
      if (a && a.platform && (a.status || 'connected') === 'connected') {
        ids.push(a.platform.toLowerCase());
      }
    }
    return ids;
  }, [accounts]);

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
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-1">
            <PlatformDistribution accounts={accounts} />
          </div>
          <div className="xl:col-span-2">
            <TotalFollowers />
          </div>
        </div>
      )}

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
    </div>
  );
}
