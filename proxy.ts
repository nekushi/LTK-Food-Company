// import { NextResponse, type NextRequest } from "next/server";
// import { decrypt, updateSession } from "./lib/session";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { jwtVerify } from "jose";

// const secretKey = process.env.SESSION_SECRET;

// if (!secretKey) {
//   throw new Error("SESSION_SECRET is not defined");
// }

// const encodedKey = new TextEncoder().encode(secretKey);

// export async function proxy(request: NextRequest) {
//   const myCookies = (await cookies()).get("session")?.value;

//   if (!myCookies) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
//   try {
//     await jwtVerify(myCookies, encodedKey);

//     await updateSession();

//     return NextResponse.next();
//   } catch (error) {
//     // Invalid or expired token → redirect
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
// }

// export const config = {
//   matcher: ["/hr/:path*", "/inventory/:path*", "/store/:path*"],
// };
// // export const config = {
// //   matcher: [
// //     /*
// //      * Match all request paths except:
// //      * - _next/static (static files)
// //      * - _next/image (image optimization files)
// //      * - favicon.ico (favicon file)
// //      * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
// //      * Feel free to modify this pattern to include more paths.
// //      */
// //     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
// //     ["/hr/:path*"],
// //     ["/inventory/:path*"],
// //     ["/store/:path*"],
// //   ],
// // };

// import { NextResponse, type NextRequest } from "next/server";
// import { decrypt, updateSession } from "./lib/session";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

// // 1. Specify protected and public routes => DONE
// // 2. Check if the current route is protected or public => DONE
// // 3. Decrypt the session from the cookie => DONE
// // 4. Redirect to /login if the user is not authenticated => DONE
// // 5. Redirect to /dashboard if the user is authenticated => DONE

// const publicRoutes = ["/login"];
// const protectedRoutes = [
//   "/hr",
//   "/hr/employees",
//   "/hr/accounts",
//   "/hr/payrolls",
//   "/inventory",
//   "/inventory/items-flow",
//   "/inventory/items",
//   "/inventory/chats",
//   "/inventory/history",
//   "/store",
//   "/store/request-items",
//   "/store/chats",
//   "/store/history",
//   "/delivery",
// ];

// export async function proxy(request: NextRequest) {
//   // return await updateSession(request);

//   await updateSession();

//   const pathname = request.nextUrl.pathname;

//   const isPublicRoute = publicRoutes.includes(pathname);
//   const isProtectedRoute = protectedRoutes.includes(pathname);

//   const myCookies = (await cookies()).get("session")?.value;
//   const session = await decrypt(myCookies);

//   if (isProtectedRoute && !session?.userId) {
//     return NextResponse.redirect(new URL("/login", request.nextUrl));
//   }
//   if (
//     // isPublicRoute &&
//     session?.userId &&
//     session?.role === "HR" &&
//     request.nextUrl.pathname.startsWith("/login")
//   ) {
//     return NextResponse.redirect(new URL("/hr/", request.nextUrl));
//   }
//   if (
//     // isPublicRoute &&
//     session?.userId &&
//     session?.role === "INVENTORY" &&
//     request.nextUrl.pathname.startsWith("/login")
//   ) {
//     return NextResponse.redirect(new URL("/inventory/", request.nextUrl));
//   }
//   if (
//     // isPublicRoute &&
//     session?.userId &&
//     session?.role === "STORE" &&
//     request.nextUrl.pathname.startsWith("/login")
//   ) {
//     return NextResponse.redirect(new URL("/store/", request.nextUrl));
//   }
//   if (
//     // isPublicRoute &&
//     session?.userId &&
//     session?.role === "DELIVERY" &&
//     request.nextUrl.pathname.startsWith("/login")
//   ) {
//     return NextResponse.redirect(new URL("/delivery/", request.nextUrl));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
//      * Feel free to modify this pattern to include more paths.
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
