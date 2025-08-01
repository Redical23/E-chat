import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === "/" || pathname === "/register";

  const isAllowedPathWithSession =
    session && (pathname === "/" || pathname === "/Chat" || pathname === "/profile");

  // ✅ No session: Only allow "/", "/register"
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ Session exists: Allow "/", "/Chat", "/profile"
  if (session && !isAllowedPathWithSession) {
    return NextResponse.redirect(new URL("/Chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
