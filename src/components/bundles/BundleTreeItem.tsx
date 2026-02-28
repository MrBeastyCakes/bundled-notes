"use client";

import { useState } from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import type { BundleTreeNode } from "@/lib/types";
import BundleTree from "./BundleTree";

interface BundleTreeItemProps {
  node: BundleTreeNode;
  depth: number;
  activeBundleId: string | null;
  onSelectBundle: (bundleId: string) => void;
  onCreateSubBundle: (parentId: string) => void;
}

export default function BundleTreeItem({
  node,
  depth,
  activeBundleId,
  onSelectBundle,
  onCreateSubBundle,
}: BundleTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <>
      <ListItemButton
        selected={activeBundleId === node.id}
        onClick={() => onSelectBundle(node.id)}
        sx={{
          mx: 1,
          mb: 0.5,
          pl: 1.5 + depth * 2,
          "&:hover .sub-bundle-add": { opacity: 1 },
        }}
      >
        {hasChildren ? (
          <ListItemIcon
            sx={{ minWidth: 28, cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </ListItemIcon>
        ) : (
          <ListItemIcon sx={{ minWidth: 28 }}>
            <Box sx={{ width: 20 }} />
          </ListItemIcon>
        )}

        <ListItemIcon sx={{ minWidth: 32 }}>
          <FolderIcon fontSize="small" sx={{ color: node.color }} />
        </ListItemIcon>

        <ListItemText
          primary={node.name}
          primaryTypographyProps={{
            variant: "body2",
            fontWeight: activeBundleId === node.id ? 600 : 400,
            noWrap: true,
          }}
        />

        <IconButton
          className="sub-bundle-add"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onCreateSubBundle(node.id);
          }}
          sx={{ opacity: 0, transition: "opacity 200ms" }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </ListItemButton>

      {hasChildren && (
        <Collapse in={expanded} timeout={300}>
          <BundleTree
            nodes={node.children}
            activeBundleId={activeBundleId}
            onSelectBundle={onSelectBundle}
            onCreateSubBundle={onCreateSubBundle}
            depth={depth + 1}
          />
        </Collapse>
      )}
    </>
  );
}
