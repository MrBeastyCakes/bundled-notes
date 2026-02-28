"use client";

import { useCallback, useRef, useState } from "react";

interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export function useCanvasViewport() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  });

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (screenX - rect.left - viewport.offsetX) / viewport.zoom,
        y: (screenY - rect.top - viewport.offsetY) / viewport.zoom,
      };
    },
    [viewport]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only pan on middle-click or left-click on background
      if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
        isPanning.current = true;
        panStart.current = {
          x: e.clientX - viewport.offsetX,
          y: e.clientY - viewport.offsetY,
        };
        e.preventDefault();
      }
    },
    [viewport.offsetX, viewport.offsetY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return;
      setViewport((prev) => ({
        ...prev,
        offsetX: e.clientX - panStart.current.x,
        offsetY: e.clientY - panStart.current.y,
      }));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setViewport((prev) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom + delta));
        const ratio = newZoom / prev.zoom;

        return {
          zoom: newZoom,
          offsetX: mouseX - (mouseX - prev.offsetX) * ratio,
          offsetY: mouseY - (mouseY - prev.offsetY) * ratio,
        };
      });
    },
    []
  );

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        // Single finger pan (only on background)
        if (e.target === e.currentTarget) {
          isPanning.current = true;
          panStart.current = {
            x: e.touches[0].clientX - viewport.offsetX,
            y: e.touches[0].clientY - viewport.offsetY,
          };
        }
      } else if (e.touches.length === 2) {
        // Pinch zoom
        isPanning.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      }
    },
    [viewport.offsetX, viewport.offsetY]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isPanning.current) {
        setViewport((prev) => ({
          ...prev,
          offsetX: e.touches[0].clientX - panStart.current.x,
          offsetY: e.touches[0].clientY - panStart.current.y,
        }));
      } else if (e.touches.length === 2 && lastTouchDist.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / lastTouchDist.current;
        lastTouchDist.current = dist;

        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const cx = midX - rect.left;
        const cy = midY - rect.top;

        setViewport((prev) => {
          const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * scale));
          const ratio = newZoom / prev.zoom;
          return {
            zoom: newZoom,
            offsetX: cx - (cx - prev.offsetX) * ratio,
            offsetY: cy - (cy - prev.offsetY) * ratio,
          };
        });
      }
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
    lastTouchDist.current = null;
  }, []);

  const resetViewport = useCallback(() => {
    setViewport({ offsetX: 0, offsetY: 0, zoom: 1 });
  }, []);

  return {
    ...viewport,
    containerRef,
    isPanning: isPanning.current,
    screenToCanvas,
    resetViewport,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
