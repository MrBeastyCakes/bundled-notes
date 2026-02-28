"use client";

import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import ActionZone from "./ActionZone";
import type { Bundle } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";

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
      sx={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        bgcolor: isOver ? bundle.color : `${bundle.color}60`,
        border: "2px solid",
        borderColor: isOver ? bundle.color : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        transition: "all 200ms ease",
        transform: isOver ? "scale(1.2)" : "scale(1)",
        boxShadow: isOver ? `0 0 16px ${bundle.color}60` : "none",
        cursor: "default",
        title: bundle.name,
      }}
    >
      {bundle.icon}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: visible ? "auto" : "none",
            zIndex: 9998,
          }}
        >
          <ActionZone
            id="zone-favorite"
            label="Favorite"
            icon={<StarIcon />}
            color="#FFB300"
            position="top"
          />
          <ActionZone
            id="zone-archive"
            label="Archive"
            icon={<ArchiveIcon />}
            color="#78909C"
            position="right"
          />
          <ActionZone
            id="zone-trash"
            label="Trash"
            icon={<DeleteIcon />}
            color="#EF5350"
            position="left"
          />

          {/* Bundle bar at bottom */}
          {bundles.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1.5,
                px: 3,
                py: 2,
                bgcolor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px 24px 0 0",
                zIndex: 9999,
              }}
            >
              {bundles.map((b) => (
                <BundleDropZone key={b.id} bundle={b} />
              ))}
            </Box>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
