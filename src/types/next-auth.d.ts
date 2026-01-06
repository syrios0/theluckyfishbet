import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            username: string
            role: string
            balance: any // Using any to avoid decimal conflict for now, ideally number or string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        username: string
        balance: any
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        username: string
        id: string
        balance: any
    }
}
