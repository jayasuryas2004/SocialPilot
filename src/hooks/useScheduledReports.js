// src/hooks/useScheduledReports.js
"use client";
import { useState, useEffect, useCallback } from "react";
import * as reportsApi from "@/lib/api/reports";

export function useScheduledReports() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = useCallback(async () => {
  try {
    const data = await reportsApi.listScheduledReports();
    setScheduled(data || []);
  } catch (err) {
    setScheduled([]);
  } finally {
    setLoading(false);
  }
}, []);
  useEffect(() => { fetchScheduled(); }, [fetchScheduled]);

  async function toggle(id, enabled) {
    setScheduled((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s))); // optimistic
    try {
      await reportsApi.toggleScheduledReport(id, enabled);
    } catch (err) {
      setScheduled((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !enabled } : s))); // revert
    }
  }

  return { scheduled, loading, toggle };
}
