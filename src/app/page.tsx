import Link from "next/link";
import { MotionDiv, MotionP, MotionH1 } from "@/app/ui/motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Top bar */}
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#fcb040]" />
            <div className="text-lg font-semibold tracking-tight">PeerPlates</div>
          </div>

          <Link
            href="/join"
            className="rounded-xl border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50 transition whitespace-nowrap"
          >
            Join waitlist
          </Link>
        </MotionDiv>

        {/* Hero */}
        <div className="mt-10 sm:mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <MotionDiv
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-[#fcb040]" />
              A peer-to-peer food platform
            </MotionDiv>

            <MotionH1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 font-extrabold tracking-tight leading-[1.05] text-[clamp(2.1rem,4.8vw,3.6rem)]"
            >
              Discover great food from local vendors — and get early access.
            </MotionH1>

            <MotionP
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-4 max-w-xl text-base sm:text-lg text-slate-600"
            >
              Join the waitlist as a consumer or a vendor. Consumers can move up the
              queue by referring friends.
            </MotionP>

            <MotionDiv
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="/join/consumer"
                className="rounded-2xl bg-[#fcb040] px-6 py-3 text-center font-extrabold text-slate-900 shadow-sm transition hover:opacity-95 hover:-translate-y-[1px]"
              >
                I’m a Consumer
              </Link>

              <Link
                href="/join/vendor"
                className="rounded-2xl border border-slate-200 px-6 py-3 text-center font-extrabold transition hover:bg-slate-50 hover:-translate-y-[1px]"
              >
                I’m a Vendor
              </Link>
            </MotionDiv>
          </div>

          {/* Right card */}
          <MotionDiv
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
          >
            <div className="text-sm font-semibold text-slate-700">What you get</div>

            <div className="mt-4 grid gap-3">
              {[
                "Early access to the app",
                "A transparent queue position",
                "Consumer referrals move you up",
                "Vendors reviewed using questionnaire",
              ].map((x, i) => (
                <MotionDiv
                  key={x}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 + i * 0.06 }}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div className="mt-1 h-3 w-3 rounded-full bg-[#fcb040]" />
                  <div className="font-semibold text-slate-800">{x}</div>
                </MotionDiv>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-700">Next</div>
              <div className="mt-1 text-slate-600">
                Questionnaires are locked ✅ Next up: referrals + queue movement and admin review tools.
              </div>
            </div>
          </MotionDiv>
        </div>

        <div className="mt-14 sm:mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} PeerPlates
        </div>
      </div>
    </main>
  );
}
