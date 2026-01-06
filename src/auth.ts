import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// GTA World Provider Definition
const GTAWorldProvider = {
    id: "gta-world",
    name: "GTA World",
    type: "oauth" as const,
    authorization: "https://ucp-tr.gta.world/oauth/authorize",
    token: "https://ucp-tr.gta.world/oauth/token",
    userinfo: "https://ucp-tr.gta.world/api/user",
    clientId: process.env.GTA_WORLD_CLIENT_ID,
    clientSecret: process.env.GTA_WORLD_CLIENT_SECRET,
    profile(profile: any) {
        return {
            id: profile.id, // Assuming API returns 'id'
            name: profile.username || profile.name,
            username: profile.username,
            role: "USER" as const, // Default role, upgrade logic can be added later
            balance: 0
        }
    },
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GTAWorldProvider,
        Credentials({
            name: "Mock Login (Dev)",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                role: { label: "Role", type: "text", placeholder: "ADMIN" }
            },
            async authorize(credentials) {
                if (!credentials?.username) return null;
                const username = credentials.username as string;

                // 1. Try to find real user in DB
                try {
                    const { prisma } = await import("@/lib/prisma");
                    const user = await prisma.user.findUnique({
                        where: { username }
                    });

                    if (user) {
                        return {
                            id: user.id,
                            name: user.username,
                            username: user.username,
                            role: user.role,
                            email: `${user.username}@example.com`,
                            balance: Number(user.balance)
                        }
                    }
                } catch (e) {
                    console.error("Auth DB lookup failed:", e);
                }

                // 2. Fallback to Mock User (for dev/admin if not in DB)
                return {
                    id: "mock-user-uuid-123",
                    name: username,
                    username: username,
                    role: username === "admin" ? "ADMIN" : "USER",
                    email: `${username}@example.com`,
                    balance: 0
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.username = (user as any).username
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.username = token.username as string
            }
            return session
        },
        async authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLoginPage = nextUrl.pathname.startsWith('/login')
            const isStaticAsset = nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.includes('.')

            if (isStaticAsset) return true

            if (isOnLoginPage) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl))
                return true
            }

            if (!isLoggedIn) return false

            const isOnDashboard = nextUrl.pathname.startsWith('/admin')
            if (isOnDashboard) {
                if (auth.user.role === 'ADMIN') return true
                return Response.redirect(new URL('/', nextUrl))
            }

            return true
        }
    },
    pages: {
        signIn: '/login', // Custom login page
    },
    secret: process.env.AUTH_SECRET || "very_secret_dev_key" // Fallback for dev
})
