"use client";

import { Breadcrumbs, Typography, Link as MuiLink } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import { useBundles } from "@/lib/hooks/useBundles";
import { Box } from "@mui/material";

interface BundleBreadcrumbsProps {
  activeBundleId: string | null;
  onSelectBundle: (bundleId: string | null) => void;
}

export default function BundleBreadcrumbs({
  activeBundleId,
  onSelectBundle,
}: BundleBreadcrumbsProps) {
  const { getAncestors, getBundleById } = useBundles();

  if (!activeBundleId) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AllInboxIcon fontSize="small" color="primary" />
        <Typography variant="h6" fontWeight={600}>
          All Notes
        </Typography>
      </Box>
    );
  }

  const ancestors = getAncestors(activeBundleId);
  const currentBundle = getBundleById(activeBundleId);

  if (!currentBundle) return null;

  return (
    <Breadcrumbs sx={{ "& .MuiBreadcrumbs-separator": { mx: 0.5 } }}>
      <MuiLink
        component="button"
        underline="hover"
        color="text.secondary"
        onClick={() => onSelectBundle(null)}
        sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
      >
        <AllInboxIcon fontSize="small" />
        All
      </MuiLink>

      {ancestors.map((ancestor) => (
        <MuiLink
          key={ancestor.id}
          component="button"
          underline="hover"
          color="text.secondary"
          onClick={() => onSelectBundle(ancestor.id)}
          sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
        >
          <FolderIcon fontSize="small" sx={{ color: ancestor.color }} />
          {ancestor.name}
        </MuiLink>
      ))}

      <Typography
        color="text.primary"
        sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}
      >
        <FolderIcon fontSize="small" sx={{ color: currentBundle.color }} />
        {currentBundle.name}
      </Typography>
    </Breadcrumbs>
  );
}
