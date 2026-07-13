"use client";
import { useState } from 'react';
import CampaignKpiGrid from '@/components/campaigns/CampaignKpiGrid';
import CampaignAnalytics from '@/components/campaigns/CampaignAnalytics';
import CampaignList from '@/components/campaigns/CampaignList';
import CampaignForm from '@/components/campaigns/CampaignForm';
import PostComposerModal from '@/components/posts/PostComposerModal';

const INITIAL_DATA = [
  { id: 1, title: 'Summer sale reel', subtitle: 'Biggest sale of the year get up to 50% off', description: 'Driving sales for the new summer collection across all visual channels.', fullText: 'Driving sales for the new summer collection across all visual channels.', platforms: ['Instagram', 'Facebook'], objective: 'Sales', startDate: '2026-05-20', endDate: '2026-06-20', status: 'Active', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop' },
  { id: 2, title: 'Winter Skincare Tips', subtitle: 'Keep your skin glowing', description: 'Educational campaign targeting B2B professionals.', fullText: 'Educational campaign targeting B2B professionals.', platforms: ['LinkedIn'], objective: 'Awareness', startDate: '2026-12-05', endDate: '2026-12-25', status: 'Scheduled', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop' },
  { id: 3, title: 'Product Launch Teaser', subtitle: 'Coming soon...', description: 'Building hype for the upcoming Q1 product reveal.', fullText: 'Building hype for the upcoming Q1 product reveal.', platforms: ['X-Twitter', 'YouTube'], objective: 'Awareness', startDate: '2026-03-10', endDate: '2026-03-15', status: 'Draft', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop' },
];


export default function CampaignsMainPage() {
  const [campaigns, setCampaigns] = useState(INITIAL_DATA);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // NEW: Post composer state
  const [isPostOpen, setIsPostOpen] = useState(false);

  const handleSaveCampaign = async (campaignData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      if (editingCampaign) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...campaignData, fullText: campaignData.description } : c))
        );
      } else {
        const newCampaign = {
          ...campaignData,
          fullText: campaignData.description,
          id: Date.now(),
          image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&h=150&fit=crop',
        };
        setCampaigns((prev) => [newCampaign, ...prev]);
      }
      setIsFormOpen(false);
      setEditingCampaign(null);
    } catch (error) {
      console.error('Save error:', error);
      alert('There was an error saving the campaign. Please try again.');
      throw error;
    }
  };

  // NEW: handle scheduled post (swap this simulated call for a real API POST later)
  const handleSavePost = async (postPayload) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('Post scheduled:', postPayload);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 text-slate-900 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">Campaign Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage, organize and schedule all your social media content</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPostOpen(true)}
            className="bg-white text-[#311b92] border-2 border-[#311b92] font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#f8f5ff] transition-colors whitespace-nowrap"
          >
            Add Post
          </button>
          <button
            onClick={() => { setEditingCampaign(null); setIsFormOpen(true); }}
            className="bg-[#311b92] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#28157a] transition-colors shadow-sm whitespace-nowrap"
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

      {/* campaigns is passed live from state, so PostComposerModal always sees current campaigns */}
      <PostComposerModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        campaigns={campaigns}
        onSave={handleSavePost}
      />
    </div>
  );
}
