"use client";

import { useSyncExternalStore } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { MARKETING_RADAR_DATA } from "@/app/page.data";

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function SystemVisual() {
  const isChartReady = useIsClient();

  return (
    <div className="relative mx-auto w-full max-w-[28rem] overflow-hidden rounded-[1.65rem] border border-blue-400/12 bg-[#0B1F3B] px-3 py-4 sm:px-4 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_50%_76%,rgba(96,165,250,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="relative h-[320px] w-full sm:h-[360px]">
        {isChartReady ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={280}
            minHeight={320}
          >
            <RadarChart
              data={MARKETING_RADAR_DATA}
              cx="50%"
              cy="52%"
              outerRadius="69%"
            >
              <PolarGrid
                stroke="rgba(147, 197, 253, 0.12)"
                radialLines
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{
                  fill: "rgba(219, 234, 254, 0.9)",
                  fontSize: 10,
                  letterSpacing: 3,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Ideal estructural"
                dataKey="ideal"
                stroke="#BFDBFE"
                strokeOpacity={0.9}
                strokeWidth={1.6}
                fill="#BFDBFE"
                fillOpacity={0.06}
                dot={false}
                strokeDasharray="5 4"
                isAnimationActive={false}
              />
              <Radar
                name="Empresa hoy"
                dataKey="actual"
                stroke="#38BDF8"
                strokeWidth={3}
                fill="#38BDF8"
                fillOpacity={0.35}
                dot={{
                  r: 4,
                  fill: "#E0F2FE",
                  stroke: "#0B1F3B",
                  strokeWidth: 1.5,
                }}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[1.35rem] border border-white/6 bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.18),transparent_30%)]">
            <div className="h-44 w-44 rounded-full border border-blue-100/10" />
          </div>
        )}
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/7 bg-white/4 px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-blue-100/72 sm:text-[11px]">
        <span>Lectura estructural</span>
        <span>Ideal vs realidad operativa</span>
      </div>
    </div>
  );
}
