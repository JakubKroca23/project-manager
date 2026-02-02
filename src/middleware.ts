import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Define public paths that don't require authentication
    const publicPaths = ["/login", "/signup", "/auth/callback"];
    const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (!user && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user) {
        // If user is logged in, check if they are approved
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_approved, role")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Middleware profile error:", profileError);
        }

        const isApproved = profile?.is_approved === true || profile?.role === 'admin';
        const role = profile?.role;
        const isPendingPath = request.nextUrl.pathname === "/pending-approval";

        // If not approved and not on pending page, redirect to pending
        if (!isApproved && !isPendingPath) {
            return NextResponse.redirect(new URL("/pending-approval", request.url));
        }

        // Check for admin routes
        const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
        if (isAdminPath) {
            if (role !== "admin") {
                return NextResponse.redirect(new URL("/", request.url));
            }
        }

        // If approved and on pending page or login/signup, redirect to home
        if (isApproved && (isPendingPath || isPublicPath)) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return response;
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
