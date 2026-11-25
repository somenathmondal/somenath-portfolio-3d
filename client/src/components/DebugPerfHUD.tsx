import { useEffect, useRef, useState } from "react";

interface PerfSnapshot {
  fps: number;
  avgFrameMs: number;
  p95FrameMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  heroActive: boolean;
  jsHeapMB: number | null;
  jsHeapLimitMB: number | null;
  domNodes: number;
  dclMs: number;
  fcpMs: number | null;
  lcpMs: number | null;
  transferKB: number;
  scrollPct: number;
  history: number[];
}

declare global {
  interface Window {
    __PERF_TELEMETRY__?: {
      calls: number;
      triangles: number;
      geometries: number;
      textures: number;
      heroActive: boolean;
    };
  }
}

interface DebugPerfHUDProps {
  onClose: () => void;
}

export default function DebugPerfHUD({ onClose }: DebugPerfHUDProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snap, setSnap] = useState<PerfSnapshot>({
    fps: 60,
    avgFrameMs: 16.7,
    p95FrameMs: 16.7,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    heroActive: true,
    jsHeapMB: null,
    jsHeapLimitMB: null,
    domNodes: 0,
    dclMs: 0,
    fcpMs: null,
    lcpMs: null,
    transferKB: 0,
    scrollPct: 0,
    history: [],
  });

  const frameTimesRef = useRef<number[]>([]);
  const fpsHistoryRef = useRef<number[]>([]);
  const lcpRef = useRef<number | null>(null);
  const fcpRef = useRef<number | null>(null);

  useEffect(() => {
    // Capture paint timings (FCP / LCP)
    try {
      const paints = performance.getEntriesByType("paint");
      const fcp = paints.find((p) => p.name === "first-contentful-paint");
      if (fcp) fcpRef.current = Math.round(fcp.startTime);

      const po = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) {
          lcpRef.current = Math.round(entries[entries.length - 1].startTime);
        }
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
      return () => po.disconnect();
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();
    let frameCalls = 0;
    let frameVerts = 0;
    let lastFrameCalls = 0;
    let lastFrameTris = 0;

    // Instrument WebGL2 draw calls only while #debug HUD is mounted (restored on unmount)
    const proto = typeof WebGL2RenderingContext !== "undefined" ? WebGL2RenderingContext.prototype : null;
    const origDrawElements = proto?.drawElements;
    const origDrawArrays = proto?.drawArrays;
    const origDrawElementsInst = proto?.drawElementsInstanced;
    const origDrawArraysInst = proto?.drawArraysInstanced;

    if (proto && origDrawElements && origDrawArrays) {
      proto.drawElements = function (mode: number, count: number, type: number, offset: number) {
        frameCalls++;
        frameVerts += count;
        return origDrawElements.apply(this, arguments as any);
      };
      proto.drawArrays = function (mode: number, first: number, count: number) {
        frameCalls++;
        frameVerts += count;
        return origDrawArrays.apply(this, arguments as any);
      };
      if (origDrawElementsInst) {
        proto.drawElementsInstanced = function (mode: number, count: number, type: number, offset: number, instanceCount: number) {
          frameCalls++;
          frameVerts += count * instanceCount;
          return origDrawElementsInst.apply(this, arguments as any);
        };
      }
      if (origDrawArraysInst) {
        proto.drawArraysInstanced = function (mode: number, first: number, count: number, instanceCount: number) {
          frameCalls++;
          frameVerts += count * instanceCount;
          return origDrawArraysInst.apply(this, arguments as any);
        };
      }
    }

    const loop = (now: number) => {
      const dt = now - lastNow;
      lastNow = now;
      lastFrameCalls = frameCalls;
      lastFrameTris = Math.round(frameVerts / 3);
      frameCalls = 0;
      frameVerts = 0;
      if (dt > 0 && dt < 1000) {
        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 90) {
          frameTimesRef.current.shift();
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const interval = window.setInterval(() => {
      const ft = frameTimesRef.current;
      let fps = 0;
      let avgFrameMs = 0;
      let p95FrameMs = 0;

      if (ft.length > 0) {
        const sorted = [...ft].sort((a, b) => a - b);
        avgFrameMs = ft.reduce((a, b) => a + b, 0) / ft.length;
        p95FrameMs = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
        fps = avgFrameMs > 0 ? Math.min(120, 1000 / avgFrameMs) : 0;
      }

      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 48) {
        fpsHistoryRef.current.shift();
      }

      const mem = (performance as any).memory;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const transferBytes = resources.reduce((sum, r) => sum + (r.transferSize || 0), nav?.transferSize || 0);
      const gl = window.__PERF_TELEMETRY__;
      const scrollOffset = Number((window as any).scrollOffset || 0);

      setSnap({
        fps: +fps.toFixed(1),
        avgFrameMs: +avgFrameMs.toFixed(1),
        p95FrameMs: +p95FrameMs.toFixed(1),
        drawCalls: lastFrameCalls,
        triangles: lastFrameTris,
        geometries: gl?.geometries ?? 0,
        textures: gl?.textures ?? 0,
        heroActive: gl?.heroActive ?? true,
        jsHeapMB: mem ? +(mem.usedJSHeapSize / (1024 * 1024)).toFixed(1) : null,
        jsHeapLimitMB: mem ? +(mem.jsHeapSizeLimit / (1024 * 1024)).toFixed(0) : null,
        domNodes: document.getElementsByTagName("*").length,
        dclMs: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
        fcpMs: fcpRef.current,
        lcpMs: lcpRef.current,
        transferKB: +(transferBytes / 1024).toFixed(0),
        scrollPct: Math.round(scrollOffset * 100),
        history: [...fpsHistoryRef.current],
      });
    }, 250);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
      if (proto && origDrawElements && origDrawArrays) {
        proto.drawElements = origDrawElements;
        proto.drawArrays = origDrawArrays;
        if (origDrawElementsInst) proto.drawElementsInstanced = origDrawElementsInst;
        if (origDrawArraysInst) proto.drawArraysInstanced = origDrawArraysInst;
      }
    };
  }, []);

  const fpsColor =
    snap.fps >= 55 ? "#4ade80" : snap.fps >= 38 ? "#facc15" : "#f87171";

  const copySnapshot = () => {
    const { history: _h, ...exportable } = snap;
    navigator.clipboard?.writeText(JSON.stringify(exportable, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  // Build SVG polyline points for FPS sparkline
  const sparkPoints = snap.history
    .map((val, i) => {
      const x = (i / Math.max(1, snap.history.length - 1)) * 228;
      const y = 32 - Math.min(1, val / 65) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 100001,
        width: collapsed ? "auto" : 268,
        background: "rgba(38, 19, 19, 0.92)",
        color: "#FFFFFF",
        border: "1px solid rgba(255, 255, 255, 0.16)",
        borderRadius: 14,
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 11,
        lineHeight: 1.4,
        cursor: "auto",
        userSelect: "none",
      }}
      className="pointer-events-auto"
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 12px",
          borderBottom: collapsed ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: fpsColor,
              boxShadow: `0 0 8px ${fpsColor}`,
            }}
          />
          <strong style={{ fontSize: 11, letterSpacing: "0.08em" }}>
            PERF DEBUG
          </strong>
          <span style={{ color: fpsColor, fontWeight: 700 }}>
            {snap.fps.toFixed(0)} FPS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "2px 6px",
              fontSize: 10,
              cursor: "pointer",
            }}
            title={collapsed ? "Expand metrics" : "Collapse metrics"}
          >
            {collapsed ? "+" : "−"}
          </button>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "2px 6px",
              fontSize: 10,
              cursor: "pointer",
            }}
            title="Exit #debug mode"
          >
            ✕
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* FPS Sparkline */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.28)",
              borderRadius: 8,
              padding: "6px 8px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.85, marginBottom: 4 }}>
              <span>AVG {snap.avgFrameMs} ms</span>
              <span>P95 {snap.p95FrameMs} ms</span>
              <span>SCROLL {snap.scrollPct}%</span>
            </div>
            <svg width="228" height="34" viewBox="0 0 228 34" style={{ display: "block", width: "100%" }}>
              <line x1="0" y1="6" x2="228" y2="6" stroke="rgba(74,222,128,0.22)" strokeDasharray="3 3" />
              {sparkPoints && (
                <polyline
                  fill="none"
                  stroke={fpsColor}
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                  points={sparkPoints}
                />
              )}
            </svg>
          </div>

          {/* WebGL Section */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", opacity: 0.65, marginBottom: 4 }}>
              WEBGL RENDERER
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
              <div>Draw Calls: <strong>{snap.drawCalls}</strong></div>
              <div>Tris: <strong>{snap.triangles.toLocaleString()}</strong></div>
              <div>Geoms: <strong>{snap.geometries}</strong></div>
              <div>Textures: <strong>{snap.textures}</strong></div>
              <div style={{ gridColumn: "1 / -1" }}>
                Hero 3D:{" "}
                <strong style={{ color: snap.heroActive ? "#38bdf8" : "#4ade80" }}>
                  {snap.heroActive ? "ACTIVE" : "CULLED (OFF-SCREEN)"}
                </strong>
              </div>
            </div>
          </div>

          {/* Memory & Load Section */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", opacity: 0.65, marginBottom: 4 }}>
              MEMORY &amp; LOAD
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
              <div>
                JS Heap:{" "}
                <strong>{snap.jsHeapMB !== null ? `${snap.jsHeapMB} MB` : "N/A"}</strong>
              </div>
              <div>DOM Nodes: <strong>{snap.domNodes}</strong></div>
              <div>DCL: <strong>{snap.dclMs} ms</strong></div>
              <div>FCP: <strong>{snap.fcpMs !== null ? `${snap.fcpMs} ms` : "—"}</strong></div>
              <div>LCP: <strong>{snap.lcpMs !== null ? `${snap.lcpMs} ms` : "—"}</strong></div>
              <div>Transfer: <strong>{snap.transferKB} KB</strong></div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
            <span style={{ fontSize: 9, opacity: 0.6 }}>URL hash: #debug</span>
            <button
              onClick={copySnapshot}
              style={{
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
