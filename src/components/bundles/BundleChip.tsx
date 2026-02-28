"use client";

import { Chip } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { useBundles } from "@/lib/hooks/useBundles";

interface BundleChipProps {
  bundleId: string | null;
  size?: "small" | "medium";
}

export default function BundleChip({ bundleId, size = "small" }: BundleChipProps) {
  const { getBundleById } = useBundles();

  if (!bundleId) return null;

  const bundle = getBundleById(bundleId);
  if (!bundle) return null;

  return (
    <Chip
      size={size}
      icon={<FolderIcon sx={{ color: `${bundle.color} !important` }} />}
      label={bundle.name}
      variant="outlined"
      sx={{ borderColor: bundle.color, color: bundle.color }}
    />
  );
}
