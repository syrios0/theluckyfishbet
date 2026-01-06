"use client"

import { usePathname } from "next/navigation"

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    // Hide navbar on admin pages and login page (optional, but requested premium look usually implies clean login)
    // Let's keep it on login for navigation, but definitely hide on admin.
    if (pathname?.startsWith("/admin")) {
        return null
    }

    return <>{children}</>
}
