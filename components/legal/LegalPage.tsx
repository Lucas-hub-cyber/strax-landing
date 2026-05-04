import { BrandMark } from "@/components/landing/BrandMark";

export type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#0B0D10] px-5 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8">
          <div className="rounded-2xl bg-white p-4 w-fit">
            <BrandMark />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-[#7EA2FF]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
            {intro}
          </p>
        </header>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
