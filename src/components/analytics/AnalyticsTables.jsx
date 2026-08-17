"use client";
import React from "react";
import TopPostsTable from "./TopPostsTable";
import CampaignPerformance from "./CampaignPerformance";

export default function AnalyticsTables({ topPosts = [], campaignPerformance = [] }) {
  return (
    <>
      <TopPostsTable posts={topPosts} />
      <CampaignPerformance campaigns={campaignPerformance.length > 0 ? campaignPerformance : topPosts} />
    </>
  );
}
