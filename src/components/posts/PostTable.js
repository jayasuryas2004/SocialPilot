"use client";
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { PLATFORM_META } from "@/constants/platforms";
import { POST_STATUS } from "@/constants/postStatus";
import { Loader2 } from "lucide-react";

export default function PostTable({ posts = [], onDelete, onRetry }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (postId) => {
    if (deletingId === postId) return;
    setDeletingId(postId);
    try {
      if (onDelete && typeof onDelete === "function") {
        await onDelete(postId);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Caption</TableHead>
          <TableHead>Platform</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) =>
          (post.targets || []).map((target) => (
            <TableRow key={target.id}>
              <TableCell className="font-medium max-w-xs truncate">{post.caption || post.content || post.title}</TableCell>
              <TableCell>
                <span style={{ color: PLATFORM_META[target.platform]?.color }} className="font-medium text-xs">
                  {PLATFORM_META[target.platform]?.label || target.platform}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : (post.date ? `${post.date} ${post.time || ''}` : "—")}
              </TableCell>
              <TableCell><StatusBadge status={target.status || post.status} /></TableCell>
              <TableCell className="flex gap-2">
                {target.status === POST_STATUS.FAILED && (
                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onRetry && onRetry(target.id)}>Retry</Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === post.id}
                  onClick={() => handleDelete(post.id)}
                  className="disabled:opacity-50"
                >
                  {deletingId === post.id ? (
                    <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Deleting...</span>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}