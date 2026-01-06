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
                role: { label: "Role", type: "text", placeholder: "ADMIN" } // Helper for dev
            },
            async authorize(credentials) {
                // Mock Login Logic - ONLY FOR DEVELOPMENT
                // In production, you would verify against DB, but here we just return a dummy object
                if (!credentials?.username) return null;

                return {
                    id: "mock-user-uuid-123",
                    name: credentials.username as string,
                    username: credentials.username as string,
                    role: credentials.username === "admin" ? "ADMIN" : "USER",
                    email: `${credentials.username}@example.com`,
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
            const isOnDashboard = nextUrl.pathname.startsWith('/admin')

            if (isOnDashboard) {
                if (isLoggedIn && auth.user.role === 'ADMIN') return true
                return false // Redirect to login
            }
            return true
        }
    },
    pages: {
        signIn: '/login', // Custom login page
    },
    secret: process.env.AUTH_SECRET || "very_secret_dev_key" // Fallback for dev
})
