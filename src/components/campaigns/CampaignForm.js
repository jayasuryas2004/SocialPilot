"use client";
import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

const PLATFORMS = [
  { id: 'Instagram', icon: FaInstagram, color: 'hover:text-[#E1306C] hover:bg-pink-50', activeColor: 'text-[#E1306C] bg-pink-50 border-pink-200' },
  { id: 'Facebook', icon: FaFacebook, color: 'hover:text-[#1877F2] hover:bg-blue-50', activeColor: 'text-[#1877F2] bg-blue-50 border-blue-200' },
  { id: 'LinkedIn', icon: FaLinkedin, color: 'hover:text-[#0A66C2] hover:bg-blue-50', activeColor: 'text-[#0A66C2] bg-blue-50 border-blue-200' },
  { id: 'X-Twitter', icon: FaXTwitter, color: 'hover:text-[#0f1419] hover:bg-slate-100', activeColor: 'text-[#0f1419] bg-slate-100 border-slate-300' },
  { id: 'YouTube', icon: FaYoutube, color: 'hover:text-[#FF0000] hover:bg-red-50', activeColor: 'text-[#FF0000] bg-red-50 border-red-200' },
];

const DEFAULT_FORM = {
  title: '', subtitle: '', description: '', startDate: '', endDate: '',
  status: 'Draft', objective: 'Awareness', platforms: ['Instagram'],
};

export default function CampaignForm({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormData(initialData ? { ...DEFAULT_FORM, ...initialData } : DEFAULT_FORM);
      setIsSubmitting(false);
      setErrors({});
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const togglePlatform = (id) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter((p) => p !== id)
        : [...prev.platforms, id],
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Campaign name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.platforms.length === 0) newErrors.platforms = 'Select at least one platform';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">

        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {initialData ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Group your posts and track their collective performance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F8F9FA]">
          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6">

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Target Platforms
              </label>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isActive = formData.platforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${
                        isActive ? platform.activeColor : `border-slate-200 text-slate-400 bg-white ${platform.color}`
                      }`}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
              {errors.platforms && <p className="text-xs font-bold text-rose-600 mt-2">{errors.platforms}</p>}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 text-sm font-bold text-slate-800 ${
                      errors.title ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-[#311b92] focus:ring-[#311b92]'
                    }`}
                    placeholder="e.g. Summer Mega Sale"
                  />
                  {errors.title && <p className="text-xs font-bold text-rose-600 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#311b92] focus:ring-1 focus:ring-[#311b92] text-sm text-slate-800"
                    placeholder="e.g. Huge discounts inside!"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Description & Goals
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 text-sm font-medium text-slate-800 resize-none ${
                    errors.description ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-[#311b92] focus:ring-[#311b92]'
                  }`}
                  placeholder="Briefly describe the campaign goals..."
                />
                {errors.description && <p className="text-xs font-bold text-rose-600 mt-1">{errors.description}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-2 py-2 rounded-lg border bg-slate-50 focus:outline-none text-xs font-bold text-slate-700 ${
                    errors.startDate ? 'border-rose-300' : 'border-slate-200 focus:border-[#311b92]'
                  }`}
                />
                {errors.startDate && <p className="text-[10px] font-bold text-rose-600 mt-1">{errors.startDate}</p>}
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-2 py-2 rounded-lg border bg-slate-50 focus:outline-none text-xs font-bold text-slate-700 ${
                    errors.endDate ? 'border-rose-300' : 'border-slate-200 focus:border-[#311b92]'
                  }`}
                />
                {errors.endDate && <p className="text-[10px] font-bold text-rose-600 mt-1">{errors.endDate}</p>}
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
    Objective
  </label>
  <input
    type="text"
    name="objective"
    list="objective-suggestions"
    value={formData.objective}
    onChange={handleChange}
    className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-[#311b92] text-xs font-bold text-slate-700"
    placeholder="e.g. Brand Awareness"
  />
  <datalist id="objective-suggestions">
    <option value="Awareness" />
    <option value="Sales" />
    <option value="Engagement" />
    <option value="Lead Generation" />
    <option value="Traffic" />
    <option value="Conversions" />
  </datalist>
</div>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 flex gap-4 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="campaign-form"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-[#311b92] hover:bg-[#28157a] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={18} /> Save Campaign</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}