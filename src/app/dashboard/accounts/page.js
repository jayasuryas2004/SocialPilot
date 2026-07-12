"use client";
import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import PlatformCard from '@/components/accounts/PlatformCard';
import OAuthConnectModal from '@/components/accounts/OAuthConnectModal';
import ManageAccountModal from '@/components/accounts/ManageAccountModal';
import AccountsKpiGrid from '@/components/accounts/AccountsKpiGrid';
import PlatformDistribution from '@/components/accounts/PlatformDistribution';
import TotalFollowers from '@/components/accounts/TotalFollowers'; // IMPORT UPDATED
import { fetchAccounts, reconnectAccount } from '@/lib/api/accounts';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [managingAccount, setManagingAccount] = useState(null);
  const [reconnectingId, setReconnectingId] = useState(null);

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
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

  const connectedPlatformIds = useMemo(
    () => accounts.filter(a => a.status === 'connected').map(a => a.platform),
    [accounts]
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-slate-900 pb-20">

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-slate-900">Social Accounts</h1>
          <p className="text-slate-500 font-medium mt-1">Connect and manage all your social media accounts from one place</p>
        </div>
        <button
          onClick={() => setIsConnectOpen(true)}
          className="bg-[#311b92] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] transition-colors shadow-sm whitespace-nowrap"
        >
          Connect Account +
        </button>
      </div>

      <AccountsKpiGrid accounts={accounts} />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-900">Social Accounts Overview</h2>
            <p className="text-sm text-slate-500 font-medium">Manage connected social media accounts</p>
          </div>
          <button onClick={loadAccounts} className="p-2 text-slate-400 hover:text-[#311b92] hover:bg-purple-50 rounded-lg transition-colors">
            <RefreshCw size={18} strokeWidth={2.5} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium mb-4">No accounts connected yet.</p>
            <button onClick={() => setIsConnectOpen(true)} className="bg-[#311b92] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] transition-colors">Connect your first account</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((account) => (
              <PlatformCard key={account.id} account={account} onManage={setManagingAccount} onReconnect={handleReconnect} />
            ))}
          </div>
        )}
      </div>

      {/* NEW ANALYTICS GRID */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-1">
            <PlatformDistribution accounts={accounts} />
          </div>
          <div className="xl:col-span-2">
            <TotalFollowers /> {/* REPLACED HERE */}
          </div>
        </div>
      )}

      <OAuthConnectModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} onConnected={handleConnected} connectedPlatformIds={connectedPlatformIds} />
      <ManageAccountModal account={managingAccount} onClose={() => setManagingAccount(null)} onDisconnected={handleDisconnected} onUpdated={handleUpdated} />
    </div>
  );
}