// src/app/join/page.tsx
import { Suspense } from "react";
import JoinClient from "./JoinClient";

type SP = Record<string, string | string[] | undefined>;

async function resolveSearchParams(sp?: SP | Promise<SP>) {
  if (!sp) return undefined;
  return typeof (sp as any)?.then === "function" ? await (sp as Promise<SP>) : (sp as SP);
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams?: SP | Promise<SP>;
}) {
  const sp = await resolveSearchParams(searchParams);

  const raw = sp?.ref;
  const ref = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <Suspense fallback={null}>
      <JoinClient referral={ref} />
    </Suspense>
  );
}
