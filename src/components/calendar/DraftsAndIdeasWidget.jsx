"use client";
import { useState } from 'react';
import { Search, MoreVertical, Eye, Trash2, Edit } from 'lucide-react';
import { FaInstagram, FaFacebook } from "react-icons/fa6";

export default function DraftsAndIdeasWidget({ allData = [] }) {
  const [activeTab, setActiveTab] = useState('post');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filteredData = [];
  for (let i = 0; i < allData.length; i++) {
    const item = allData[i];
    if (activeTab === 'post' && item.type === 'post') {
      filteredData.push(item);
    } else if (activeTab === 'drafts' && item.type === 'draft') {
      filteredData.push(item);
    }
  }

  let postCount = 0;
  let draftCount = 0;
  for (let i = 0; i < allData.length; i++) {
    if (allData[i].type === 'post') postCount++;
    else if (allData[i].type === 'draft') draftCount++;
  }

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 h-[850px] transition-colors">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Draft & Ideas</h2>
        <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer">
          <Search size={18} className="text-slate-700 dark:text-slate-200" strokeWidth={2.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700 shadow-sm">
        <button 
          onClick={() => { setActiveTab('post'); setActiveDropdown(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'post' 
              ? 'bg-[#311b92] dark:bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Post ({postCount || 15})
        </button>
        <button 
          onClick={() => { setActiveTab('drafts'); setActiveDropdown(null); }}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'drafts' 
              ? 'bg-[#311b92] dark:bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Drafts ({draftCount || 8})
        </button>
      </div>

      {/* Draft Cards List - Scrollable */}
      <div className="space-y-4 mt-2 overflow-y-auto custom-scrollbar pr-2 h-full pb-10">
        {filteredData.map((item, index) => {
          const isNearBottom = index >= filteredData.length - 2;
          const isDropdownOpen = activeDropdown === item.id;

          return (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${
                isDropdownOpen ? 'relative z-50' : 'relative'
              }`}
            >
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-3">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#311b92] focus:ring-[#311b92] cursor-pointer" />
                <div className="flex items-center gap-2 relative">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400">Edited 2m ago</span>
                  <button 
                    onClick={() => setActiveDropdown(isDropdownOpen ? null : item.id)}
                    className="text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                      <div className={`absolute right-0 ${isNearBottom ? 'bottom-full mb-1' : 'top-full mt-1'} w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl z-50 flex flex-col py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100`}>
                        <button 
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left cursor-pointer"
                        >
                          <Eye size={13} /> Preview
                        </button>
                        <button 
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left cursor-pointer"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                        <button 
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex gap-4 items-center">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-slate-100 dark:border-slate-600">
                  <img src={item.image} alt="Draft preview" className="w-full h-full object-cover" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <FaInstagram size={18} color="#E1306C" />
                    <FaFacebook size={18} color="#1877F2" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
