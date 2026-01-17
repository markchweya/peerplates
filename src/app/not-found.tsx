// src/app/not-found.tsx
import Link from "next/link";

export const metadata = {
  title: "Page not found · PeerPlates",
  description: "This page doesn’t exist (or it moved). Head back to PeerPlates.",
};

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export default function NotFound() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#0b0b0c] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        {/* soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_20%,rgba(252,176,64,0.18),transparent_60%),radial-gradient(900px_600px_at_15%_80%,rgba(138,107,67,0.16),transparent_55%),radial-gradient(900px_600px_at_85%_75%,rgba(255,255,255,0.06),transparent_55%)]" />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px]" />
        {/* top haze */}
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl items-center px-6 py-16">
        <div className="w-full">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fcb040]" />
            PeerPlates • 404
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left */}
            <section>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                This page isn’t on the menu.
              </h1>

              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
                The link may be broken, the page may have moved, or it never existed.
                Let’s get you back to real food, real fast.
              </p>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className={cn(
                    "group inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                    "bg-[#fcb040] text-black shadow-[0_12px_40px_rgba(252,176,64,0.25)]",
                    "transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  )}
                >
                  <span className="text-sm font-semibold">Back to home</span>
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>

                <Link
                  href="/join"
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                    "border border-white/15 bg-white/5 text-white/90 backdrop-blur",
                    "transition hover:bg-white/8"
                  )}
                >
                  <span className="text-sm font-medium">Join waitlist</span>
                </Link>

                <Link
                  href="/contact"
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                    "border border-white/10 bg-transparent text-white/70",
                    "transition hover:border-white/18 hover:text-white/85"
                  )}
                >
                  <span className="text-sm font-medium">Contact</span>
                </Link>
              </div>

              {/* Tiny helper */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-white/70">
                    If you typed the URL, double-check the spelling.
                  </p>
                  <Link
                    href="/"
                    className="text-sm font-medium text-white/85 underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
                  >
                    Go home
                  </Link>
                </div>
              </div>
            </section>

            {/* Right card */}
            <aside className="relative">
              <div className="rounded-3xl border border-white/12 bg-white/[0.045] p-6 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-white/60">Error code</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">404</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                    <p className="text-xs text-white/70">Lost?</p>
                    <p className="text-xs text-white/50">We’ll guide you back.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <QuickLink href="/" title="Home" desc="Back to the main landing page" />
                  <QuickLink href="/join" title="Waitlist" desc="Join as a consumer or vendor" />
                  <QuickLink href="/mission" title="Mission" desc="What PeerPlates is building" />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium text-white/85">Tip</p>
                  <p className="mt-1 text-sm text-white/65">
                    Use the site menu to navigate, or head back home and start fresh.
                  </p>
                </div>
              </div>

              {/* Floating accent */}
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-[radial-gradient(400px_250px_at_70%_30%,rgba(252,176,64,0.22),transparent_60%)] blur-2xl" />
            </aside>
          </div>

          <footer className="mt-14 text-xs text-white/45">
            © {new Date().getFullYear()} PeerPlates • Eat better. Back local.
          </footer>
        </div>
      </div>
    </main>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-2xl border border-white/10 bg-white/[0.03] p-4",
        "transition hover:border-white/18 hover:bg-white/[0.055]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/90">{title}</p>
          <p className="mt-1 text-sm text-white/60">{desc}</p>
        </div>
        <span className="text-white/50 transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}
