"use client";
import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaRocket } from "react-icons/fa6";

const getPlatformIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('linkedin')) return <FaLinkedin className="text-[#0A66C2]" size={16} />;
  if (p.includes('instagram')) return <FaInstagram className="text-pink-500" size={16} />;
  if (p.includes('facebook')) return <FaFacebook className="text-blue-500" size={16} />;
  if (p.includes('twitter') || p.includes('x')) return <FaXTwitter className="text-slate-800 dark:text-white" size={16} />;
  return <FaRocket className="text-purple-600 dark:text-purple-400" size={16} />;
};

export default function CampaignPerformance({ campaigns = [] }) {
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-black text-slate-900 dark:text-white text-lg">Campaign Performance</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Aggregated campaign reach and ROI statistics</p>
        </div>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          {safeCampaigns.length} campaigns analyzed
        </span>
      </div>

      {safeCampaigns.length === 0 ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500">
          <p className="font-medium text-sm">No campaigns active or tracked yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Organize your posts under Campaigns to measure cumulative impact.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Engagement</th>
                <th className="px-6 py-4">Reach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {safeCampaigns.map((campaign) => (
                <tr key={`campaign-row-${campaign.id}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={campaign.img || campaign.image || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop"}
                      alt="campaign preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 dark:border-slate-700"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{campaign.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{campaign.platform}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{campaign.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{campaign.engagement}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{campaign.reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
