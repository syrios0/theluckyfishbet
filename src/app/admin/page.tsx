import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminStats } from "@/actions/admin-actions"
import { DollarSign, Gamepad2, Users, Banknote, Calendar, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"

export default async function AdminDashboardPage() {
    const stats = await getAdminStats()

    if (!stats) return <div className="text-white p-8">Veri yüklenemedi veya yetkiniz yok.</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Yönetici Paneli</h2>
                    <p className="text-zinc-400">Sistem genel durumu, finansal veriler ve aktiviteler.</p>
                </div>
                <div className="flex gap-2">
                    <a href="/admin/matches" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Maç Yönetimi</a>
                    <a href="/admin/withdrawals" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Çekim Talepleri</a>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className=" text-zinc-200 text-sm font-medium">Toplam Oyuncu Bakiyesi</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${Number(stats.totalUserBalance).toFixed(2)}</div>
                        <p className="text-xs text-zinc-500">Kullanıcı cüzdanlarındaki toplam para</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">Net Kasa (Kar/Zarar)</CardTitle>
                        <DollarSign className={`h-4 w-4 ${stats.netHouseProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.netHouseProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${stats.netHouseProfit.toFixed(2)}
                        </div>
                        <p className="text-xs text-zinc-500">Bahislerden elde edilen net kar</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">Finansal Akış</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-lg font-bold text-green-400 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    ${Number(stats.totalDeposits).toFixed(0)}
                                </div>
                                <p className="text-[10px] text-zinc-500">Toplam Yatırım</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-red-400 flex items-center justify-end gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    ${Number(stats.totalWithdrawals).toFixed(0)}
                                </div>
                                <p className="text-[10px] text-zinc-500">Toplam Çekim</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-950 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-200">Bekleyen İşlemler</CardTitle>
                        <Banknote className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.pendingWithdrawalsCount}</div>
                        <p className="text-xs text-zinc-500">Onay bekleyen çekim talebi</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alt Bölüm: Son Aktiviteler */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Son Bahisler Tablosu (4 birim genişlik) */}
                <Card className="col-span-4 bg-zinc-950 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Son Oynanan Bahisler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentBets.length === 0 ? (
                                <p className="text-sm text-zinc-500">Henüz bahis yok.</p>
                            ) : (
                                stats.recentBets.map((bet) => (
                                    <div key={bet.id} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white leading-none">
                                                {bet.user.username}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {bet.match.teamA} vs {bet.match.teamB}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-zinc-200">${Number(bet.amount).toFixed(2)}</div>
                                                <p className={`text-[10px] ${bet.status === 'WON' ? 'text-green-500' :
                                                        bet.status === 'LOST' ? 'text-red-500' : 'text-yellow-500'
                                                    }`}>
                                                    {bet.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Son Kayıt Olanlar (3 birim genişlik) */}
                <Card className="col-span-3 bg-zinc-950 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Son Katılanlar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentUsers.length === 0 ? (
                                <p className="text-sm text-zinc-500">Henüz üye yok.</p>
                            ) : (
                                stats.recentUsers.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 font-bold border border-zinc-800">
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.username}</p>
                                                <p className="text-xs text-zinc-500">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-zinc-300">
                                            ${Number(user.balance).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
