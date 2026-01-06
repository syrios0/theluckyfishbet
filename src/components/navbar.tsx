import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Wallet, User, LogOut, Shield, Trophy } from "lucide-react"
import { signOutAction } from "@/actions/auth-actions"
import { prisma } from "@/lib/prisma"
import { ModeToggle } from "@/components/mode-toggle"

async function getUserBalance(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
    })
    return user?.balance || 0
}

export async function Navbar({ minimal = false }: { minimal?: boolean }) {
    const session = await auth()
    let balance = 0

    if (session?.user?.id) {
        // Fetch fresh balance
        const balanceDecimal = await getUserBalance(session.user.id)
        balance = Number(balanceDecimal)
    }

    return (
        <header className={`sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/10 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${minimal ? 'pl-64' : ''}`}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo - Hide if minimal (since Sidebar has it) */}
                {!minimal && (
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] transition-all">
                            LF
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-green-500 transition-colors">
                            BET
                        </span>
                    </Link>
                )}
                {/* Spacer if logo hidden */}
                {minimal && <div />}

                {/* Navigation - Centered - Hide if minimal */}
                {!minimal && (
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Maç Bülteni
                        </Link>
                        <Link href="/results" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sonuçlar
                        </Link>
                        {session?.user?.role === "ADMIN" && (
                            <Link href="/admin" className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Admin Paneli
                            </Link>
                        )}
                    </nav>
                )}

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {session?.user ? (
                        <>
                            {/* Balance Display */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                                <Wallet className="w-4 h-4 text-green-500" />
                                <span className="font-mono font-bold text-green-500">${balance.toFixed(2)}</span>
                            </div>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border bg-secondary hover:bg-secondary/80">
                                        <span className="font-bold text-secondary-foreground">
                                            {session.user.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-foreground">{session.user.username}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                Bakiyeniz: <span className="text-green-500">${balance.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {/* Link added for Profile */}
                                    <Link href="/profile">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profilim</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/my-bets">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Trophy className="mr-2 h-4 w-4" />
                                            <span>Bahislerim</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/wallet">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Wallet className="mr-2 h-4 w-4" />
                                            <span>Cüzdanım</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator />
                                    <form action={signOutAction} className="w-full">
                                        <button type="submit" className="w-full">
                                            <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-950/20 cursor-pointer">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Çıkış Yap</span>
                                            </DropdownMenuItem>
                                        </button>
                                    </form>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">
                                Giriş Yap
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
