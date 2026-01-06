import { getAllBets } from "@/actions/bet-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"

export default async function BetsPage() {
    const bets = await getAllBets()

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Genel Bahis Geçmişi</h2>
                <p className="text-zinc-400">Sistemdeki tüm bahis hareketleri.</p>
            </div>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Son Bahisler</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-zinc-400">Kullanıcı</TableHead>
                                <TableHead className="text-zinc-400">Maç</TableHead>
                                <TableHead className="text-zinc-400">Seçim / Oran</TableHead>
                                <TableHead className="text-zinc-400">Tutar / Kazanç</TableHead>
                                <TableHead className="text-zinc-400">Durum</TableHead>
                                <TableHead className="text-right text-zinc-400">Tarih</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                                        Henüz hiç bahis yapılmamış.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bets.map((bet) => {
                                    // Calculate Odds for display:
                                    // Calculate Odds for display from payout
                                    // 1 -> oddsA, X -> oddsDraw, 2 -> oddsB
                                    let lockedOdds = (Number(bet.potentialPayout) / Number(bet.amount)).toFixed(2)

                                    let choiceText = bet.choice
                                    if (bet.choice === "HOME") choiceText = "Ev Sahibi (1)"
                                    else if (bet.choice === "DRAW") choiceText = "Beraberlik (X)"
                                    else if (bet.choice === "AWAY") choiceText = "Deplasman (2)"
                                    else if (bet.choice === "OVER") choiceText = "Üst 2.5"
                                    else if (bet.choice === "UNDER") choiceText = "Alt 2.5"

                                    return (
                                        <TableRow key={bet.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                            <TableCell className="font-medium text-white">
                                                <Link href={`/admin/users/${bet.userId}`} className="hover:underline hover:text-blue-400">
                                                    {bet.user.username}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-zinc-300">
                                                {bet.match.teamA} vs {bet.match.teamB}
                                            </TableCell>
                                            <TableCell className="text-zinc-300">
                                                <span className="font-bold">{choiceText}</span> <span className="text-zinc-500 text-xs">({lockedOdds})</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-white font-mono">${bet.amount.toString()}</div>
                                                <div className="text-green-500/70 text-xs font-mono">Pot: ${bet.potentialPayout.toString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                                    ${bet.status === 'WON' ? 'bg-green-500/10 text-green-500' :
                                                        bet.status === 'LOST' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {bet.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-zinc-500 text-xs">
                                                {new Date(bet.createdAt).toLocaleString('tr-TR')}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
