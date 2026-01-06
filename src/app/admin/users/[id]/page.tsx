import { getUser, updateUserRole } from "@/actions/user-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUser(id)

    if (!user) {
        redirect("/admin/users")
    }

    return (
        <div className="space-y-8">
            <Link href="/admin/users" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Listeye Dön
            </Link>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile Card */}
                <Card className="bg-zinc-950 border-zinc-800 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            {user.username}
                        </CardTitle>
                        <form action={async () => {
                            "use server"
                            const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
                            await updateUserRole(user.id, newRole)
                        }}>
                            <Button
                                variant={user.role === "ADMIN" ? "destructive" : "default"}
                                size="sm"
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                {user.role === "ADMIN" ? "Admin Yetkisini Al" : "Admin Yap"}
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div>
                            <div className="text-sm font-medium text-zinc-500">Kullanıcı ID</div>
                            <div className="text-zinc-300 font-mono text-xs mt-1">{user.id}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-zinc-500">Mevcut Bakiye</div>
                            <div className="text-2xl font-bold text-green-400">${user.balance.toString()}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-zinc-500">Kayıt Tarihi</div>
                            <div className="text-zinc-300 mt-1">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bet History */}
                <Card className="bg-zinc-950 border-zinc-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Bahis Geçmişi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.bets.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">
                                Bu kullanıcı henüz hiç bahis yapmamış.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.bets.map((bet) => (
                                    <div key={bet.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-900">
                                        <div>
                                            <div className="font-medium text-zinc-200">
                                                {bet.match.teamA} vs {bet.match.teamB}
                                            </div>
                                            <div className="text-sm text-zinc-500 mt-1">
                                                Seçim: <span className="text-zinc-300 font-bold">{bet.choice}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white">${bet.amount.toString()}</div>
                                            <div className={`text-xs font-bold mt-1 
                                                ${bet.status === 'WON' ? 'text-green-500' :
                                                    bet.status === 'LOST' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                {bet.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
