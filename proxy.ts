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

import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
