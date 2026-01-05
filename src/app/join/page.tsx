// src/app/join/page.tsx
import { Suspense } from "react";
import JoinClient from "./JoinClient";

type SP = Record<string, string | string[] | undefined>;

export default function JoinPage({ searchParams }: { searchParams?: SP }) {
  const raw = searchParams?.ref;
  const ref = Array.isArray(raw) ? raw[0] : raw ?? "";

  return (
    <Suspense fallback={null}>
      <JoinClient referral={ref} />
    </Suspense>
  );
}
