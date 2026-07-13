import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import { PLATFORM_META } from "@/constants/platforms";
import { POST_STATUS } from "@/constants/postStatus";

export default function PostTable({ posts, onDelete, onRetry }) {
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
          post.targets.map((target) => (
            <TableRow key={target.id}>
              <TableCell className="font-medium max-w-xs truncate">{post.caption}</TableCell>
              <TableCell>
                <span style={{ color: PLATFORM_META[target.platform]?.color }} className="font-medium text-xs">
                  {PLATFORM_META[target.platform]?.label || target.platform}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : "—"}
              </TableCell>
              <TableCell><StatusBadge status={target.status} /></TableCell>
              <TableCell className="flex gap-2">
                {target.status === POST_STATUS.FAILED && (
                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onRetry(target.id)}>Retry</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}