"use client";

import { useMemo, useState, useEffect } from "react";
import {
  getPlanetRadius,
  computeOrbitalRadius,
  distributeAngles,
  getOrbitDuration,
  NOTE_ORBIT_BASE_DURATION,
  STAR_ORBIT_BASE_DURATION,
  SYSTEM_MIN_SPACING,
  FREE_NOTE_GRID_GAP,
} from "./spaceTheme";
import type { StarPlanetData } from "./StarSystem";
import type { Note, Bundle, BundleTreeNode } from "@/lib/types";

const DEFAULT_BASE_WIDTH = 280;

function getResponsiveBaseWidth() {
  if (typeof window === "undefined") return DEFAULT_BASE_WIDTH;
  return window.innerWidth < 600
    ? Math.min(DEFAULT_BASE_WIDTH, window.innerWidth - 48)
    : DEFAULT_BASE_WIDTH;
}

// --- Layout data types ---

export interface StarSystemLayout {
  bundle: Bundle;
  centerX: number;
  centerY: number;
  orbitalRadius: number;
  planets: StarPlanetData[];
}

export interface BlackHoleLayout {
  bundle: Bundle;
  centerX: number;
  centerY: number;
  orbitalRadius: number;
  orbitingStars: Array<{
    starSystem: StarSystemLayout;
    startAngle: number;
    orbitDuration: number;
  }>;
}

export interface FreeNoteLayout {
  note: Note;
  x: number;
  y: number;
  radius: number;
}

// --- Hook ---

