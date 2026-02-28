"use client";

import { useMemo, useState, useEffect } from "react";
import type { Note, Bundle } from "@/lib/types";

const BASE_WIDTH = 280;
const GAP = 24;
const COLS = 6;
const REGION_PADDING = 20;

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
  // Card size matches screen aspect ratio
  const [cardSize, setCardSize] = useState({ width: BASE_WIDTH, height: 200 });

  useEffect(() => {
    const update = () => {
      const ratio = window.innerHeight / window.innerWidth;
      const height = Math.round(BASE_WIDTH * ratio);
      setCardSize({ width: BASE_WIDTH, height: Math.max(160, Math.min(500, height)) });
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
        const col = autoIndex % COLS;
        const row = Math.floor(autoIndex / COLS);
        map.set(note.id, {
          x: col * (CARD_WIDTH + GAP),
          y: row * (CARD_HEIGHT + GAP),
        });
        autoIndex++;
      }
    }

    return map;
  }, [notes, CARD_WIDTH, CARD_HEIGHT]);

  // Compute bounding boxes for bundle regions
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

      regions.push({
        bundle,
        x: minX - REGION_PADDING,
        y: minY - REGION_PADDING - 28,
        width: maxX - minX + REGION_PADDING * 2,
        height: maxY - minY + REGION_PADDING * 2 + 28,
      });
    }

    return regions;
  }, [notes, bundles, positions, CARD_WIDTH, CARD_HEIGHT]);

  return { positions, bundleRegions, CARD_WIDTH, CARD_HEIGHT };
}
