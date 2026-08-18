"use client";
import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { PLATFORM_META } from "@/constants/platforms";
import { POST_STATUS } from "@/constants/postStatus";
import { Loader2 } from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin, FaXTwitter } from "react-icons/fa6";

function getPlatformIcon(platform, size = 14) {
  const p = String(platform || '').toLowerCase().trim();
  switch (p) {
    case 'instagram': return <FaInstagram size={size} color="#E1306C" />;
    case 'linkedin': return <FaLinkedin size={size} color="#0A66C2" />;
    case 'facebook': return <FaFacebook size={size} color="#1877F2" />;
    case 'x-twitter':
    case 'twitter': return <FaXTwitter size={size} color="#0f1419" />;
    default: return <FaInstagram size={size} color="#E1306C" />;
  }
}

function parsePlatformsList(post) {
  if (!post) return ['instagram'];
  if (Array.isArray(post.targets) && post.targets.length > 0) {
    return post.targets.map(t => String(t.platform || 'instagram').trim().toLowerCase());
  }
  const platformList =
    typeof post.platforms === 'string'
      ? post.platforms.split(',').map((p) => p.trim().toLowerCase())
      : (post.platforms || (post.platform ? [post.platform] : []));

  if (Array.isArray(platformList) && platformList.length > 0) {
    return platformList.map(p => String(p).trim().toLowerCase()).filter(Boolean);
  }
  return ['instagram'];
}

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
          <TableHead>Platforms</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => {
          const platforms = parsePlatformsList(post);
          return (
            <TableRow key={post.id}>
              <TableCell className="font-medium max-w-xs truncate">{post.caption || post.content || post.title}</TableCell>
              <TableCell>
                <div className="flex gap-2 items-center flex-wrap">
                  {platforms.map((platform, index) => (
                    <div
                      key={`table-platform-${post.id}-${platform}-${index}`}
                      className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-semibold"
                    >
                      {getPlatformIcon(platform, 12)}
                      <span>{PLATFORM_META[platform.toLowerCase()]?.label || platform}</span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : (post.date ? `${post.date} ${post.time || ''}` : "—")}
              </TableCell>
              <TableCell><StatusBadge status={post.status} /></TableCell>
              <TableCell className="flex gap-2">
                {post.status === POST_STATUS.FAILED && (
                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onRetry && onRetry(post.id)}>Retry</Button>
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
          );
        })}
      </TableBody>
    </Table>
  );
}