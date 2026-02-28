"use client";

import { useCallback, useRef, useState } from "react";

interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 10;
const ZOOM_STEP = 0.1;

export function useCanvasViewport() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedViewport = useRef<ViewportState | null>(null);

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

  // Zoom the viewport so a given card fills the screen
  const zoomToCard = useCallback(
    (cardX: number, cardY: number, cardW: number, cardH: number) => {
      const container = containerRef.current;
      if (!container) return;

      const vw = container.clientWidth;
      const vh = container.clientHeight;

      // Save current viewport to return to later
      savedViewport.current = { ...viewport };

      // Fill the viewport with the card
      const targetZoom = Math.min(vw / cardW, vh / cardH);
      const offsetX = (vw - cardW * targetZoom) / 2 - cardX * targetZoom;
      const offsetY = (vh - cardH * targetZoom) / 2 - cardY * targetZoom;

      setIsAnimating(true);
      setViewport({ offsetX, offsetY, zoom: targetZoom });

      // Clear animation flag after CSS transition completes
      setTimeout(() => setIsAnimating(false), 450);
    },
    [viewport]
  );

  // Zoom back to saved viewport
  const zoomBack = useCallback(() => {
    if (!savedViewport.current) return;
    setIsAnimating(true);
    setViewport(savedViewport.current);
    savedViewport.current = null;
    setTimeout(() => setIsAnimating(false), 450);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isAnimating) return;
      if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
        isPanning.current = true;
        panStart.current = {
          x: e.clientX - viewport.offsetX,
          y: e.clientY - viewport.offsetY,
        };
        e.preventDefault();
      }
    },
    [viewport.offsetX, viewport.offsetY, isAnimating]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current || isAnimating) return;
      setViewport((prev) => ({
        ...prev,
        offsetX: e.clientX - panStart.current.x,
        offsetY: e.clientY - panStart.current.y,
      }));
    },
    [isAnimating]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isAnimating) return;
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
    [isAnimating]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      if (e.touches.length === 1) {
        if (e.target === e.currentTarget) {
          isPanning.current = true;
          panStart.current = {
            x: e.touches[0].clientX - viewport.offsetX,
            y: e.touches[0].clientY - viewport.offsetY,
          };
        }
      } else if (e.touches.length === 2) {
        isPanning.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      }
    },
    [viewport.offsetX, viewport.offsetY, isAnimating]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
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
    [isAnimating]
  );

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
    lastTouchDist.current = null;
  }, []);

  const resetViewport = useCallback(() => {
    setIsAnimating(true);
    setViewport({ offsetX: 0, offsetY: 0, zoom: 1 });
    setTimeout(() => setIsAnimating(false), 450);
  }, []);

  return {
    ...viewport,
    isAnimating,
    containerRef,
    isPanning: isPanning.current,
    screenToCanvas,
    resetViewport,
    zoomToCard,
    zoomBack,
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
