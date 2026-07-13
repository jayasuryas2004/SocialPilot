"use client";
import { useState, useEffect } from "react";
import { listCampaigns } from "@/lib/api/campaigns";

// Used anywhere a "filter by campaign" dropdown needs real campaign names —
// pulling from the same Campaigns data your Campaigns page uses, not a
// hardcoded list, so a new campaign shows up here automatically.
export function useCampaignOptions() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCampaigns()
      .then((data) => setCampaigns(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return { campaigns, loading };
}