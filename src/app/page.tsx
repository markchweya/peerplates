"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import ScrollShowcase from "@/app/ui/ScrollShowcase";
import SiteHeader from "@/app/ui/SiteHeader";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";
const EASE_OUT: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

type CookiePrefs = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

type FeatureCard = {
  label: string;
  title: string;
  body: string;
  image: string;
};

type AudienceCard = {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  action: string;
  points: string[];
  image: string;
};

const CONSENT_COOKIE = "pp_cookie_consent_v1";
const CONSENT_DAYS = 180;

const featureCards: FeatureCard[] = [
  {
    label: "Discovery",
    title: "Food that feels close, not corporate.",
    body: "PeerPlates helps students and neighbours find home-cooked meals from real local cooks, bakers, and small kitchens.",
    image: "/images/gallery/gallery18.jpg",
  },
  {
    label: "Ordering",
    title: "A proper storefront for every plate.",
    body: "Browse menus, see prices, order windows, collection days, and availability without endless back-and-forth messages.",
    image: "/images/gallery/gallery3.jpeg",
  },
  {
    label: "Growth",
    title: "Cooks get visibility from day one.",
    body: "Partner cooks can build demand, learn what sells, and start with a community already waiting to buy.",
    image: "/images/gallery/gallery4.jpeg",
  },
];

const audienceCards: AudienceCard[] = [
  {
    eyebrow: "For eaters",
    title: "Join early for the first local drops.",
    body: "Get access as PeerPlates opens by area, follow the cooks you love, and keep your place in the queue moving.",
    href: "/join/consumer",
    action: "Join as a consumer",
    points: ["Home-cooked meals", "Trusted local cooks", "Referral queue boost"],
    image: "/images/gallery/gallery12.png",
  },
  {
    eyebrow: "For partner cooks",
    title: "Turn your kitchen into a cleaner ordering flow.",
    body: "Create demand before launch, organise orders, set collection rules, and build a following around your food.",
    href: "/join/vendor",
    action: "Join as a cook",
    points: ["Menu storefront", "Order controls", "Cook profile"],
    image: "/images/gallery/gallery14.png",
  },
];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const parts = document.cookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));

  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function safeParsePrefs(raw: string | null): CookiePrefs | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CookiePrefs>;

    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

function SectionShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative w-full px-5 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl">{children}</div>
    </section>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 8%, ${BRAND_BROWN} 92%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}

