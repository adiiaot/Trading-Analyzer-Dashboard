import Link from "next/link";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: "#080c24",
      }}
    >
      {/* Full-screen hero with background image */}
      <section
        className="relative flex-1 flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{
          backgroundImage: "url(/images/aotanalyzerlogobackground.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(8,12,36,0.70) 0%, rgba(8,12,36,0.85) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
          {/* Logo with glow */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(240,180,41,0.15) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }}
            />
            <img
              src="/images/aot-analyzer-logo-icon.png"
              alt="AOT Analyzer"
              className="w-24 h-24 md:w-28 md:h-28 relative z-10"
              style={{
                filter: "drop-shadow(0 0 20px rgba(240,180,41,0.3))",
              }}
            />
          </div>

          {/* Title */}
          <h1
            className="text-3xl md:text-5xl font-bold mb-3 tracking-tight"
            style={{ color: "#f0b429" }}
          >
            AOT Analyzer
          </h1>

          <p
            className="text-base md:text-lg font-medium mb-2"
            style={{ color: "#e0e0e0" }}
          >
            Intraday Trading Center
          </p>

          {/* Divider */}
          <div
            className="w-16 h-0.5 rounded-full mb-6"
            style={{ background: "linear-gradient(90deg, #f0b429, #ffd54f)" }}
          />

          {/* Tagline */}
          <p
            className="text-sm md:text-base leading-relaxed mb-10 max-w-lg"
            style={{ color: "#a0a0b0" }}
          >
            Three-tier 15M XAU/USD signal engine with ML directional bias, L2 microstructure,
            session P&L tracking, compounding system — all in one place.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-lg">
            {[
              { label: "Signal Engine", desc: "ADX · RSI · Bollinger" },
              { label: "Session Tracker", desc: "Entry-by-entry P&L" },
              { label: "Compound Planner", desc: "Cycle-based growth" },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-3 text-center"
                style={{
                  background: "rgba(240, 180, 41, 0.06)",
                  border: "1px solid rgba(240, 180, 41, 0.12)",
                }}
              >
                <p className="text-xs font-semibold" style={{ color: "#f0b429" }}>
                  {f.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#707080" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              boxShadow: "0 4px 20px rgba(var(--accent-gold-rgb), 0.3)",
            }}
          >
            Enter Dashboard
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <div
          className="relative z-10 mt-auto pb-6 text-[10px]"
          style={{ color: "#505060" }}
        >
          AOT Analyzer — Professional Trading Tools
        </div>
      </section>
    </main>
  );
}
