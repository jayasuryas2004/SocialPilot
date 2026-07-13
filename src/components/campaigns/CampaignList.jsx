"use client";
import { useState, useMemo, useEffect } from 'react';
import {
  Search, Trash2, CheckCircle2, X, Eye, Edit, MoreVertical,
  ChevronRight, ChevronLeft, AlertTriangle, Save,
} from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

const PLATFORMS_LIST = [
  { id: 'Instagram', icon: FaInstagram, color: 'hover:text-[#E1306C] hover:bg-pink-50', activeColor: 'text-[#E1306C] bg-pink-50 border-pink-200' },
  { id: 'Facebook', icon: FaFacebook, color: 'hover:text-[#1877F2] hover:bg-blue-50', activeColor: 'text-[#1877F2] bg-blue-50 border-blue-200' },
  { id: 'LinkedIn', icon: FaLinkedin, color: 'hover:text-[#0A66C2] hover:bg-blue-50', activeColor: 'text-[#0A66C2] bg-blue-50 border-blue-200' },
  { id: 'X-Twitter', icon: FaXTwitter, color: 'hover:text-[#0f1419] hover:bg-slate-100', activeColor: 'text-[#0f1419] bg-slate-100 border-slate-300' },
  { id: 'YouTube', icon: FaYoutube, color: 'hover:text-[#FF0000] hover:bg-red-50', activeColor: 'text-[#FF0000] bg-red-50 border-red-200' },
];

const PLATFORM_ICON_MAP = {
  Instagram: FaInstagram, Facebook: FaFacebook, LinkedIn: FaLinkedin, 'X-Twitter': FaXTwitter, YouTube: FaYoutube,
};
const PLATFORM_COLOR_MAP = {
  Instagram: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
  Facebook: 'bg-[#1877F2]', LinkedIn: 'bg-[#0A66C2]', 'X-Twitter': 'bg-[#0f1419]', YouTube: 'bg-[#FF0000]',
};

const STATUS_STYLES = {
  active: { badge: 'bg-[#dcfce7] text-[#166534]', dot: 'bg-[#166534]' },
  scheduled: { badge: 'bg-[#f3e8ff] text-[#6b21a8]', dot: 'bg-[#6b21a8]' },
  draft: { badge: 'bg-[#fef08a] text-[#854d0e]', dot: 'bg-[#854d0e]' },
  completed: { badge: 'bg-[#e0f2fe] text-[#1e40af]', dot: 'bg-[#1e40af]' },
};

const ITEMS_PER_PAGE = 5;

