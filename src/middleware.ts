import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher(["/app(.*)", "/portal(.*)"]);

// Routes that are only for unauthenticated users
const isPublicAuthRoute = createRouteMatcher([
  "/login",
  "/forgot-password",
  "/reset-password",
]);

// A white-label deploy (a custom NEXT_PUBLIC_BRAND_NAME) has no marketing
// page: its home is the sign-in screen. Inlined at build time.
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME;
const isWhiteLabel = !!brandName && brandName !== "SyncEstate";

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  const url = request.nextUrl;

  // The landing page: signed-in users go straight to their dashboard, and
  // white-label deploys go to sign-in.
  if (url.pathname === "/") {
    if (isAuthenticated) return nextjsMiddlewareRedirect(request, "/app/dashboard");
    if (isWhiteLabel) return nextjsMiddlewareRedirect(request, "/login");
  }

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Middleware] Path:", url.pathname, "Authenticated:", isAuthenticated);
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(request) && !isAuthenticated) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] Redirecting to /login - not authenticated");
    }
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isPublicAuthRoute(request) && isAuthenticated) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] Redirecting to /app - already authenticated");
    }
    return nextjsMiddlewareRedirect(request, "/app");
  }
});

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
