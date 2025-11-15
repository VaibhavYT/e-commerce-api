import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/utils/tokens";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define protected routes and roles
  const roleProtectedRoutes = [
    { path: "/api/admin", roles: ["admin"] },
    { path: "/api/orders", roles: ["admin", "customer"] },
    { path: "/api/products", roles: ["admin"] },
    { path: "/api/users", roles: ["admin", "customer"] },
  ];

  // Find if the route matches
  const routeConfig = roleProtectedRoutes.find((r) =>
    pathname.startsWith(r.path)
  );
  if (!routeConfig) return NextResponse.next();

  // Get token
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = verifyToken(token);

    // Check if role is permitted
    if (!routeConfig.roles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    // Role allowed → proceed
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 403 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
