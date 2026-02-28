"use client";

import { List } from "@mui/material";
import type { BundleTreeNode } from "@/lib/types";
import BundleTreeItem from "./BundleTreeItem";

interface BundleTreeProps {
  nodes: BundleTreeNode[];
  activeBundleId: string | null;
  onSelectBundle: (bundleId: string) => void;
  onCreateSubBundle: (parentId: string) => void;
  depth?: number;
}

export default function BundleTree({
  nodes,
  activeBundleId,
  onSelectBundle,
  onCreateSubBundle,
  depth = 0,
}: BundleTreeProps) {
  return (
    <List disablePadding>
      {nodes.map((node) => (
        <BundleTreeItem
          key={node.id}
          node={node}
          depth={depth}
          activeBundleId={activeBundleId}
          onSelectBundle={onSelectBundle}
          onCreateSubBundle={onCreateSubBundle}
        />
      ))}
    </List>
  );
}
