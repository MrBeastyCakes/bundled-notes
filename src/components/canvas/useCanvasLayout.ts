"use client";

import { useMemo, useState, useEffect } from "react";
import type { Note, Bundle } from "@/lib/types";

const DEFAULT_BASE_WIDTH = 280;
const GAP = 24;
const REGION_PADDING = 28;

function getResponsiveBaseWidth() {
  if (typeof window === "undefined") return DEFAULT_BASE_WIDTH;
  return window.innerWidth < 600
    ? Math.min(DEFAULT_BASE_WIDTH, window.innerWidth - 48)
    : DEFAULT_BASE_WIDTH;
}

function getResponsiveCols(baseWidth: number) {
  if (typeof window === "undefined") return 6;
  return Math.max(2, Math.floor(window.innerWidth / (baseWidth + GAP)));
}

interface Position {
  x: number;
  y: number;
}

export interface BundleRegionRect {
  bundle: Bundle;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useCanvasLayout(notes: Note[], bundles: Bundle[]) {
  // Card size matches screen aspect ratio, responsive base width
  const [cardSize, setCardSize] = useState({ width: DEFAULT_BASE_WIDTH, height: 200 });
  const [cols, setCols] = useState(6);

  useEffect(() => {
    const update = () => {
      const baseWidth = getResponsiveBaseWidth();
      const ratio = window.innerHeight / window.innerWidth;
      const height = Math.round(baseWidth * ratio);
      setCardSize({ width: baseWidth, height: Math.max(160, Math.min(500, height)) });
      setCols(getResponsiveCols(baseWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const CARD_WIDTH = cardSize.width;
  const CARD_HEIGHT = cardSize.height;

  // Compute positions: use stored positions or auto-layout in a grid
  const positions = useMemo(() => {
    const map = new Map<string, Position>();
    let autoIndex = 0;

    for (const note of notes) {
      if (note.positionX !== null && note.positionY !== null) {
        map.set(note.id, { x: note.positionX, y: note.positionY });
      } else {
        const col = autoIndex % cols;
        const row = Math.floor(autoIndex / cols);
        map.set(note.id, {
          x: col * (CARD_WIDTH + GAP),
          y: row * (CARD_HEIGHT + GAP),
        });
        autoIndex++;
      }
    }

    return map;
  }, [notes, CARD_WIDTH, CARD_HEIGHT, cols]);

  // Compute bounding boxes for bundle regions as physical containers
  const bundleRegions = useMemo(() => {
    const regions: BundleRegionRect[] = [];
    const bundleMap = new Map(bundles.map((b) => [b.id, b]));

    const groups = new Map<string, Position[]>();
    for (const note of notes) {
      if (!note.bundleId) continue;
      const pos = positions.get(note.id);
      if (!pos) continue;
      if (!groups.has(note.bundleId)) groups.set(note.bundleId, []);
      groups.get(note.bundleId)!.push(pos);
    }

    for (const [bundleId, notePositions] of groups) {
      const bundle = bundleMap.get(bundleId);
      if (!bundle || notePositions.length === 0) continue;

      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;

      for (const pos of notePositions) {
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + CARD_WIDTH);
        maxY = Math.max(maxY, pos.y + CARD_HEIGHT);
      }

      const autoWidth = maxX - minX + REGION_PADDING * 2;
      const autoHeight = maxY - minY + REGION_PADDING * 2 + 32;

      regions.push({
        bundle,
        x: minX - REGION_PADDING,
        y: minY - REGION_PADDING - 32, // Space for header bar
        width: bundle.regionWidth ? Math.max(autoWidth, bundle.regionWidth) : autoWidth,
        height: bundle.regionHeight ? Math.max(autoHeight, bundle.regionHeight) : autoHeight,
      });
    }

    // Also show empty bundles that have no notes — place them after the grid
    const usedBundleIds = new Set(groups.keys());
    let emptyIndex = 0;
    const gridEndY = notes.length > 0
      ? Math.max(...Array.from(positions.values()).map((p) => p.y)) + CARD_HEIGHT + GAP * 3
      : 0;

    for (const bundle of bundles) {
      if (usedBundleIds.has(bundle.id)) continue;
      const defaultW = CARD_WIDTH * 1.4;
      const defaultH = CARD_HEIGHT * 1.2 + 32;
      regions.push({
        bundle,
        x: emptyIndex * (CARD_WIDTH * 1.5 + GAP * 2),
        y: gridEndY,
        width: bundle.regionWidth ? Math.max(defaultW, bundle.regionWidth) : defaultW,
        height: bundle.regionHeight ? Math.max(defaultH, bundle.regionHeight) : defaultH,
      });
      emptyIndex++;
    }

    return regions;
  }, [notes, bundles, positions, CARD_WIDTH, CARD_HEIGHT]);

  return { positions, bundleRegions, CARD_WIDTH, CARD_HEIGHT };
}
