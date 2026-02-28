"use client";

import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDroppable } from "@dnd-kit/core";
import type { Bundle } from "@/lib/types";

interface BottomZoneProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function BottomZone({ id, label, icon, color }: BottomZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        px: 3,
        py: 1.5,
        borderRadius: 3,
        bgcolor: isOver ? `${color}35` : `${color}15`,
        border: "2px solid",
        borderColor: isOver ? color : "transparent",
        transition: "all 200ms ease",
        transform: isOver ? "scale(1.08)" : "scale(1)",
        boxShadow: isOver ? `0 0 20px ${color}50` : "none",
        minWidth: 72,
        cursor: "default",
        "& .MuiSvgIcon-root": {
          fontSize: isOver ? 28 : 22,
          color,
          transition: "all 200ms ease",
        },
      }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{ color, fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.04em" }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface BundleDropZoneProps {
  bundle: Bundle;
}

function BundleDropZone({ bundle }: BundleDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `bundle-zone-${bundle.id}`,
    data: { bundleId: bundle.id },
  });

  return (
    <Box
      ref={setNodeRef}
      title={bundle.name}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        cursor: "default",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: isOver ? bundle.color : `${bundle.color}60`,
          border: "2px solid",
          borderColor: isOver ? bundle.color : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          transition: "all 200ms ease",
          transform: isOver ? "scale(1.15)" : "scale(1)",
          boxShadow: isOver ? `0 0 16px ${bundle.color}60` : "none",
        }}
      >
        {bundle.icon}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.6rem",
          color: "text.secondary",
          maxWidth: 56,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {bundle.name}
      </Typography>
    </Box>
  );
}

interface DragActionZonesProps {
  visible: boolean;
  bundles: Bundle[];
}

export default function DragActionZones({ visible, bundles }: DragActionZonesProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            display: "flex",
            justifyContent: "center",
            pointerEvents: visible ? "auto" : "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 1.5,
              px: 3,
              py: 2,
              mb: 2,
              bgcolor: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(16px)",
              borderRadius: 4,
              boxShadow: 8,
            }}
          >
            <BottomZone
              id="zone-trash"
              label="Trash"
              icon={<DeleteIcon />}
              color="#EF5350"
            />
            <BottomZone
              id="zone-archive"
              label="Archive"
              icon={<ArchiveIcon />}
              color="#78909C"
            />
            <BottomZone
              id="zone-favorite"
              label="Favorite"
              icon={<StarIcon />}
              color="#FFB300"
            />

            {bundles.length > 0 && (
              <Box
                sx={{
                  width: 1,
                  height: 48,
                  bgcolor: "rgba(255,255,255,0.15)",
                  mx: 0.5,
                }}
              />
            )}

            {bundles.map((b) => (
              <BundleDropZone key={b.id} bundle={b} />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
