"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Trophy, Wallet, User, Shield, LogOut, Disc, CircleDot, History, Settings } from "lucide-react"

export function AppSidebar({ session }: { session: any }) {
    const pathname = usePathname()

    const links = [
        { name: "Maç Bülteni", href: "/", icon: LayoutDashboard },
        { name: "Sonuçlar", href: "/results", icon: History },
        { name: "Kuponlarım", href: "/my-bets", icon: Trophy },
    ]

    const userLinks = [
        { name: "Profilim", href: "/profile", icon: User },
        { name: "Cüzdan", href: "/wallet", icon: Wallet },
    ]

    const isAdmin = session?.user?.role === "ADMIN"

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl">
            {/* Logo Area */}
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        LF
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">
                        BET
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">

                <div className="mb-6">
                    <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Menu
                    </h3>
                    <div className="flex flex-col gap-1">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Hesap
                    </h3>
                    <div className="flex flex-col gap-1">
                        {userLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Sporlar
                    </h3>
                    <div className="flex flex-col gap-1">
                        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                            <Disc className="h-4 w-4 text-white" />
                            Futbol
                        </Link>
                        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                            <CircleDot className="h-4 w-4 text-orange-500" />
                            Basketbol
                        </Link>
                    </div>
                </div>

                {isAdmin && (
                    <div className="mb-6">
                        <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-red-500/80">
                            Yönetici
                        </h3>
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith("/admin")
                                ? "bg-red-500/10 text-red-500"
                                : "text-red-500/80 hover:bg-red-500/10 hover:text-red-500"
                                }`}
                        >
                            <Shield className="h-4 w-4" />
                            Admin Paneli
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    )
}
