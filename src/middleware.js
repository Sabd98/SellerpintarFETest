import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value?.toLowerCase();

  if (token) {
    const isValidToken = await verifyToken(token);
    if (isValidToken) {
      // Redirect authenticated users from public routes to /articles
      if (
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/register"
      ) {
        return NextResponse.redirect(new URL("/articles", request.url));
      }
    }
  }

  // 1. Check public paths first
  const publicPaths = ["/", "/login", "/register", "/articles"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const isValidToken = await verifyToken(token);
    if (!isValidToken) {
      throw new Error("Invalid token");
    }

    // 3. Check authenticated paths (like /edit)
    const authenticatedPaths = ["/edit", "/create", "/categories"];
    if (authenticatedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 4. Check admin paths
    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // 5. Check user paths
    if (pathname.startsWith("/user") && role !== "user") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("role");
    return response;
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/admin/:path*",
    "/edit/:path*",
    "/create",
    "/categories",
    "/user/:path*",
  ],
};
