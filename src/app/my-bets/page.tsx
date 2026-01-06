import { getMyBets } from "@/actions/my-bets-action"
import { CancelBetButton } from "@/components/cancel-bet-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Clock, Trophy } from "lucide-react"

export default async function MyBetsPage() {
    const bets = await getMyBets()

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-8 w-1 bg-green-500 rounded-full" />
                    <h2 className="text-3xl font-bold">Bahislerim</h2>
                </div>

                <div className="grid gap-6">
                    {bets.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                            <Trophy className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                            <h3 className="text-xl font-bold text-zinc-400">Henüz Bahis Yapmadınız</h3>
                            <p className="text-zinc-500 mt-2">Maç bülteninden hemen kazanmaya başlayabilirsiniz.</p>
                        </div>
                    ) : (
                        bets.map((bet) => {
                            // Calculate locked odds from payout
                            const calculatedOdds = (Number(bet.potentialPayout) / Number(bet.amount)).toFixed(2)

                            // Map choice to readable text
                            let choiceText = bet.choice
                            if (bet.choice === "HOME") choiceText = "Ev Sahibi (1)"
                            else if (bet.choice === "DRAW") choiceText = "Beraberlik (X)"
                            else if (bet.choice === "AWAY") choiceText = "Deplasman (2)"
                            else if (bet.choice === "OVER") choiceText = "Üst 2.5"
                            else if (bet.choice === "UNDER") choiceText = "Alt 2.5"

                            let statusColor = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            if (bet.status === "WON") statusColor = "bg-green-500/10 text-green-500 border-green-500/20"
                            if (bet.status === "LOST") statusColor = "bg-red-500/10 text-red-500 border-red-500/20"
                            if (bet.status === "CANCELLED") statusColor = "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"

                            return (
                                <Card key={bet.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors group">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            {/* Match Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                                                    <CalendarDays className="w-4 h-4" />
                                                    <span>{new Date(bet.match.startTime).toLocaleDateString('tr-TR')}</span>
                                                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(bet.match.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="text-xl font-bold text-white">
                                                    {bet.match.teamA} <span className="text-zinc-600 mx-2">vs</span> {bet.match.teamB}
                                                </div>
                                                <div className="mt-2 text-zinc-400 text-sm">
                                                    Seçim: <span className="text-green-400 font-bold ml-1">{choiceText}</span>
                                                    <span className="mx-2 text-zinc-700">|</span>
                                                    Oran: <span className="text-yellow-500 font-bold ml-1">{calculatedOdds}</span>
                                                </div>
                                            </div>

                                            {/* Amount & Status */}
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-sm text-zinc-500 mb-1">Tutar / Kazanç</div>
                                                    <div className="font-mono text-lg font-bold text-white">${bet.amount.toString()}</div>
                                                    <div className="font-mono text-sm text-green-500/80">${bet.potentialPayout.toString()}</div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge variant="outline" className={`${statusColor} capitalize`}>
                                                        {bet.status.toLowerCase()}
                                                    </Badge>

                                                    {bet.status === 'OPEN' && (
                                                        <CancelBetButton betId={bet.id} matchStartTime={bet.match.startTime} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
