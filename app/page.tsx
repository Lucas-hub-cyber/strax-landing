"use client";

import { useState } from "react";

import {
  getRadarInterpretation,
  getRadarStructuralScore,
  MARKETING_RADAR_DATA,
} from "@/app/page.data";
import { ClosingSection } from "@/components/landing/ClosingSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingSections } from "@/components/landing/LandingSections";
import { LeadWizard } from "@/components/landing/LeadWizard";
import { MobileStickyCTA } from "@/components/landing/MobileStickyCTA";

export default function Home() {
  const [showWizard, setShowWizard] = useState(false);
  const radarScore = getRadarStructuralScore(MARKETING_RADAR_DATA);
  const radarInterpretation = getRadarInterpretation(radarScore);

  function openWizard() {
    setShowWizard(true);
  }

  function closeWizard() {
    setShowWizard(false);
  }

  if (showWizard) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-5xl">
          <LeadWizard onBack={closeWizard} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <HeroSection
        radarScore={radarScore}
        radarInterpretation={radarInterpretation}
        onStartDiagnostic={openWizard}
      />
      <LandingSections onStartDiagnostic={openWizard} />
      <ClosingSection onStartDiagnostic={openWizard} />
      <MobileStickyCTA onStartDiagnostic={openWizard} />
    </main>
  );
}