export function useCanvasLayout(
  notes: Note[],
  bundles: Bundle[],
  tree: BundleTreeNode[]
) {
  const [cardSize, setCardSize] = useState({ width: DEFAULT_BASE_WIDTH, height: 200 });

  useEffect(() => {
    const update = () => {
      const baseWidth = getResponsiveBaseWidth();
      const ratio = window.innerHeight / window.innerWidth;
      const height = Math.round(baseWidth * ratio);
      setCardSize({ width: baseWidth, height: Math.max(160, Math.min(500, height)) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const CARD_WIDTH = cardSize.width;
  const CARD_HEIGHT = cardSize.height;

  const layout = useMemo(() => {
    // Build lookup maps
    const bundleMap = new Map(bundles.map((b) => [b.id, b]));
    const notesByBundle = new Map<string, Note[]>();
    const freeNotes: Note[] = [];

    for (const note of notes) {
      if (note.bundleId && bundleMap.has(note.bundleId)) {
        if (!notesByBundle.has(note.bundleId)) notesByBundle.set(note.bundleId, []);
        notesByBundle.get(note.bundleId)!.push(note);
      } else {
        freeNotes.push(note);
      }
    }

    // Classify bundles: leaf (star) vs parent (black hole)
    const leafBundles: Bundle[] = [];
    const parentBundles: BundleTreeNode[] = [];

    function classifyTree(nodes: BundleTreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          parentBundles.push(node);
          // Don't recurse into children here — they'll be handled as orbiting stars
        } else if (!node.parentBundleId) {
          // Only top-level leaf bundles are standalone stars
          leafBundles.push(node);
        }
      }
    }
    classifyTree(tree);

    // Also include leaf bundles that are children of black holes — they're handled within the black hole layout

    // --- Build star systems for leaf bundles ---
    function buildStarSystem(bundle: Bundle, memberNotes: Note[]): StarSystemLayout {
      const planetRadii = memberNotes.map((n) => getPlanetRadius(n.content, n.title));
      const orbitalRadius = computeOrbitalRadius(planetRadii);
      const angles = distributeAngles(memberNotes.length);

      const planets: StarPlanetData[] = memberNotes.map((note, i) => ({
        note,
        radius: planetRadii[i],
        startAngle: angles[i],
        orbitDuration: getOrbitDuration(NOTE_ORBIT_BASE_DURATION, note.id),
      }));

      return {
        bundle,
        centerX: 0, // will be positioned below
        centerY: 0,
        orbitalRadius,
        planets,
      };
    }

    // --- Position standalone star systems ---
    const starSystems: StarSystemLayout[] = [];
    let systemCol = 0;

    for (const bundle of leafBundles) {
      const memberNotes = notesByBundle.get(bundle.id) || [];
      const system = buildStarSystem(bundle, memberNotes);
      const systemRadius = system.orbitalRadius + 60; // padding
      const spacing = Math.max(SYSTEM_MIN_SPACING, systemRadius * 2 + 60);

      system.centerX = systemCol * spacing + spacing / 2;
      system.centerY = spacing / 2;
      systemCol++;
      starSystems.push(system);
    }

    // --- Build black holes ---
    const blackHoles: BlackHoleLayout[] = [];

    for (const parentNode of parentBundles) {
      // Build star systems for each child bundle
      const childStarSystems: StarSystemLayout[] = [];
      for (const child of parentNode.children) {
        const childBundle = bundleMap.get(child.id);
        if (!childBundle) continue;
        const childNotes = notesByBundle.get(child.id) || [];
        childStarSystems.push(buildStarSystem(childBundle, childNotes));
      }

      // Also include notes directly assigned to the parent bundle as a virtual star
      const parentDirectNotes = notesByBundle.get(parentNode.id) || [];
      let parentStarSystem: StarSystemLayout | null = null;
      if (parentDirectNotes.length > 0) {
        parentStarSystem = buildStarSystem(parentNode, parentDirectNotes);
        childStarSystems.push(parentStarSystem);
      }

      // Compute orbital radius for child stars around the black hole
      const childRadii = childStarSystems.map((s) => s.orbitalRadius + 60);
      const bhOrbitalRadius = computeOrbitalRadius(childRadii);
      const bhAngles = distributeAngles(childStarSystems.length);

      const orbitingStars = childStarSystems.map((starSys, i) => ({
        starSystem: starSys,
        startAngle: bhAngles[i],
        orbitDuration: getOrbitDuration(STAR_ORBIT_BASE_DURATION, starSys.bundle.id),
      }));

      const bhSpacing = Math.max(SYSTEM_MIN_SPACING, (bhOrbitalRadius + 100) * 2);
      const bh: BlackHoleLayout = {
        bundle: parentNode,
        centerX: systemCol * bhSpacing + bhSpacing / 2,
        centerY: bhSpacing / 2,
        orbitalRadius: bhOrbitalRadius,
        orbitingStars,
      };
      systemCol++;
      blackHoles.push(bh);
    }

    // --- Position free-floating notes ---
    const cols = Math.max(2, Math.floor((typeof window !== "undefined" ? window.innerWidth : 800) / (CARD_WIDTH + FREE_NOTE_GRID_GAP)));
    const freeStartY = (starSystems.length > 0 || blackHoles.length > 0)
      ? Math.max(
          ...starSystems.map((s) => s.centerY + s.orbitalRadius + 100),
          ...blackHoles.map((bh) => bh.centerY + bh.orbitalRadius + 200),
          0
        ) + 100
      : 0;

    const freeNotePositions: FreeNoteLayout[] = freeNotes.map((note, i) => {
      const radius = getPlanetRadius(note.content, note.title);
      if (note.positionX !== null && note.positionY !== null) {
        return { note, x: note.positionX, y: note.positionY, radius };
      }
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        note,
        x: col * (CARD_WIDTH + FREE_NOTE_GRID_GAP) + CARD_WIDTH / 2,
        y: freeStartY + row * (CARD_HEIGHT + FREE_NOTE_GRID_GAP) + CARD_HEIGHT / 2,
        radius,
      };
    });

    // --- Build allNotePositions map (static snapshot, used for zoom-to-edit) ---
    const allNotePositions = new Map<string, { x: number; y: number }>();

    // Free notes
    for (const fn of freeNotePositions) {
      allNotePositions.set(fn.note.id, { x: fn.x, y: fn.y });
    }

    // Star system planets — use their initial orbital position as snapshot
    for (const sys of starSystems) {
      for (const planet of sys.planets) {
        allNotePositions.set(planet.note.id, {
          x: sys.centerX + Math.cos(planet.startAngle) * sys.orbitalRadius,
          y: sys.centerY + Math.sin(planet.startAngle) * sys.orbitalRadius,
        });
      }
    }

    // Black hole child star planets
    for (const bh of blackHoles) {
      for (const orbitingStar of bh.orbitingStars) {
        const starCx = bh.centerX + Math.cos(orbitingStar.startAngle) * bh.orbitalRadius;
        const starCy = bh.centerY + Math.sin(orbitingStar.startAngle) * bh.orbitalRadius;
        for (const planet of orbitingStar.starSystem.planets) {
          allNotePositions.set(planet.note.id, {
            x: starCx + Math.cos(planet.startAngle) * orbitingStar.starSystem.orbitalRadius,
            y: starCy + Math.sin(planet.startAngle) * orbitingStar.starSystem.orbitalRadius,
          });
        }
      }
    }

    return {
      freeNotePositions,
      starSystems,
      blackHoles,
      allNotePositions,
    };
  }, [notes, bundles, tree, CARD_WIDTH, CARD_HEIGHT]);

  return {
    ...layout,
    CARD_WIDTH,
    CARD_HEIGHT,
  };
}
