"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FolderIcon from "@mui/icons-material/Folder";
import type { BundleTreeNode } from "@/lib/types";

interface SortableBundleItemProps {
  node: BundleTreeNode;
  activeBundleId: string | null;
  onSelectBundle: (id: string) => void;
  depth?: number;
}

function SortableBundleItem({ node, activeBundleId, onSelectBundle, depth = 0 }: SortableBundleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSelected = activeBundleId === node.id;

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          pl: depth * 2 + 1,
          pr: 1,
          py: 0.75,
          borderRadius: 28,
          mx: 1,
          cursor: "pointer",
          bgcolor: isSelected ? "action.selected" : "transparent",
          "&:hover": { bgcolor: isSelected ? "action.selected" : "action.hover" },
          transition: "all 200ms cubic-bezier(0.2, 0, 0, 1)",
        }}
        onClick={() => onSelectBundle(node.id)}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "grab",
            color: "text.secondary",
            opacity: 0.4,
            "&:hover": { opacity: 1 },
            "&:active": { cursor: "grabbing" },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DragIndicatorIcon sx={{ fontSize: 16 }} />
        </Box>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: node.color, flexShrink: 0 }} />
        <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
          {node.name}
        </Typography>
      </Box>
    </Box>
  );
}

interface SortableBundleTreeProps {
  nodes: BundleTreeNode[];
  activeBundleId: string | null;
  onSelectBundle: (id: string) => void;
  onReorder: (bundleIds: string[]) => void;
}

export default function SortableBundleTree({
  nodes,
  activeBundleId,
  onSelectBundle,
  onReorder,
}: SortableBundleTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = nodes.findIndex((n) => n.id === active.id);
    const newIndex = nodes.findIndex((n) => n.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...nodes];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((n) => n.id));
  };

  const activeNode = activeId ? nodes.find((n) => n.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {nodes.map((node) => (
          <SortableBundleItem
            key={node.id}
            node={node}
            activeBundleId={activeBundleId}
            onSelectBundle={onSelectBundle}
          />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeNode && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              bgcolor: "background.paper",
              borderRadius: 28,
              boxShadow: 8,
            }}
          >
            <FolderIcon sx={{ fontSize: 16, color: activeNode.color }} />
            <Typography variant="body2" fontWeight={500}>
              {activeNode.name}
            </Typography>
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}
