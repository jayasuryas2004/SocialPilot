"use client";
import { useState, useEffect } from 'react';
import CampaignKpiGrid from '@/components/campaigns/CampaignKpiGrid';
import CampaignAnalytics from '@/components/campaigns/CampaignAnalytics';
import CampaignList from '@/components/campaigns/CampaignList';
import CampaignForm from '@/components/campaigns/CampaignForm';
import PostComposerModal from '@/components/posts/PostComposerModal';
import { getCampaigns, createCampaign, updateCampaign } from '@/lib/api/campaigns';
import { getWorkspaceStatus } from '@/lib/api/workspace';
import { createPost } from '@/lib/api/posts';

export default function CampaignsMainPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isPostOpen, setIsPostOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCampaigns() {
      try {
        setLoading(true);
        const workspace = await getWorkspaceStatus();
        if (isMounted) {
          if (workspace && Array.isArray(workspace.campaigns) && workspace.campaigns.length > 0) {
            setCampaigns(workspace.campaigns);
          } else {
            const fallback = await getCampaigns();
            setCampaigns(Array.isArray(fallback) ? fallback : []);
          }
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load campaigns from backend:", err);
        if (isMounted) {
          try {
            const fallback = await getCampaigns();
            setCampaigns(Array.isArray(fallback) ? fallback : []);
          } catch (e) {
            setError(err?.message || "Failed to load campaigns.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveCampaign = async (campaignData) => {
    try {
      if (editingCampaign) {
        const updated = await updateCampaign(editingCampaign.id, campaignData);
        setCampaigns((prev) => {
          const updatedList = [];
          for (let i = 0; i < prev.length; i++) {
            const c = prev[i];
            if (c.id === editingCampaign.id) {
              updatedList.push({ ...c, ...updated, fullText: campaignData.description || c.fullText });
            } else {
              updatedList.push(c);
            }
          }
          return updatedList;
        });
      } else {
        const created = await createCampaign(campaignData);
        setCampaigns((prev) => [created, ...prev]);
      }
      setIsFormOpen(false);
      setEditingCampaign(null);
    } catch (error) {
      console.error('Save error:', error);
      alert('There was an error saving the campaign. Please try again.');
      throw error;
    }
  };

  const handleSavePost = async (postPayload) => {
    try {
      const created = await createPost(postPayload);
      console.log('Post scheduled on backend from Campaign Page:', created);
    } catch (err) {
      console.error('Failed to schedule post:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">Campaign Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage, organize and schedule all your social media content</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPostOpen(true)}
            className="bg-white dark:bg-slate-800 text-[#311b92] dark:text-purple-300 border-2 border-[#311b92] dark:border-purple-500 font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#f8f5ff] dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            Add Post
          </button>
          <button
            onClick={() => { setEditingCampaign(null); setIsFormOpen(true); }}
            className="bg-[#311b92] dark:bg-[#5b21b6] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] dark:hover:bg-[#4c1d95] transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            New Campaign
          </button>
        </div>
      </div>

      <CampaignKpiGrid campaigns={campaigns} />
      <CampaignAnalytics campaigns={campaigns} />

      <div className="mt-8">
        <CampaignList
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          onEditExternal={(camp) => { setEditingCampaign(camp); setIsFormOpen(true); }}
        />
      </div>

      <CampaignForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingCampaign(null); }}
        initialData={editingCampaign}
        onSave={handleSaveCampaign}
      />

      <PostComposerModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        campaigns={campaigns}
        onSave={handleSavePost}
      />
    </div>
  );
}