function PremiumHero() {
  return (
    <section className="relative isolate min-h-[92svh] overflow-hidden bg-[#120d08] text-white">
      <SiteHeader />

      <div className="absolute inset-0 z-0">
        <Image
          src="/images/gallery/gallery20.png"
          alt="A table of warm home-cooked meals"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-[rgba(18,13,8,0.34)]" />

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(18,13,8,0.92) 0%, rgba(18,13,8,0.70) 34%, rgba(18,13,8,0.28) 64%, rgba(18,13,8,0.06) 100%),
              linear-gradient(180deg, rgba(18,13,8,0.22) 0%, rgba(18,13,8,0.12) 58%, rgba(255,255,255,0.96) 100%)
            `,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-32 overflow-hidden sm:h-40">
        <div
          className="absolute -bottom-24 -left-[18%] h-48 w-[136%] bg-white sm:-bottom-32 sm:h-64"
          style={{
            borderRadius: "50% 50% 0 0 / 64% 58% 0 0",
            transform: "rotate(-1.4deg)",
          }}
        />

        <div
          className="absolute -bottom-14 right-[-12%] h-28 w-[56%] bg-[#fff8ed] opacity-95 sm:h-36"
          style={{
            borderRadius: "50% 50% 0 0 / 76% 72% 0 0",
            transform: "rotate(-5deg)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92svh] w-full max-w-7xl items-end px-5 pb-28 pt-28 sm:px-8 sm:pb-32 lg:px-10">
        <div className="grid w-full gap-10">
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            className="max-w-3xl"
          >
            <h1 className="text-[clamp(54px,9vw,128px)] font-black leading-[0.86] tracking-normal">
              <span className="block">Eat better</span>
              <span className="block">and</span>
              <span className="block">
                <span style={{ color: BRAND_ORANGE }}>back</span>{" "}
                <span style={{ color: BRAND_BROWN }}>local</span>
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[clamp(20px,2.3vw,32px)] font-semibold leading-tight tracking-normal text-white/88">
              authentic home-cooked meals from trusted cooks and bakers.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-lg bg-[#fcb040] px-6 py-3 text-sm font-extrabold tracking-normal text-slate-950 shadow-[0_18px_45px_rgba(252,176,64,0.28)] transition hover:-translate-y-[1px] hover:bg-[#ffc15d]"
              >
                Join the waitlist
              </Link>

              <Link
                href="/queue"
                className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 py-3 text-sm font-extrabold tracking-normal text-white backdrop-blur transition hover:-translate-y-[1px] hover:bg-white/16"
              >
                Check your place
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LandingIntro() {
  return (
    <SectionShell className="pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div className="grid items-end gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: EASE_OUT }}
          className="max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a6b43]">
            The table is being set
          </p>

          <h2 className="mt-4 font-black leading-[0.98] tracking-normal text-[clamp(38px,5vw,76px)] text-slate-950">
            Local food, presented with <GradientText>care</GradientText>.
          </h2>

          <p className="mt-6 max-w-2xl text-base font-medium leading-8 tracking-normal text-slate-600 sm:text-lg">
            PeerPlates brings the warmth of local kitchens into a polished marketplace:
            discover trusted cooks, order with confidence, and join the earliest launch list.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease: EASE_OUT, delay: 0.08 }}
          className="grid gap-4 border-t border-[#ead8bd] pt-6 sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
        >
          {[
            ["Curated for", "students, neighbours, busy homes"],
            ["Powered by", "cooks, bakers, small kitchens"],
            ["Early access", "queue spots, referrals, launch drops"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-b border-[#ead8bd] pb-4 last:border-b-0"
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8833a]">
                {label}
              </div>

              <div className="mt-2 text-xl font-black leading-snug tracking-normal text-slate-950">
                {value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </SectionShell>
  );
}

function FeatureStory() {
  return (
    <SectionShell className="py-10 sm:py-16">
      <div
        className="overflow-hidden rounded-lg border border-[#ead8bd] bg-[#fffaf2] shadow-[0_30px_100px_rgba(138,107,67,0.10)]"
        style={{
          backgroundImage: `
            radial-gradient(900px circle at 16% 12%, rgba(252,176,64,0.20), transparent 56%),
            radial-gradient(700px circle at 92% 76%, rgba(138,107,67,0.12), transparent 58%),
            linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,250,242,0.96))
          `,
        }}
      >
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-[560px]">
            <Image
              src="/images/gallery/gallery20.png"
              alt="A table of home-cooked meals"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 46vw, 100vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-white/10" />

            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/45 bg-white/84 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a6b43]">
                Editorial standard
              </div>

              <div className="mt-2 text-2xl font-black leading-tight tracking-normal text-slate-950">
                Food people already trust, framed beautifully.
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="grid gap-4">
              {featureCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, ease: EASE_OUT, delay: index * 0.05 }}
                  className="grid gap-4 rounded-lg border border-white/80 bg-white/88 p-4 shadow-[0_18px_55px_rgba(2,6,23,0.06)] sm:grid-cols-[128px_1fr]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-orange-50 sm:aspect-auto">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8833a]">
                      {card.label}
                    </div>

                    <h3 className="mt-2 text-xl font-black leading-snug tracking-normal text-slate-950">
                      {card.title}
                    </h3>

                    <p className="mt-2 text-sm font-medium leading-6 tracking-normal text-slate-600">
                      {card.body}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function PremiumProcess() {
  const steps = [
    {
      number: "01",
      title: "Choose your table",
      body: "Join as someone looking for better local meals or as a cook preparing to launch drops.",
    },
    {
      number: "02",
      title: "Tell us what matters",
      body: "Answer a few focused questions so we can open with the right cooks, areas, and food needs.",
    },
    {
      number: "03",
      title: "Keep your place warm",
      body: "Receive your queue position and referral link, then move up as your community joins.",
    },
    {
      number: "04",
      title: "Open with confidence",
      body: "Cooks prepare around clear order windows, food safety expectations, and controlled demand.",
    },
  ];

  return (
    <SectionShell className="py-12 sm:py-18">
      <div className="grid gap-10 border-y border-[#ead8bd] py-10 lg:grid-cols-[0.7fr_1.3fr] lg:py-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a6b43]">
            How early access works
          </p>

          <h2 className="mt-4 text-[clamp(32px,4vw,58px)] font-black leading-tight tracking-normal text-slate-950">
            A measured launch, not a noisy signup form.
          </h2>
        </div>

        <div className="grid gap-0 sm:grid-cols-2">
          {steps.map((step) => (
            <article
              key={step.number}
              className="border-t border-[#ead8bd] py-6 sm:border-l sm:px-7 sm:first:border-l-0"
            >
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#b8833a]">
                {step.number}
              </div>

              <h3 className="mt-3 text-xl font-black leading-tight tracking-normal text-slate-950">
                {step.title}
              </h3>

              <p className="mt-3 text-sm font-medium leading-6 tracking-normal text-slate-600">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function AudiencePaths() {
  return (
    <SectionShell className="py-10 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a6b43]">
          Choose your path
        </p>

        <h2 className="mt-3 text-[clamp(34px,4vw,60px)] font-black leading-tight tracking-normal text-slate-950">
          The waitlist works for both sides of the table.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {audienceCards.map((card) => (
          <motion.article
            key={card.title}
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="overflow-hidden rounded-lg border border-[#ead8bd] bg-white shadow-[0_24px_80px_rgba(2,6,23,0.08)]"
          >
            <div className="grid min-h-full sm:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[260px] overflow-hidden bg-orange-50">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              </div>

              <div className="flex flex-col p-6 sm:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8833a]">
                  {card.eyebrow}
                </div>

                <h3 className="mt-3 text-2xl font-black leading-tight tracking-normal text-slate-950">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm font-medium leading-6 tracking-normal text-slate-600">
                  {card.body}
                </p>

                <div className="mt-5 grid gap-2">
                  {card.points.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <span className="h-px w-6 bg-[#b8833a]" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <Link
                    href={card.href}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[#fcb040] px-5 py-3 text-sm font-extrabold tracking-normal text-slate-950 shadow-[0_16px_40px_rgba(252,176,64,0.22)] transition hover:-translate-y-[1px] hover:bg-[#ffc15d] sm:w-auto"
                  >
                    {card.action}
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </SectionShell>
  );
}

function WaitlistBand() {
  return (
    <SectionShell className="py-10 sm:py-16">
      <div
        className="grid gap-8 overflow-hidden rounded-lg px-6 py-8 text-white shadow-[0_30px_100px_rgba(138,107,67,0.18)] sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10"
        style={{
          backgroundImage: `
            radial-gradient(680px circle at 18% 22%, rgba(252,176,64,0.45), transparent 55%),
            linear-gradient(135deg, #8a6b43 0%, #3f2f1d 100%)
          `,
        }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-100">
            Early access
          </p>

          <h2 className="mt-3 max-w-3xl text-[clamp(28px,4vw,52px)] font-black leading-tight tracking-normal">
            Reserve your place before PeerPlates opens in your area.
          </h2>

          <p className="mt-4 max-w-2xl text-base font-medium leading-7 tracking-normal text-white/78">
            Join the list, answer the right questions, and share your referral link to move up.
            The launch queue is the first place we will look when new areas and cook cohorts open.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-lg bg-[#fcb040] px-7 py-3.5 text-sm font-extrabold tracking-normal text-slate-950 shadow-[0_16px_40px_rgba(252,176,64,0.24)] transition hover:-translate-y-[1px] hover:bg-[#ffc15d]"
          >
            Join waitlist
          </Link>

          <Link
            href="/queue"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-extrabold tracking-normal text-white backdrop-blur transition hover:-translate-y-[1px] hover:bg-white/16"
          >
            Check queue
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

function CookiePreferenceRow({
  title,
  body,
  locked,
  checked,
  onChange,
}: {
  title: string;
  body: string;
  locked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-extrabold tracking-normal text-slate-900">{title}</div>
          <div className="mt-1 text-sm tracking-normal text-slate-600">{body}</div>
        </div>

        {locked ? (
          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold tracking-normal text-slate-700">
            Always on
          </div>
        ) : (
          <label className="inline-flex shrink-0 cursor-pointer select-none items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={Boolean(checked)}
              onChange={(event) => onChange?.(event.target.checked)}
            />

            <span
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full transition",
                checked ? "bg-slate-900" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 rounded-full bg-white transition",
                  checked ? "translate-x-6" : "translate-x-1"
                )}
              />
            </span>
          </label>
        )}
      </div>
    </div>
  );
}

function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<CookiePrefs | null>(null);
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const existing = safeParsePrefs(getCookie(CONSENT_COOKIE));

      setMounted(true);
      setConsent(existing);

      if (existing) {
        setPrefs(existing);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const shouldShow = mounted && consent === null;

  function persist(next: CookiePrefs) {
    setCookie(CONSENT_COOKIE, JSON.stringify(next), CONSENT_DAYS);
    setConsent(next);
    setPrefs(next);
    setOpen(false);
  }

  function acceptAll() {
    persist({ essential: true, analytics: true, marketing: true });
  }

  function rejectNonEssential() {
    persist({ essential: true, analytics: false, marketing: false });
  }

  function saveChoices() {
    persist({ ...prefs, essential: true });
  }

  return (
    <AnimatePresence>
      {shouldShow ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="fixed bottom-4 left-0 right-0 z-[70] px-4 sm:px-6"
          >
            <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-orange-100 bg-white/88 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-lg font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_ORANGE} 0%, ${BRAND_BROWN} 100%)`,
                    }}
                  >
                    C
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold tracking-normal text-slate-900">
                      Cookies on PeerPlates
                    </div>

                    <div className="mt-1 text-[13.5px] leading-snug tracking-normal text-slate-600">
                      We use essential cookies to make the site work. With your OK, we also use
                      analytics to improve the experience and marketing cookies to measure campaigns.
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={acceptAll}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold tracking-normal text-slate-900 transition hover:-translate-y-[1px]"
                        style={{
                          background: BRAND_ORANGE,
                          boxShadow: "0 10px 24px rgba(252,176,64,0.35)",
                        }}
                      >
                        Accept all
                      </button>

                      <button
                        type="button"
                        onClick={rejectNonEssential}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 font-extrabold tracking-normal text-slate-900 backdrop-blur transition hover:-translate-y-[1px] hover:bg-slate-50"
                      >
                        Reject non-essential
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center justify-center rounded-2xl border border-transparent bg-transparent px-4 py-2.5 font-extrabold tracking-normal text-slate-700 transition hover:bg-slate-100/70"
                      >
                        Manage
                      </button>

                      <Link
                        href="/privacy"
                        className="text-[13px] font-semibold tracking-normal text-slate-500 underline underline-offset-4 transition hover:text-slate-700 sm:ml-auto"
                      >
                        Privacy and cookies
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="h-[2px] w-full"
                style={{
                  background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})`,
                }}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className="fixed inset-0 z-[80] grid place-items-center bg-black/40 px-4 py-8 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-label="Cookie preferences"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(10px)" }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-black tracking-normal text-slate-900">
                          Cookie preferences
                        </div>

                        <div className="mt-1 text-sm tracking-normal text-slate-600">
                          Choose what you are comfortable with. Essential cookies are always on.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-2xl bg-slate-100 px-3 py-2 font-extrabold tracking-normal text-slate-700 transition hover:bg-slate-200"
                        aria-label="Close"
                      >
                        X
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      <CookiePreferenceRow
                        title="Essential"
                        body="Needed for security, page navigation, and core features."
                        locked
                      />

                      <CookiePreferenceRow
                        title="Analytics"
                        body="Helps us understand what is working so we can improve the experience."
                        checked={prefs.analytics}
                        onChange={(checked) => {
                          setPrefs((current) => ({ ...current, analytics: checked }));
                        }}
                      />

                      <CookiePreferenceRow
                        title="Marketing"
                        body="Used to personalize content and measure campaign performance."
                        checked={prefs.marketing}
                        onChange={(checked) => {
                          setPrefs((current) => ({ ...current, marketing: checked }));
                        }}
                      />
                    </div>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={rejectNonEssential}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-extrabold tracking-normal text-slate-900 transition hover:bg-slate-50"
                      >
                        Reject non-essential
                      </button>

                      <button
                        type="button"
                        onClick={acceptAll}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold tracking-normal text-slate-900 transition hover:-translate-y-[1px]"
                        style={{
                          background: BRAND_ORANGE,
                          boxShadow: "0 10px 24px rgba(252,176,64,0.35)",
                        }}
                      >
                        Accept all
                      </button>

                      <button
                        type="button"
                        onClick={saveChoices}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold tracking-normal text-white transition hover:-translate-y-[1px] sm:ml-auto"
                        style={{
                          background: BRAND_BROWN,
                          boxShadow: "0 10px 24px rgba(138,107,67,0.28)",
                        }}
                      >
                        Save choices
                      </button>
                    </div>
                  </div>

                  <div
                    className="h-[2px] w-full"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})`,
                    }}
                  />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-slate-900">
      <PremiumHero />

      <LandingIntro />

      <FeatureStory />

      <PremiumProcess />

      <AudiencePaths />

      <ScrollShowcase
        heading="App previews"
        subheading="A cleaner way to discover meals, manage cook profiles, and keep orders under control."
        direction="ltr"
        snap
        tilt={false}
        nav={[
          { label: "Discover", index: 0 },
          { label: "Menu", index: 2 },
          { label: "Cook profile", index: 3 },
          { label: "Analytics", index: 4 },
          { label: "Orders", index: 6 },
        ]}
        items={[
          {
            image: "/images/gallery/gallery1.jpeg",
            kicker: "Highlights",
            title: "TikTok-style scroll experience, built for ordering.",
            subtitle: "",
            desc: "Discover home-cooked meals in short, shoppable videos. Tap Add to cart straight from the video.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery2.jpeg",
            kicker: "Highlights",
            title: "Highlights that make choosing effortless.",
            subtitle: "",
            desc: "Short, snackable previews help you decide in seconds when you are hungry and busy.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery3.jpeg",
            kicker: "Menu",
            title: "No back-and-forth. Just orders.",
            subtitle: "",
            desc: "Browse categories, see prices upfront, and checkout without chasing menu screenshots.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery4.jpeg",
            kicker: "Partner Cook profiles",
            title: "Grow your community.",
            subtitle: "",
            desc: "Customers can follow you, view posts, and stay updated on collection days and latest drops.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery5.jpeg",
            kicker: "Analytics",
            title: "PeerPlates tracks the signals for you.",
            subtitle: "",
            desc: "Orders, revenue, customer activity, and peak times sit together in one clean dashboard.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery6.png",
            kicker: "Analytics",
            title: "Know what is working.",
            subtitle: "",
            desc: "See what sells fastest and double down on the dishes that are building demand.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery7.jpeg",
            kicker: "Order management",
            title: "Set a cutoff. Stay in control.",
            subtitle: "",
            desc: "Choose how far in advance customers must order, so prep time stays realistic.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery9.jpeg",
            kicker: "Order management",
            title: "Your kitchen. Your rules.",
            subtitle: "",
            desc: "Set slots, cap orders, and decide exactly when you are taking orders.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery10 copy.jpeg",
            kicker: "Order management",
            title: "Stay organised. Avoid mix-ups.",
            subtitle: "",
            desc: "Filter orders by pickup date and keep every order tied to the right customer.",
            stackedDesktop: true,
          },
        ]}
      />

      <WaitlistBand />

      <CookieConsent />
    </main>
  );
}
