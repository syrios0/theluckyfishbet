import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LayoutDashboard, Users, Trophy, Banknote, LogOut } from "lucide-react"
import { signOutAction } from "@/actions/auth-actions"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col">
                <div className="mb-8 flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <span className="font-bold text-lg">LF BET Admin</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Genel Bakış
                        </Button>
                    </Link>
                    <Link href="/admin/matches">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Trophy className="mr-2 h-4 w-4" />
                            Maç Yönetimi
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Users className="mr-2 h-4 w-4" />
                            Kullanıcılar
                        </Button>
                    </Link>
                    <Link href="/admin/bets">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Banknote className="mr-2 h-4 w-4" />
                            Bahis Geçmişi
                        </Button>
                    </Link>
                    <Link href="/admin/withdrawals">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Banknote className="mr-2 h-4 w-4" />
                            Çekim Talepleri
                        </Button>
                    </Link>
                    <Link href="/admin/transactions">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
                            <Banknote className="mr-2 h-4 w-4" />
                            Finansal İşlemler
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-green-400 hover:bg-green-900/10 mt-4">
                            <LogOut className="mr-2 h-4 w-4 rotate-180" />
                            Siteye Dön
                        </Button>
                    </Link>
                </nav>

                <div className="pt-6 border-t border-zinc-900">
                    <div className="mb-4 text-sm text-zinc-500">
                        Giriş: <span className="text-white">{session.user.username}</span>
                    </div>
                    <form action={signOutAction}>
                        <Button variant="destructive" className="w-full" type="submit">
                            <LogOut className="mr-2 h-4 w-4" />
                            Çıkış Yap
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 bg-black">
                {children}
            </main>
        </div>
    )
}
