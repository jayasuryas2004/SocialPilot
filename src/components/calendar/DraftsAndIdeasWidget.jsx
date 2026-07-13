"use client";
import { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { FaInstagram, FaFacebook } from "react-icons/fa6";

export default function DraftsAndIdeasWidget({ allData = [] }) {
  const [activeTab, setActiveTab] = useState('post');

  // FIXED: Now correctly filters the allData prop
  const filteredData = activeTab === 'post' 
    ? allData.filter(item => item.type === 'post') 
    : allData.filter(item => item.type === 'draft');

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 h-[850px]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900">Draft & Ideas</h2>
        <button className="bg-white border border-slate-200 p-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          <Search size={18} className="text-slate-700" strokeWidth={2.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl w-fit border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveTab('post')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'post' ? 'bg-[#311b92] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Post (15)
        </button>
        <button 
          onClick={() => setActiveTab('drafts')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'drafts' ? 'bg-[#311b92] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Drafts (8)
        </button>
      </div>

      {/* Draft Cards List - Scrollable */}
      <div className="space-y-4 mt-2 overflow-y-auto custom-scrollbar pr-2 h-full">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            
            {/* Card Header */}
            <div className="flex justify-between items-center mb-3">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#311b92] focus:ring-[#311b92] cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-400">Edited 2m ago</span>
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex gap-4 items-center">
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                <img src={item.image} alt="Draft preview" className="w-full h-full object-cover" />
              </div>
              
              {/* Content */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <FaInstagram size={18} color="#E1306C" />
                  <FaFacebook size={18} color="#1877F2" />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {item.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
