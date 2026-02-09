import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_HOST = "dashboard.peerplates.co.uk";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const host = (req.headers.get("host") || "").toLowerCase();
    const hostname = host.split(":")[0];

    if (hostname !== ALLOWED_HOST) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
