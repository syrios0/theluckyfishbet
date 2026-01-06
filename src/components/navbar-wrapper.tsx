"use client"

import { usePathname } from "next/navigation"

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    // Hide navbar on admin pages and login page
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
        return null
    }

    return <>{children}</>
}
