"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MotionDiv } from "@/app/ui/motion";
import SelectField from "@/components/fields/SelectField";

type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "checkboxes"
  | "number"
  | "file";

type Question = {
  key: string;
  label: string;
  required?: boolean;
  type?: QuestionType;
  placeholder?: string;
  options?: string[];

  // for file questions
  accept?: string[];
  helpText?: string;
};

type Props = {
  role: "consumer" | "vendor";
  title: string;
  subtitle: string;
  questions: Question[];
};

type AnswerValue = string | string[]; // checkbox groups use string[]
type AnswersState = Record<string, AnswerValue>;

export default function JoinForm({ role, title, subtitle, questions }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const ref = (sp.get("ref") || "").trim();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const initialAnswers = useMemo<AnswersState>(() => {
    const obj: AnswersState = {};
    for (const q of questions) {
      obj[q.key] = q.type === "checkboxes" ? [] : "";
    }
    return obj;
  }, [questions]);

  const [answers, setAnswers] = useState<AnswersState>(initialAnswers);

  // Files are not stored in answers; keep separately
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const setAnswer = (key: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheckbox = (key: string, option: string, allOptions: string[]) => {
    const current = (answers[key] as string[]) || [];
    const hasNone = allOptions.includes("None of the above");
    const isNone = option === "None of the above";

    let next = current.includes(option)
      ? current.filter((x) => x !== option)
      : [...current, option];

    // Enforce "None of the above" behavior
    if (hasNone) {
      if (isNone && next.includes("None of the above")) {
        next = ["None of the above"];
      } else if (!isNone) {
        next = next.filter((x) => x !== "None of the above");
      }
    }

    setAnswer(key, next);
  };

  const isEmpty = (v: AnswerValue) => {
    if (Array.isArray(v)) return v.length === 0;
    return !String(v ?? "").trim();
  };

  const validate = () => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";

    for (const q of questions) {
      if (!q.required) continue;

      if (q.type === "file") {
        // Only validate if you ever set file fields to required (currently optional)
        const f = files[q.key];
        if (!f) return `Please upload: ${q.label}`;
        continue;
      }

      const v = answers[q.key];
      if (isEmpty(v)) return `Please answer: ${q.label}`;
    }

    return "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSubmitting(true);
    try {
      const hasAnyFile = Object.values(files).some(Boolean);

      // Convert answers to something easy to store (checkbox arrays -> array)
      const payload = {
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        ref: ref || null,
        answers,
      };

      let res: Response;

      if (hasAnyFile) {
        // Use multipart for file uploads
        const fd = new FormData();
        fd.append("role", payload.role);
        fd.append("fullName", payload.fullName);
        fd.append("email", payload.email);
        if (payload.phone) fd.append("phone", payload.phone);
        if (payload.ref) fd.append("ref", payload.ref);

        // answers as JSON
        fd.append("answers", JSON.stringify(payload.answers));

        // attach files
        for (const [k, f] of Object.entries(files)) {
          if (f) fd.append(k, f);
        }

        res = await fetch("/api/signup", { method: "POST", body: fd });
      } else {
        // JSON-only when no files
        res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Signup failed. Try again.");

      const qp = new URLSearchParams();
      if (data?.id) qp.set("id", data.id);
      if (data?.referral_code) qp.set("code", data.referral_code);
      router.push(`/thanks?${qp.toString()}`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "h-12 w-full rounded-2xl border border-[#fcb040] bg-white px-4 font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-[rgba(252,176,64,0.30)] placeholder:text-slate-500";
  const textareaBase =
    "w-full rounded-2xl border border-[#fcb040] bg-white px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-[rgba(252,176,64,0.30)] placeholder:text-slate-500 min-h-[110px]";

  const cardBase =
    "rounded-2xl border border-[#fcb040] bg-white p-4 shadow-sm";

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

          <div className="text-sm text-slate-900 font-semibold whitespace-nowrap">
            {role === "consumer" ? "Consumer" : "Vendor"} waitlist
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-8 sm:mt-10 rounded-3xl border border-[#fcb040] bg-white p-5 sm:p-7 shadow-sm"
        >
          <h1 className="font-extrabold tracking-tight leading-tight text-[clamp(1.8rem,3.5vw,2.2rem)]">
            {title}
          </h1>
          <p className="mt-2 text-slate-900/70 text-sm sm:text-base">{subtitle}</p>

          {ref ? (
            <div className="mt-4 rounded-2xl border border-[#fcb040] bg-white p-4 text-sm">
              <span className="font-semibold">Referral detected:</span>{" "}
              <span className="font-mono">{ref}</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {/* Basics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Full name *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputBase}
                  placeholder="e.g. Christine Gesare"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Email *</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  placeholder="you@email.com"
                  type="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputBase}
                placeholder="+254..."
                type="tel"
              />
            </div>

            {/* Questions */}
            <div className="mt-2 grid gap-4">
              {questions.map((q) => {
                const t = q.type || "text";
                const val = answers[q.key];

                if (t === "select") {
                  return (
                    <SelectField
                      key={q.key}
                      label={q.label}
                      required={q.required}
                      value={String(val ?? "")}
                      onChange={(v) => setAnswer(q.key, v)}
                      options={q.options || []}
                      placeholder={q.placeholder || "Select…"}
                    />
                  );
                }

                if (t === "checkboxes") {
                  const arr = Array.isArray(val) ? val : [];
                  const opts = q.options || [];
                  return (
                    <div key={q.key} className="grid gap-2">
                      <label className="text-sm font-semibold">
                        {q.label} {q.required ? "*" : ""}
                      </label>

                      <div className={`${cardBase} grid gap-2`}>
                        {opts.map((opt) => {
                          const checked = arr.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleCheckbox(q.key, opt, opts)}
                              className={[
                                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-semibold transition",
                                checked
                                  ? "border-[#fcb040] bg-[#fcb040] text-slate-900"
                                  : "border-[#fcb040] bg-white text-slate-900 hover:-translate-y-[1px]",
                              ].join(" ")}
                            >
                              <span className="pr-3">{opt}</span>
                              <span
                                className={[
                                  "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                                  checked
                                    ? "border-slate-900 bg-white"
                                    : "border-[#fcb040] bg-white",
                                ].join(" ")}
                                aria-hidden="true"
                              >
                                {checked ? (
                                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                        <div className="text-xs text-slate-900/60">
                          You can select multiple options.
                        </div>
                      </div>
                    </div>
                  );
                }

                if (t === "file") {
                  const accept = (q.accept || [".pdf", ".jpg", ".jpeg", ".png"]).join(",");
                  return (
                    <div key={q.key} className="grid gap-2">
                      <label className="text-sm font-semibold">
                        {q.label} {q.required ? "*" : ""}
                      </label>

                      <div className={`${cardBase} grid gap-2`}>
                        <input
                          type="file"
                          accept={accept}
                          className="block w-full rounded-2xl border border-[#fcb040] bg-white px-4 py-3 font-semibold text-slate-900 file:mr-4 file:rounded-xl file:border-0 file:bg-[#fcb040] file:px-4 file:py-2 file:font-extrabold file:text-slate-900"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setFiles((prev) => ({ ...prev, [q.key]: f }));
                          }}
                        />
                        {q.helpText ? (
                          <div className="text-xs text-slate-900/60">{q.helpText}</div>
                        ) : null}
                        {files[q.key] ? (
                          <div className="text-xs font-semibold">
                            Selected: <span className="font-mono">{files[q.key]!.name}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                }

                // textarea
                if (t === "textarea") {
                  return (
                    <div key={q.key} className="grid gap-2">
                      <label className="text-sm font-semibold">
                        {q.label} {q.required ? "*" : ""}
                      </label>
                      <textarea
                        value={String(val ?? "")}
                        onChange={(e) => setAnswer(q.key, e.target.value)}
                        className={textareaBase}
                        placeholder={q.placeholder || ""}
                      />
                    </div>
                  );
                }

                // number / text / email / tel
                return (
                  <div key={q.key} className="grid gap-2">
                    <label className="text-sm font-semibold">
                      {q.label} {q.required ? "*" : ""}
                    </label>
                    <input
                      value={String(val ?? "")}
                      onChange={(e) => setAnswer(q.key, e.target.value)}
                      className={inputBase}
                      placeholder={q.placeholder || ""}
                      type={t === "number" ? "number" : t}
                      inputMode={t === "number" ? "numeric" : undefined}
                    />
                  </div>
                );
              })}
            </div>

            {error ? (
              <div className="mt-2 rounded-2xl border border-[#fcb040] bg-white p-4 text-sm text-slate-900">
                {error}
              </div>
            ) : null}

            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-[#fcb040] px-6 py-3 text-center font-extrabold text-slate-900 transition hover:opacity-95 hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? "Submitting..." : "Join waitlist"}
              </button>

              <Link
                href="/"
                className="rounded-2xl border border-[#fcb040] bg-white px-6 py-3 text-center font-extrabold text-slate-900 transition hover:-translate-y-[1px]"
              >
                Back
              </Link>
            </div>

            <div className="text-xs text-slate-900/60">
              By submitting, you agree to receive updates about early access.
            </div>
          </form>
        </MotionDiv>
      </div>
    </main>
  );
}
