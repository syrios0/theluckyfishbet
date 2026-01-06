import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, Trophy, Target, History, TrendingUp, CalendarDays } from "lucide-react"

async function getUserProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            bets: {
                orderBy: { createdAt: 'desc' }
            },
            transactions: {
                orderBy: { timestamp: 'desc' },
                take: 10
            }
        }
    })
}

export default async function ProfilePage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const user = await getUserProfile(session.user.id)
    if (!user) redirect("/login")

    // Calculate Stats
    const totalBets = user.bets.length
    const wonBets = user.bets.filter(b => b.status === 'WON').length
    const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) : "0.0"
    const totalWagered = user.bets.reduce((acc, bet) => acc + Number(bet.amount), 0)

    // Calculate total winnings (from Won bets potentialPayout)
    // Note: This is an approximation if we don't store actual payout separately, but potentialPayout is accurate for WON bets
    const totalWonAmount = user.bets
        .filter(b => b.status === "WON")
        .reduce((acc, bet) => acc + Number(bet.potentialPayout), 0)

    const netProfit = totalWonAmount - totalWagered

    return (
        <div className="min-h-screen bg-background text-foreground py-12">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-3xl font-bold">{user.username}</h1>
                            <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/10">
                                {user.role}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                            <CalendarDays className="w-4 h-4" />
                            Katılım: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                            <Wallet className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Güncel Bakiye</p>
                            <p className="text-2xl font-bold font-mono text-green-500">${Number(user.balance).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Bahis</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBets}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Kazanılan</CardTitle>
                            <Trophy className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-500">{wonBets}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Kazanma Oranı</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">%{winRate}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Net Kâr/Zarar</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Recent Transactions */}
                    <Card className="md:col-span-2 border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5 text-green-500" />
                                Son İşlemler
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {user.transactions.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">Henüz bir işlem bulunmuyor.</p>
                                ) : (
                                    user.transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' || tx.type === 'BET_WIN' || tx.type === 'BET_REFUND'
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.type === 'DEPOSIT' && <Wallet className="w-4 h-4" />}
                                                    {tx.type === 'BET_WIN' && <Trophy className="w-4 h-4" />}
                                                    {(tx.type === 'WithDRAW_REQUEST' || tx.type === 'WITHDRAW_COMPLETED') && <History className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {tx.type === 'DEPOSIT' ? 'Para Yatırma' :
                                                            tx.type === 'BET_WIN' ? 'Bahis Kazancı' :
                                                                tx.type === 'BET_REFUND' ? 'Bahis İadesi' :
                                                                    tx.type === 'WITHDRAW_REQUEST' ? 'Çekim Talebi' :
                                                                        tx.type === 'WITHDRAW_COMPLETED' ? 'Çekim Tamamlandı' : tx.type}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(tx.timestamp).toLocaleString("tr-TR")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`font-mono font-bold ${tx.type === 'DEPOSIT' || tx.type === 'BET_WIN' || tx.type === 'BET_REFUND'
                                                    ? 'text-green-500'
                                                    : 'text-red-500'
                                                }`}>
                                                {tx.type === 'DEPOSIT' || tx.type === 'BET_WIN' || tx.type === 'BET_REFUND' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Info Side */}
                    <div className="space-y-6">
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Hesap Bilgileri</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Kullanıcı Adı</label>
                                    <p className="font-medium">{user.username}</p>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Hesap ID</label>
                                    <p className="font-mono text-xs text-muted-foreground break-all">{user.id}</p>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase">Durum</label>
                                    <div className="mt-1">
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Aktif</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
