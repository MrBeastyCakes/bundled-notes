"use client";

import { useState, useCallback } from "react";

export type SelectableType = "planet" | "star" | "blackhole";

interface SelectionState {
  selectedId: string | null;
  selectedType: SelectableType | null;
  quickActionsVisible: boolean;
}

export function useSelectionState() {
  const [state, setState] = useState<SelectionState>({
    selectedId: null,
    selectedType: null,
    quickActionsVisible: false,
  });

  const select = useCallback((id: string, type: SelectableType) => {
    setState({ selectedId: id, selectedType: type, quickActionsVisible: true });
  }, []);

  const deselect = useCallback(() => {
    setState({ selectedId: null, selectedType: null, quickActionsVisible: false });
  }, []);

  return { ...state, select, deselect };
}
