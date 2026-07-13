"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppButton from "@/components/ui/AppButton";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ReportsSummaryCards from "@/components/reports/ReportsSummaryCards";
import ReportsFilterBar from "@/components/reports/ReportsFilterBar";
import ReportsBulkBar from "@/components/reports/ReportsBulkBar";
import ReportsTable from "@/components/reports/ReportsTable";
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

  // Dynamic tab counts computed from the already-fetched, already-filtered
  // (by search/platform/status/campaign) result set — switching tabs is
  // instant with no extra network call.
  const counts = useMemo(() => {
    const c = { all: reports.length };
    for (const cat of CATEGORIES.slice(1)) {
      c[cat.value] = reports.filter((r) => r.category === cat.value).length;
    }
    return c;
  }, [reports]);

  const visibleReports = activeTab === "all" ? reports : reports.filter((r) => r.category === activeTab);

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
    }
  }

  async function handleBulkDelete() {
    try {
      await bulkRemove([...selectedIds]);
      setSelectedIds(new Set());
      showToast("Reports deleted", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function handleBulkExport() {
    showToast(`Exporting ${selectedIds.size} report(s)...`, "info");
    // Real implementation once backend exists: POST /reports/bulk-export
    // with selectedIds, then trigger the returned zip/file download.
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Added page-level padding and vertical spacing so it breathes like the Posts page */}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          {/* Matched the heavy, large Poppins typography from Posts Management */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reports &amp; Exports
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Generate detailed reports for campaigns, engagement, audience growth, and publishing performance.
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-violet-700 hover:bg-violet-800 text-white rounded-full px-6 py-6 font-bold text-base shadow-md transition-colors"
        >
          + Generate report
        </Button>
      </div>

      <ReportsSummaryCards
        totalReports={loading ? "—" : reports.length}
        scheduledCount={schedLoading ? "—" : scheduled.length}
        formatCount={2}
        storageUsed="1.2 GB"
      />

      <Card className="mb-6 shadow-sm border-gray-200">
        <CardContent className="p-4 md:p-6">
          
          {/* FILTER BAR IS AT THE TOP NOW */}
          <ReportsFilterBar filters={filters} onChange={setFilters} campaigns={campaigns} />

          {/* CUSTOM TABS: Transparent background, bold purple underline */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 mb-4">
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

          <ReportsBulkBar
            count={selectedIds.size}
            onDelete={() => setConfirmBulk(true)}
            onExport={handleBulkExport}
            onClear={() => setSelectedIds(new Set())}
          />

          {loading && <Loader label="Loading reports..." />}

          {!loading && error && (
            <EmptyState title="Couldn't load reports" description={error} actionLabel="Try again" onAction={refetch} />
          )}

          {!loading && !error && visibleReports.length === 0 && (
            <EmptyState
              title="No reports match your filters"
              description="Try adjusting your timeframes, or generate a new report."
              actionLabel="Generate report"
              onAction={() => setModalOpen(true)}
            />
          )}

          {!loading && !error && visibleReports.length > 0 && (
            <ReportsTable
              reports={visibleReports}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onDelete={setConfirmId}
            />
          )}
        </CardContent>
      </Card>

      {/* This is the ONLY Scheduled Reports Card you should have. 
        It sits directly below your main ReportsTable Card.
      */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6 md:p-8">
          <h3 className="font-extrabold text-slate-900 mb-6 text-lg">Scheduled reports</h3>
          
          {schedLoading ? (
            <Loader label="Loading schedule..." />
          ) : scheduled.length === 0 ? (
            <EmptyState title="No scheduled reports" description="Set a report to run automatically (Weekly/Monthly)." />
          ) : (
            <div className="flex flex-col space-y-6">
              {scheduled.map((s) => (
                <div key={s.id} className="flex items-center justify-between group">
                  <div>
                    <p className="text-base font-extrabold text-slate-900 group-hover:text-purple-800 transition-colors">
                      {s.title}
                    </p>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {s.frequency}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {s.format}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      <GenerateReportModal open={modalOpen} onOpenChange={setModalOpen} onGenerate={generate} />

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this report?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={confirmBulk}
        onOpenChange={setConfirmBulk}
        title={`Delete ${selectedIds.size} reports?`}
        description="This can't be undone."
        confirmLabel="Delete all"
        destructive
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}