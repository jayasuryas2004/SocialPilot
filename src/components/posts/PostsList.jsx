"use client";
import { useState, useMemo, useEffect } from 'react';
import {
  Search, Trash2, CheckCircle2, Download, X, Eye,
  Edit, MoreVertical, ChevronRight, ChevronLeft, Calendar,
  AlertTriangle, RefreshCw, Loader2, UploadCloud
} from 'lucide-react';
import {
  FaInstagram, FaFacebook, FaLinkedin, FaXTwitter
} from "react-icons/fa6";

// --- MOCK DATABASE ---
const INITIAL_DATA = [
  { id: 1, title: 'Summer sale reel', subtitle: 'Biggest sale of the year get up to 50% off', platform: 'Instagram', handle: 'socialpilot', campaign: 'Summer Sale', date: 'May 20, 2026', time: '10:00 am', status: 'Published', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop', fullText: "Get ready for the biggest event! Our Summer Sale is live. Use code SUMMER50." },
  { id: 2, title: 'Winter Skincare Tips', subtitle: 'Keep your skin glowing', platform: 'LinkedIn', handle: 'socialpilot_b2b', campaign: 'Winter Skincare', date: 'Dec 05, 2026', time: '09:00 am', status: 'Scheduled', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop', fullText: "Dry skin this winter? Here are 5 tips to keep your glow." },
  { id: 3, title: 'Product Launch Teaser', subtitle: 'Coming soon...', platform: 'Facebook', handle: 'socialpilot_hq', campaign: 'Spring Launch', date: 'Mar 10, 2026', time: '12:00 pm', status: 'Draft', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop', fullText: "Something big is coming. Can you guess what it is?" },
  { id: 4, title: 'Holiday Giveaway', subtitle: 'Win a free subscription', platform: 'X-Twitter', handle: 'socialpilot', campaign: 'Winter Skincare', date: 'Dec 20, 2026', time: '03:00 pm', status: 'Failed', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop', fullText: "RT & Follow to win a free year of our premium plan!" },
  { id: 5, title: 'Summer Collection', subtitle: 'New arrivals are here', platform: 'Instagram', handle: 'socialpilot', campaign: 'Summer Sale', date: 'May 22, 2026', time: '11:00 am', status: 'Published', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop', fullText: "The summer collection just dropped. Link in bio!" },
  { id: 6, title: 'B2B Marketing Webinar', subtitle: 'Join us live', platform: 'LinkedIn', handle: 'socialpilot_b2b', campaign: 'Spring Launch', date: 'Apr 02, 2026', time: '02:00 pm', status: 'Scheduled', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop', fullText: "Join our CEO for a live webinar on B2B growth." },
  { id: 7, title: 'Flash Sale Reminder', subtitle: 'Only 2 hours left', platform: 'Instagram', handle: 'socialpilot', campaign: 'Summer Sale', date: 'May 25, 2026', time: '04:00 pm', status: 'Draft', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop', fullText: "Only 2 hours left on our biggest sale of the year!" },
  { id: 8, title: 'Customer Success Story', subtitle: 'Read our latest case study', platform: 'LinkedIn', handle: 'socialpilot_b2b', campaign: 'Spring Launch', date: 'Jun 15, 2026', time: '10:30 am', status: 'Failed', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150&h=150&fit=crop', fullText: "Read how our customer doubled engagement in 90 days." },
];

const CAMPAIGNS = ['Summer Sale', 'Winter Skincare', 'Spring Launch'];
const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'X-Twitter'];
const STATUSES = ['Published', 'Scheduled', 'Draft', 'Failed'];

export default function PostsList() {
  const [posts, setPosts] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('All posts');
  const [selectedPosts, setSelectedPosts] = useState([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('Platform');
  const [filterStatus, setFilterStatus] = useState('Status');
  const [filterCampaign, setFilterCampaign] = useState('Campaign');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals / UI
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isRetrying, setIsRetrying] = useState(null); // holds the post id currently retrying
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null); // draft values while editing the preview modal

  // Posts matching every filter EXCEPT the tab/status itself — used to size the tab counts
  // so a tab's count always reflects what you'd actually see if you clicked it.
  const postsMatchingNonTabFilters = useMemo(() => {
    return posts.filter(post => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q);
      const matchPlatform = filterPlatform === 'Platform' ? true : post.platform === filterPlatform;
      const matchStatus = filterStatus === 'Status' ? true : post.status === filterStatus;
      const matchCampaign = filterCampaign === 'Campaign' ? true : post.campaign === filterCampaign;
      return matchSearch && matchPlatform && matchStatus && matchCampaign;
    });
  }, [posts, searchQuery, filterPlatform, filterStatus, filterCampaign]);

  // --- FILTERING (tab + all other filters) ---
  const filteredPosts = useMemo(() => {
    return postsMatchingNonTabFilters.filter(post => {
      const matchTab = activeTab === 'All posts' ? true : post.status === activeTab;
      return matchTab;
    });
  }, [postsMatchingNonTabFilters, activeTab]);

  // Reset pagination/selection whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedPosts([]);
  }, [activeTab, searchQuery, filterPlatform, filterStatus, filterCampaign]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));

  // Keep currentPage in range if posts shrink (e.g. after delete)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentTableData = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- HANDLERS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedPosts(currentTableData.map(p => p.id));
    else setSelectedPosts([]);
  };

  const handleSelectOne = (id) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(postId => postId !== id) : [...prev, id]
    );
  };

  const executeDelete = () => {
    if (deleteTarget === 'bulk') {
      setPosts(prev => prev.filter(p => !selectedPosts.includes(p.id)));
      setSelectedPosts([]);
    } else {
      setPosts(prev => prev.filter(p => p.id !== deleteTarget));
      setSelectedPosts(prev => prev.filter(id => id !== deleteTarget));
      if (previewPost?.id === deleteTarget) closePreview();
    }
    setDeleteTarget(null);
    setActiveDropdown(null);
  };

  const handleRetry = (id) => {
    setIsRetrying(id);
    setTimeout(() => {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Published' } : p));
      setIsRetrying(null);
      setPreviewPost(null);
      setActiveDropdown(null);
    }, 1500);
  };

  const handleEdit = (post) => {
    setPreviewPost(post);
    setEditForm({
      title: post.title,
      subtitle: post.subtitle,
      fullText: post.fullText,
      campaign: post.campaign,
      date: post.date,
      time: post.time,
    });
    setIsEditing(true);
    setActiveDropdown(null);
  };

  const handleSaveEdit = () => {
    setPosts(prev => prev.map(p => p.id === previewPost.id ? { ...p, ...editForm } : p));
    setPreviewPost(prev => ({ ...prev, ...editForm }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const closePreview = () => {
    setPreviewPost(null);
    setIsEditing(false);
    setEditForm(null);
  };

  const openPreview = (post) => {
    setPreviewPost(post);
    setIsEditing(false);
    setEditForm(null);
  };

  // --- UI HELPERS ---
  const getStatusBadge = (status) => {
    const styles = {
      published: "bg-emerald-100 text-emerald-800",
      scheduled: "bg-purple-100 text-purple-800",
      draft: "bg-yellow-100 text-yellow-800",
      failed: "bg-rose-100 text-rose-800",
    };
    return (
      <span className={`${styles[status.toLowerCase()]} px-3 py-1 rounded-full text-[10px] font-bold uppercase w-max`}>
        {status}
      </span>
    );
  };

  const getPlatformIcon = (platform, size = 16) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <FaInstagram size={size} color="#E1306C" />;
      case 'linkedin': return <FaLinkedin size={size} color="#0A66C2" />;
      case 'facebook': return <FaFacebook size={size} color="#1877F2" />;
      case 'x-twitter': return <FaXTwitter size={size} color="#0f1419" />;
      default: return <FaInstagram size={size} color="#E1306C" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col relative mt-6 min-h-[600px]">

      {/* 1. FILTER BAR */}
      <div className="p-6 flex flex-wrap gap-3 items-center border-b border-slate-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium w-48 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92] transition-all"
            placeholder="Search"
          />
        </div>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50"
        >
          <option>Platform</option>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50"
        >
          <option>Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50"
        >
          <option>Campaign</option>
          {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
        </select>

        <div className="relative">
          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          <select className="border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50 appearance-none">
            <option>Date</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
        </div>
      </div>

      {/* 2. TABS */}
      <div className="px-6 flex gap-8 border-b border-slate-100 overflow-x-auto">
        {[
          { name: 'All posts', count: postsMatchingNonTabFilters.length },
          { name: 'Scheduled', count: postsMatchingNonTabFilters.filter(p => p.status === 'Scheduled').length },
          { name: 'Published', count: postsMatchingNonTabFilters.filter(p => p.status === 'Published').length },
          { name: 'Draft', count: postsMatchingNonTabFilters.filter(p => p.status === 'Draft').length },
          { name: 'Failed', count: postsMatchingNonTabFilters.filter(p => p.status === 'Failed').length },
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.name ? 'border-[#311b92] text-[#311b92]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* BULK ACTION BAR */}
      {selectedPosts.length > 0 && (
        <div className="mx-6 mt-6 bg-[#f3e8ff] rounded-xl px-6 py-3 flex items-center justify-between border border-[#e9d5ff]">
          <span className="font-bold text-[#4c1d95] text-sm">{selectedPosts.length} posts selected</span>
          <div className="flex items-center gap-6">
            <button onClick={() => setDeleteTarget('bulk')} className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700">
              <Trash2 size={16} /> Delete
            </button>
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#4c1d95] hover:text-[#311b92]">
              <Download size={16} /> Export
            </button>
            <div className="w-px h-5 bg-purple-200 mx-2"></div>
            <button onClick={() => setSelectedPosts([])} className="text-slate-500 hover:text-slate-800">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* 3. TABLE */}
      <div className="w-full overflow-x-auto mt-2 flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-800">
              <th className="py-4 pl-6 pr-4 w-12">
                <input
                  type="checkbox"
                  checked={currentTableData.length > 0 && selectedPosts.length === currentTableData.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#311b92] cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 w-20">Preview</th>
              <th className="py-4 px-4 min-w-[200px]">Title</th>
              <th className="py-4 px-4">Platform</th>
              <th className="py-4 px-4">Campaign</th>
              <th className="py-4 px-4">Schedule Date</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 pr-6 pl-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {currentTableData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-16 text-slate-500 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-slate-300 mb-2" />
                    <p>No posts found for this tab/filter.</p>
                  </div>
                </td>
              </tr>
            ) : currentTableData.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 pl-6 pr-4 relative">
                  {selectedPosts.includes(post.id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#311b92] rounded-r"></div>}
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedPosts.includes(post.id) ? 'bg-[#311b92] border-[#311b92]' : 'border-slate-300 bg-white'}`}
                    onClick={() => handleSelectOne(post.id)}
                  >
                    {selectedPosts.includes(post.id) && <CheckCircle2 size={12} className="text-white" strokeWidth={4} />}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                    onClick={() => openPreview(post)}
                  >
                    <img src={post.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="py-4 px-4 cursor-pointer" onClick={() => openPreview(post)}>
                  <p className="font-bold text-slate-800 text-sm hover:text-[#311b92] transition-colors">{post.title}</p>
                  <p className="text-[11px] font-medium text-slate-400 truncate max-w-[200px] mt-0.5">{post.subtitle}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(post.platform)}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{post.platform}</span>
                      <span className="text-[10px] text-slate-400">@{post.handle}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-xs font-bold text-slate-800">{post.campaign}</td>
                <td className="py-4 px-4">
                  <p className="text-xs font-bold text-slate-600">{post.date}</p>
                  <p className="text-[10px] text-slate-400">{post.time}</p>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(post.status)}
                </td>
                <td className="py-4 pr-6 pl-4 relative text-center">
                  <div className="inline-block relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                        activeDropdown === post.id ? 'bg-[#28157a] text-white' : 'bg-[#311b92] text-white hover:bg-[#28157a]'
                      }`}
                    >
                      <MoreVertical size={16} strokeWidth={2.5} />
                    </button>

                    {activeDropdown === post.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)}></div>
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 flex flex-col py-2 overflow-hidden">
                          <button
                            onClick={() => { openPreview(post); setActiveDropdown(null); }}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <Eye size={16} strokeWidth={2.5} /> Preview
                          </button>

                          {['Scheduled', 'Draft', 'Failed'].includes(post.status) && (
                            <button
                              onClick={() => handleEdit(post)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 text-left"
                            >
                              <Edit size={16} strokeWidth={2.5} /> Edit
                            </button>
                          )}

                          {['Draft', 'Failed'].includes(post.status) && (
                            <button
                              onClick={() => handleRetry(post.id)}
                              disabled={isRetrying === post.id}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-[#311b92] hover:bg-purple-50 text-left disabled:opacity-60"
                            >
                              {isRetrying === post.id ? (
                                <><Loader2 size={16} className="animate-spin" /> Retrying...</>
                              ) : (
                                <><UploadCloud size={16} strokeWidth={2.5} /> Retry</>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => { setDeleteTarget(post.id); setActiveDropdown(null); }}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 text-left"
                          >
                            <Trash2 size={16} strokeWidth={2.5} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. PAGINATION */}
      <div className="p-6 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-sm font-bold text-slate-400">
          Showing {currentTableData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                  currentPage === page
                    ? 'border-2 border-[#311b92] bg-[#f8f5ff] text-[#311b92]'
                    : 'border border-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* 5. DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-5 mx-auto">
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-center text-slate-900 mb-2">Delete this post?</h3>
            <p className="text-slate-500 text-sm font-medium text-center mb-8">
              This action cannot be undone. Are you sure you want to permanently delete {deleteTarget === 'bulk' ? 'these selected posts' : 'this post'}?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PREVIEW / EDIT MODAL */}
      {previewPost && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-3xl overflow-hidden max-w-[700px] w-full max-h-full shadow-2xl flex flex-col md:flex-row">
            <div className="w-full md:w-5/12 bg-slate-900 flex-shrink-0 h-48 md:h-auto relative">
              <img src={previewPost.image} alt={previewPost.title} className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <div className="p-8 w-full md:w-7/12 flex flex-col relative overflow-y-auto">
              <button
                onClick={closePreview}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              <div className="mb-4 flex items-center gap-2">
                {getStatusBadge(previewPost.status)}
                {isEditing && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#311b92] bg-[#f3e8ff] px-2.5 py-1 rounded-full">
                    Editing
                  </span>
                )}
              </div>

              {isEditing ? (
                <>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="mb-4 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                  />

                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Subtitle</label>
                  <input
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className="mb-4 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-[22px] leading-tight font-black text-slate-900 mb-2">{previewPost.title}</h2>
                  <div className="flex items-center gap-2 mb-6">
                    {getPlatformIcon(previewPost.platform, 18)}
                    <span className="font-bold text-sm text-slate-900">{previewPost.platform}</span>
                    <span className="text-slate-400 text-sm">@{previewPost.handle}</span>
                  </div>
                </>
              )}

              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Caption</h4>
              {isEditing ? (
                <textarea
                  value={editForm.fullText}
                  onChange={(e) => setEditForm({ ...editForm, fullText: e.target.value })}
                  rows={3}
                  className="text-slate-700 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92] resize-none"
                />
              ) : (
                <p className="text-slate-700 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {previewPost.fullText}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mt-auto border-t border-slate-100 pt-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Scheduled For</h4>
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                      />
                      <input
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-500 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                      />
                    </div>
                  ) : (
                    <p className="font-bold text-slate-800 text-sm">{previewPost.date} <br /> <span className="text-slate-500 font-medium">{previewPost.time}</span></p>
                  )}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Campaign</h4>
                  {isEditing ? (
                    <select
                      value={editForm.campaign}
                      onChange={(e) => setEditForm({ ...editForm, campaign: e.target.value })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                    >
                      {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  ) : (
                    <p className="font-bold text-slate-800 text-sm">{previewPost.campaign}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors"
                    >
                      <CheckCircle2 size={16} /> Save changes
                    </button>
                  </>
                ) : (
                  <>
                    {['Scheduled', 'Draft', 'Failed'].includes(previewPost.status) && (
                      <button
                        onClick={() => handleEdit(previewPost)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Edit size={16} /> Edit
                      </button>
                    )}

                    {['Draft', 'Failed'].includes(previewPost.status) && (
                      <button
                        onClick={() => handleRetry(previewPost.id)}
                        disabled={isRetrying === previewPost.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors disabled:opacity-70"
                      >
                        {isRetrying === previewPost.id ? (
                          <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                        ) : (
                          <><RefreshCw size={16} /> Publish Now</>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
