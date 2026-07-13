"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react"; // Added for the button icon
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ReportsSummaryCards from "@/components/reports/ReportsSummaryCards";
import ReportsFilterBar from "@/components/reports/ReportsFilterBar";
import ReportsBulkBar from "@/components/reports/ReportsBulkBar";
import ReportsTable from "@/components/reports/ReportsTable";
// Ensure this path points to where you saved the modal we just built!
import GenerateReportModal from "@/components/reports/GenerateReportModal";
import { useReports } from "@/hooks/useReports";
import { useScheduledReports } from "@/hooks/useScheduledReports";
import { useCampaignOptions } from "@/hooks/useCampaignOptions";
import { useToast } from "@/hooks/useToast";

const CATEGORIES = [
  { value: "all", label: "All reports" },
  { value: "engagement", label: "Engagement" },
  { value: "audience", label: "Audience growth" },
  { value: "campaign", label: "Campaign" },
  { value: "publishing", label: "Publishing" },
  { value: "platform_comparison", label: "Platform comparison" },
];

export default function ReportsPage() {
  const [filters, setFilters] = useState({ search: "", platform: "all", status: "all", campaignId: "all", date: "" });
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const { reports, loading, error, refetch, generate, remove, bulkRemove } = useReports(filters);
  const { scheduled, loading: schedLoading } = useScheduledReports();
  const { campaigns } = useCampaignOptions();
  const { showToast } = useToast();

  // Dynamic tab counts computed from the already-fetched, already-filtered result set
  const counts = useMemo(() => {
    const c = { all: reports?.length || 0 };
    for (const cat of CATEGORIES.slice(1)) {
      c[cat.value] = (reports || []).filter((r) => r.category === cat.value).length;
    }
    return c;
  }, [reports]);

  const visibleReports = activeTab === "all" ? (reports || []) : (reports || []).filter((r) => r.category === activeTab);

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  
  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === visibleReports.length ? new Set() : new Set(visibleReports.map((r) => r.id))
    );
  }

  async function handleDelete() {
    try {
      await remove(confirmId);
      showToast("Report deleted", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setConfirmId(null);
    }
  }

  async function handleBulkDelete() {
    try {
      await bulkRemove([...selectedIds]);
      setSelectedIds(new Set());
      showToast("Reports deleted", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setConfirmBulk(false);
    }
  }

  // UPGRADED: Actually simulates downloading a bulk export file!
  async function handleBulkExport() {
    showToast(`Preparing export for ${selectedIds.size} report(s)...`, "info");
    
    try {
      // Simulate backend zipping delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileContent = `Bulk Export Data\nSelected IDs: ${Array.from(selectedIds).join(', ')}`;
      const blob = new Blob([fileContent], { type: "application/zip" });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `socialpilot_bulk_export_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      showToast("Export downloaded successfully!", "success");
      setSelectedIds(new Set()); // Clear selection after export
    } catch (error) {
      showToast("Failed to export reports.", "error");
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-[#F8F9FA] pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Reports &amp; Exports
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Generate detailed reports for campaigns, engagement, audience growth, and publishing performance.
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-[#311b92] text-white font-bold text-sm px-6 py-6 rounded-xl hover:bg-[#28157a] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} /> Generate report
        </Button>
      </div>

      <ReportsSummaryCards
        totalReports={loading ? "—" : (reports?.length || 0)}
        scheduledCount={schedLoading ? "—" : (scheduled?.length || 0)}
        formatCount={2}
        storageUsed="1.2 GB"
      />

      <Card className="mb-6 shadow-sm border-gray-200 bg-white">
        <CardContent className="p-4 md:p-6 overflow-hidden">
          
          <ReportsFilterBar filters={filters} onChange={setFilters} campaigns={campaigns} />

          {/* CUSTOM TABS: Scrollable on mobile, clean on desktop */}
          <div className="w-full overflow-x-auto custom-scrollbar">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 mb-4 min-w-max">
              <TabsList className="flex w-full justify-start gap-8 rounded-none border-b border-gray-200 bg-transparent p-0 h-auto">
                {CATEGORIES.map((c) => (
                  <TabsTrigger 
                    key={c.value} 
                    value={c.value}
                    className="rounded-none border-b-2 border-transparent px-1 pb-4 pt-2 font-extrabold text-base text-slate-500 shadow-none transition-none data-[state=active]:border-purple-800 data-[state=active]:text-purple-900 data-[state=active]:shadow-none hover:text-slate-800"
                  >
                    {c.label} ({counts[c.value] ?? 0})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <ReportsBulkBar
            count={selectedIds.size}
            onDelete={() => setConfirmBulk(true)}
            onExport={handleBulkExport}
            onClear={() => setSelectedIds(new Set())}
          />

          {loading && <div className="py-12"><Loader label="Loading reports..." /></div>}

          {!loading && error && (
            <div className="py-12">
              <EmptyState title="Couldn't load reports" description={error} actionLabel="Try again" onAction={refetch} />
            </div>
          )}

          {!loading && !error && visibleReports.length === 0 && (
            <div className="py-12">
              <EmptyState
                title="No reports match your filters"
                description="Try adjusting your timeframes, or generate a new report."
                actionLabel="Generate report"
                onAction={() => setModalOpen(true)}
              />
            </div>
          )}

          {!loading && !error && visibleReports.length > 0 && (
            <div className="mt-4">
              <ReportsTable
                reports={visibleReports}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onDelete={setConfirmId}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Reports Card */}
      <Card className="shadow-sm border-gray-200 bg-white">
        <CardContent className="p-6 md:p-8">
          <h3 className="font-extrabold text-slate-900 mb-6 text-lg">Scheduled reports</h3>
          
          {schedLoading ? (
            <Loader label="Loading schedule..." />
          ) : scheduled?.length === 0 ? (
            <EmptyState title="No scheduled reports" description="Set a report to run automatically (Weekly/Monthly)." />
          ) : (
            <div className="flex flex-col space-y-6">
              {scheduled?.map((s) => (
                <div key={s.id} className="flex items-center justify-between group cursor-default">
                  <div>
                    <p className="text-base font-extrabold text-slate-900 group-hover:text-purple-800 transition-colors">
                      {s.title}
                    </p>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {s.frequency}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md">
                    {s.format}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals & Dialogs */}
      <GenerateReportModal open={modalOpen} onOpenChange={setModalOpen} onGenerate={generate} />

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this report?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={confirmBulk}
        onOpenChange={setConfirmBulk}
        title={`Delete ${selectedIds.size} reports?`}
        description="This action cannot be undone."
        confirmLabel="Delete all"
        destructive
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}