"use client";

import { useEffect, useState, useMemo } from "react";
import { subscribeToBundles } from "@/lib/firebase/firestore";
import { useAuth } from "./useAuth";
import type { Bundle, BundleTreeNode } from "@/lib/types";

function buildTree(bundles: Bundle[]): BundleTreeNode[] {
  const map = new Map<string, BundleTreeNode>();
  const roots: BundleTreeNode[] = [];

  for (const bundle of bundles) {
    map.set(bundle.id, { ...bundle, children: [] });
  }

  for (const bundle of bundles) {
    const node = map.get(bundle.id)!;
    if (bundle.parentBundleId && map.has(bundle.parentBundleId)) {
      map.get(bundle.parentBundleId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function getAncestors(bundles: Bundle[], bundleId: string): Bundle[] {
  const ancestors: Bundle[] = [];
  const map = new Map(bundles.map((b) => [b.id, b]));
  let current = map.get(bundleId);
  while (current?.parentBundleId) {
    const parent = map.get(current.parentBundleId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function useBundles() {
  const { user } = useAuth();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBundles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToBundles(user.uid, (data) => {
      setBundles(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const tree = useMemo(() => buildTree(bundles), [bundles]);

  return {
    bundles,
    tree,
    loading,
    getAncestors: (bundleId: string) => getAncestors(bundles, bundleId),
    getBundleById: (id: string) => bundles.find((b) => b.id === id) || null,
  };
}
