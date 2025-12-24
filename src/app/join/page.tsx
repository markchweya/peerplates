import Link from "next/link";
import { redirect } from "next/navigation";
import { MotionDiv } from "../ui/motion";

type Role = "consumer" | "vendor";

export const metadata = {
  title: "Join Waitlist | PeerPlates",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; ref?: string }>;
}) {
  const sp = (await searchParams) || {};
  const roleParam = String(sp.role || "").toLowerCase();
  const ref = String(sp.ref || "").trim();

  // If a role is provided in the URL, redirect immediately on the server
  if (roleParam === "consumer" || roleParam === "vendor") {
    const qs = ref ? `?ref=${encodeURIComponent(ref)}` : "";
    redirect(`/join/${roleParam as Role}${qs}`);
  }

  const cardBase =
    "w-full rounded-2xl border p-5 text-left transition will-change-transform";
  const hover =
    "border-slate-200 hover:bg-slate-50 hover:-translate-y-[2px]";

  const consumerHref = ref ? `/join/consumer?ref=${encodeURIComponent(ref)}` : "/join/consumer";
  const vendorHref = ref ? `/join/vendor?ref=${encodeURIComponent(ref)}` : "/join/vendor";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between gap-4"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#fcb040]" />
            <div className="text-lg font-semibold tracking-tight">PeerPlates</div>
          </Link>

          <div className="text-sm text-slate-500 whitespace-nowrap">Join waitlist</div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-8 sm:mt-10 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm"
        >
          <h1 className="font-extrabold tracking-tight leading-tight text-[clamp(1.8rem,3.5vw,2.2rem)]">
            Choose your role
          </h1>

          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Consumers move up by referrals. Vendors are reviewed via questionnaire.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Link href={consumerHref} className={`${cardBase} ${hover}`}>
              <div className="text-lg sm:text-xl font-extrabold">Consumer</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">
                Buy food • Refer friends • Move up the queue
              </div>
            </Link>

            <Link href={vendorHref} className={`${cardBase} ${hover}`}>
              <div className="text-lg sm:text-xl font-extrabold">Vendor</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">
                Sell food • Questionnaire review • Manual queue position
              </div>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-slate-200 px-6 py-3 text-center font-extrabold transition hover:bg-slate-50 hover:-translate-y-[1px]"
            >
              Back
            </Link>
          </div>
        </MotionDiv>
      </div>
    </main>
  );
}