export default function CampaignList({ campaigns, setCampaigns, onEditExternal }) {
  const [activeTab, setActiveTab] = useState('All Campaigns');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('Platform');
  const [filterStatus, setFilterStatus] = useState('Status');
  const [filterObjective, setFilterObjective] = useState('Objective');

  const [currentPage, setCurrentPage] = useState(1);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Lock background scroll whenever any modal is open
  useEffect(() => {
    const anyModalOpen = !!previewCampaign || !!deleteTarget;
    document.body.style.overflow = anyModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [previewCampaign, deleteTarget]);

  // --- FILTERING ---
  const campaignsMatchingNonTabFilters = useMemo(() => {
    return campaigns.filter((camp) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        camp.title.toLowerCase().includes(q) ||
        (camp.subtitle && camp.subtitle.toLowerCase().includes(q));
      const matchPlatform = filterPlatform === 'Platform' ? true : camp.platforms.includes(filterPlatform);
      const matchStatus = filterStatus === 'Status' ? true : camp.status === filterStatus;
      const matchObjective = filterObjective === 'Objective' ? true : camp.objective === filterObjective;
      return matchSearch && matchPlatform && matchStatus && matchObjective;
    });
  }, [campaigns, searchQuery, filterPlatform, filterStatus, filterObjective]);

  const filteredCampaigns = useMemo(() => {
    return campaignsMatchingNonTabFilters.filter((camp) => {
      if (activeTab === 'All Campaigns') return true;
      const tabStatus = activeTab.replace(' Campaigns', '');
      return camp.status === tabStatus;
    });
  }, [campaignsMatchingNonTabFilters, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedCampaigns([]);
  }, [activeTab, searchQuery, filterPlatform, filterStatus, filterObjective]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentTableData = filteredCampaigns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- SELECTION ---
  const handleSelectAll = (e) => {
    setSelectedCampaigns(e.target.checked ? currentTableData.map((c) => c.id) : []);
  };
  const handleSelectOne = (id) => {
    setSelectedCampaigns((prev) => (prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]));
  };

  // --- DELETE ---
  const executeDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (deleteTarget === 'bulk') {
        setCampaigns((prev) => prev.filter((c) => !selectedCampaigns.includes(c.id)));
        setSelectedCampaigns([]);
      } else {
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget));
        setSelectedCampaigns((prev) => prev.filter((id) => id !== deleteTarget));
        if (previewCampaign?.id === deleteTarget) closePreview();
      }
      setIsDeleting(false);
      setDeleteTarget(null);
    }, 600);
  };

  // --- EDIT ---
  const handleEdit = (camp) => {
    setPreviewCampaign(camp);
    setEditForm({ ...camp, platforms: [...camp.platforms] });
    setIsEditing(true);
    setActiveDropdown(null);
  };

  const toggleEditPlatform = (platformId) => {
    setEditForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const triggerSaveEdit = () => {
    if (!editForm.title.trim()) return alert('Campaign name is required.');
    if (editForm.platforms.length === 0) return alert('Select at least one platform.');
    setShowUpdateConfirm(true);
  };

  const confirmSaveEdit = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setCampaigns((prev) => prev.map((c) => (c.id === previewCampaign.id ? { ...c, ...editForm } : c)));
      setPreviewCampaign((prev) => ({ ...prev, ...editForm }));
      setIsUpdating(false);
      setShowUpdateConfirm(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
    setShowUpdateConfirm(false);
  };

  const openPreview = (camp) => {
    setPreviewCampaign(camp);
    setIsEditing(false);
    setEditForm(null);
    setShowUpdateConfirm(false);
  };

  const closePreview = () => {
    setPreviewCampaign(null);
    setIsEditing(false);
    setEditForm(null);
    setShowUpdateConfirm(false);
  };

  // --- UI HELPERS ---
  const getStatusBadge = (status) => {
    const safeStatus = status ? status.toLowerCase() : 'draft';
    const styles = STATUS_STYLES[safeStatus] || STATUS_STYLES.draft;
    return (
      <span className={`${styles.badge} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center w-max gap-1.5`}>
        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        {status}
      </span>
    );
  };

  const renderPlatformIcons = (platforms = []) => (
    <div className="flex items-center">
      {platforms.map((p, i) => {
        const Icon = PLATFORM_ICON_MAP[p];
        if (!Icon) return null;
        return (
          <div
            key={p}
            style={{ zIndex: platforms.length - i }}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white -ml-2 first:ml-0 shadow-sm ${PLATFORM_COLOR_MAP[p]}`}
          >
            <Icon size={12} className="text-white" />
          </div>
        );
      })}
    </div>
  );

  const TABS = [
    { name: 'All Campaigns', count: campaignsMatchingNonTabFilters.length },
    { name: 'Scheduled Campaigns', count: campaignsMatchingNonTabFilters.filter((c) => c.status === 'Scheduled').length },
    { name: 'Active Campaigns', count: campaignsMatchingNonTabFilters.filter((c) => c.status === 'Active').length },
    { name: 'Draft Campaigns', count: campaignsMatchingNonTabFilters.filter((c) => c.status === 'Draft').length },
    { name: 'Completed Campaigns', count: campaignsMatchingNonTabFilters.filter((c) => c.status === 'Completed').length },
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('Status');
    setFilterPlatform('Platform');
    setFilterObjective('Objective');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col relative mt-6 min-h-[600px]">

      {/* FILTER BAR */}
      <div className="p-6 flex flex-wrap gap-4 items-center justify-between border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium w-full sm:w-48 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92] transition-all"
              placeholder="Search..."
            />
          </div>

          <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50">
            <option>Platform</option>
            {PLATFORMS_LIST.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50">
            <option>Status</option>
            <option>Active</option><option>Scheduled</option><option>Draft</option><option>Completed</option>
          </select>

          <select value={filterObjective} onChange={(e) => setFilterObjective(e.target.value)} className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold bg-white outline-none cursor-pointer hover:bg-slate-50">
            <option>Objective</option>
            <option>Awareness</option><option>Sales</option>
          </select>
        </div>
        <button onClick={clearFilters} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
          Clear Filters
        </button>
      </div>

      {/* TABS */}
      <div className="px-6 flex gap-8 border-b border-slate-100 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`py-4 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap ${
              activeTab === tab.name ? 'border-[#311b92] text-[#311b92]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* BULK ACTION BAR */}
      {selectedCampaigns.length > 0 && (
        <div className="mx-6 mt-6 bg-[#f3e8ff] rounded-xl px-6 py-3 flex items-center justify-between border border-[#e9d5ff]">
          <span className="font-bold text-[#4c1d95] text-sm">{selectedCampaigns.length} campaigns selected</span>
          <div className="flex items-center gap-6">
            <button onClick={() => setDeleteTarget('bulk')} className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700">
              <Trash2 size={16} /> Delete
            </button>
            <div className="w-px h-5 bg-purple-200 mx-2" />
            <button onClick={() => setSelectedCampaigns([])} className="text-slate-500 hover:text-slate-800">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="w-full overflow-x-auto mt-2 flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-800">
              <th className="py-4 pl-6 pr-4 w-12">
                <input
                  type="checkbox"
                  checked={currentTableData.length > 0 && selectedCampaigns.length === currentTableData.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#311b92] cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 min-w-[250px]">Campaign</th>
              <th className="py-4 px-4">Platforms</th>
              <th className="py-4 px-4">Objective</th>
              <th className="py-4 px-4">Start Date</th>
              <th className="py-4 px-4">End Date</th>
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
                    <p>No campaigns found for this tab/filter.</p>
                  </div>
                </td>
              </tr>
            ) : currentTableData.map((camp) => (
              <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 pl-6 pr-4 relative">
                  {selectedCampaigns.includes(camp.id) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#311b92] rounded-r" />}
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedCampaigns.includes(camp.id) ? 'bg-[#311b92] border-[#311b92]' : 'border-slate-300 bg-white'
                    }`}
                    onClick={() => handleSelectOne(camp.id)}
                  >
                    {selectedCampaigns.includes(camp.id) && <CheckCircle2 size={12} className="text-white" strokeWidth={4} />}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => openPreview(camp)}>
                    <img src={camp.image} alt={camp.title} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-[#311b92] transition-colors">{camp.title}</p>
                      <p className="text-[11px] font-medium text-slate-400 truncate max-w-[200px] mt-0.5">{camp.subtitle}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">{renderPlatformIcons(camp.platforms)}</td>
                <td className="py-4 px-4 text-xs font-bold text-slate-700">{camp.objective}</td>
                <td className="py-4 px-4 text-xs font-bold text-slate-700">{camp.startDate}</td>
                <td className="py-4 px-4 text-xs font-bold text-slate-700">{camp.endDate}</td>
                <td className="py-4 px-4">{getStatusBadge(camp.status)}</td>

                <td className="py-4 pr-6 pl-4 relative text-center">
                  <div className="inline-block relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === camp.id ? null : camp.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                        activeDropdown === camp.id ? 'bg-[#28157a] text-white' : 'bg-[#311b92] text-white hover:bg-[#28157a]'
                      }`}
                    >
                      <MoreVertical size={16} strokeWidth={2.5} />
                    </button>

                    {activeDropdown === camp.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 flex flex-col py-2 overflow-hidden">
                          <button onClick={() => { openPreview(camp); setActiveDropdown(null); }} className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 text-left">
                            <Eye size={16} strokeWidth={2.5} /> View Details
                          </button>
                          {camp.status !== 'Completed' && (
                            <button onClick={() => handleEdit(camp)} className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 text-left">
                              <Edit size={16} strokeWidth={2.5} /> Edit
                            </button>
                          )}
                          <button onClick={() => { setDeleteTarget(camp.id); setActiveDropdown(null); }} className="flex items-center gap-2.5 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 text-left">
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

      {/* PAGINATION */}
      <div className="p-6 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-sm font-bold text-slate-400">
          Showing {currentTableData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                  currentPage === page ? 'border-2 border-[#311b92] bg-[#f8f5ff] text-[#311b92]' : 'border border-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors">
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-5 mx-auto">
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-center text-slate-900 mb-2">Delete Campaign?</h3>
            <p className="text-slate-500 text-sm font-medium text-center mb-8">
              This action cannot be undone. Are you sure you want to permanently delete{' '}
              {deleteTarget === 'bulk' ? 'these selected campaigns' : 'this campaign'}?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={executeDelete} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-70">
                {isDeleting ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Deleting...</>
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW / EDIT MODAL */}
      {previewCampaign && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-3xl overflow-hidden max-w-[750px] w-full max-h-full shadow-2xl flex flex-col md:flex-row">

            <div className="w-full md:w-5/12 bg-slate-900 flex-shrink-0 h-48 md:h-auto relative">
              <img src={previewCampaign.image} alt={previewCampaign.title} className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="p-8 w-full md:w-7/12 flex flex-col relative overflow-y-auto custom-scrollbar">
              <button onClick={closePreview} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
                <X size={18} strokeWidth={2.5} />
              </button>

              <div className="mb-4 flex items-center gap-2">
                {getStatusBadge(previewCampaign.status)}
                {isEditing && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#311b92] bg-[#f3e8ff] px-2.5 py-1 rounded-full">
                    Editing Mode
                  </span>
                )}
              </div>

              {isEditing ? (
                <>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Campaign Title</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="mb-4 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                  />

                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Subtitle</label>
                  <input
                    value={editForm.subtitle || ''}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className="mb-4 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                  />

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#311b92]"
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled</option>
                      </select>
                    </div>
                    <div>
  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Objective</label>
  <input
    type="text"
    list="objective-suggestions-edit"
    value={editForm.objective}
    onChange={(e) => setEditForm({ ...editForm, objective: e.target.value })}
    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#311b92]"
    placeholder="e.g. Brand Awareness"
  />
  <datalist id="objective-suggestions-edit">
    <option value="Awareness" />
    <option value="Sales" />
    <option value="Engagement" />
    <option value="Lead Generation" />
    <option value="Traffic" />
    <option value="Conversions" />
  </datalist>
</div>
                  </div>

                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Connected Platforms</label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {PLATFORMS_LIST.map((platform) => {
                      const Icon = platform.icon;
                      const isActive = editForm.platforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => toggleEditPlatform(platform.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${
                            isActive ? platform.activeColor : `border-slate-200 text-slate-400 bg-white ${platform.color}`
                          }`}
                          title={platform.id}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-[22px] leading-tight font-black text-slate-900 mb-2">{previewCampaign.title}</h2>
                  <p className="text-sm font-medium text-slate-500 mb-4">{previewCampaign.subtitle}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Objective</h4>
                      <p className="font-bold text-slate-800 text-sm">{previewCampaign.objective}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Platforms</h4>
                      {renderPlatformIcons(previewCampaign.platforms)}
                    </div>
                  </div>
                </>
              )}

              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Description & Goals</h4>
              {isEditing ? (
                <textarea
                  value={editForm.fullText || editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullText: e.target.value, description: e.target.value })}
                  rows={3}
                  className="text-slate-700 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92] resize-none"
                />
              ) : (
                <p className="text-slate-700 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {previewCampaign.fullText || previewCampaign.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</h4>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                    />
                  ) : (
                    <p className="font-bold text-slate-800 text-sm">{previewCampaign.startDate}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</h4>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92]"
                    />
                  ) : (
                    <p className="font-bold text-slate-800 text-sm">{previewCampaign.endDate}</p>
                  )}
                </div>
              </div>

              {/* CONFIRMATION / ACTIONS */}
              {showUpdateConfirm ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mt-8">
                  <h4 className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-2">
                    <AlertTriangle size={16} /> Confirm Changes
                  </h4>
                  <p className="text-xs text-amber-800 mb-4">
                    Are you sure you want to update this campaign? This will apply immediately across all connected platforms.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowUpdateConfirm(false)} disabled={isUpdating} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white rounded-lg border border-slate-200 disabled:opacity-50">
                      Go Back
                    </button>
                    <button onClick={confirmSaveEdit} disabled={isUpdating} className="flex-1 py-2 text-xs font-bold text-white bg-[#311b92] rounded-lg flex items-center justify-center gap-2 disabled:opacity-70">
                      {isUpdating ? (
                        <><span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Updating...</>
                      ) : (
                        'Yes, Update'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 mt-8">
                  {isEditing ? (
                    <>
                      <button onClick={handleCancelEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                        Cancel
                      </button>
                      <button onClick={triggerSaveEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors">
                        <Save size={16} /> Save Campaign
                      </button>
                    </>
                  ) : (
                    previewCampaign.status !== 'Completed' && (
                      <button onClick={() => handleEdit(previewCampaign)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                        <Edit size={16} /> Edit Campaign
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
