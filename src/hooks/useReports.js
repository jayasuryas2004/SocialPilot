"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import * as reportsApi from "@/lib/api/reports";
import { REPORT_STATUS } from "@/constants/reportStatus";

// filters: { status, platform, campaignId, search } — category is handled
// by the page component slicing this same result set per tab.
export function useReports(filters = {}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchReports = useCallback(async () => {
    setError(null);
    try {
      const data = await reportsApi.listReports(filters);
      setReports(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const hasProcessing = reports.some((r) => r.status === REPORT_STATUS.PROCESSING);
    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(fetchReports, 4000);
    }
    if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [reports, fetchReports]);

  async function generate(payload) {
    const newReport = await reportsApi.generateReport(payload);
    setReports((prev) => [newReport, ...prev]);
    return newReport;
  }

  async function remove(id) {
    await reportsApi.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  async function bulkRemove(ids) {
    await reportsApi.bulkDeleteReports(ids);
    setReports((prev) => prev.filter((r) => !ids.includes(r.id)));
  }

  return { reports, loading, error, refetch: fetchReports, generate, remove, bulkRemove };
}