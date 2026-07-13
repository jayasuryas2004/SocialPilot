"use client";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function ActionsMenu({ items }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-brand-purple hover:bg-[#3D1478] flex items-center justify-center transition-colors outline-none">
        <MoreVertical className="w-4 h-4 text-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) =>
          item.href ? (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              <DropdownMenuItem>{item.label}</DropdownMenuItem>
            </a>
          ) : (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              className={item.destructive ? "text-red-600" : ""}
            >
              {item.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}