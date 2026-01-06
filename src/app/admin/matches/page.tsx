import { MatchResultDialog } from "@/components/admin/match-result-dialog"
import { getMatches, deleteMatch, getArchivedMatches, restoreMatch } from "@/actions/match-actions"
import { MatchForm } from "@/components/admin/match-form"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Archive, RotateCcw } from "lucide-react"
import Link from "next/link"

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const params = await searchParams
    const isArchived = params.tab === "archived"

    const matches = isArchived ? await getArchivedMatches() : await getMatches()

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Maç Yönetimi</h2>
                    <p className="text-zinc-400">Maçları oluşturun, düzenleyin ve sonuçlandırın.</p>
                </div>
                {!isArchived && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Maç Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Yeni Maç Oluştur</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Maç detaylarını ve başlangıç oranlarını giriniz.
                                </DialogDescription>
                            </DialogHeader>
                            <MatchForm />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-zinc-800">
                <Link
                    href="/admin/matches"
                    className={`pb-3 text-sm font-medium transition-colors relative ${!isArchived ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                    Aktif Maçlar
                    {!isArchived && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </Link>
                <Link
                    href="/admin/matches?tab=archived"
                    className={`pb-3 text-sm font-medium transition-colors relative ${isArchived ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                    Arşivlenmiş Maçlar
                    {isArchived && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </Link>
            </div>

            <div className="grid gap-4">
                {matches.length === 0 ? (
                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-zinc-500">
                            <Archive className="h-10 w-10 mb-4 opacity-50" />
                            <p>{isArchived ? "Arşivde maç bulunmuyor." : "Henüz hiç maç oluşturulmamış."}</p>
                        </CardContent>
                    </Card>
                ) : (
                    matches.map((match) => (
                        <Card key={match.id} className="bg-zinc-950 border-zinc-800">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-semibold text-lg text-white">
                                        {match.teamA} <span className="text-zinc-500 text-sm mx-2">vs</span> {match.teamB}
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        {new Date(match.startTime).toLocaleString('tr-TR')}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex gap-4 text-sm font-medium">
                                        <div className="flex flex-col items-center">
                                            <span className="text-zinc-500">1</span>
                                            <span className="text-green-400">{match.oddsA.toString()}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-zinc-500">X</span>
                                            <span className="text-zinc-300">{match.oddsDraw ? match.oddsDraw.toString() : '-'}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-zinc-500">2</span>
                                            <span className="text-red-400">{match.oddsB.toString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isArchived && match.status !== 'ENDED' && (
                                            <MatchResultDialog
                                                matchId={match.id}
                                                teamA={match.teamA}
                                                teamB={match.teamB}
                                            />
                                        )}
                                        <div className={`px-2 py-1 rounded text-xs font-bold 
                                            ${match.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                match.status === 'ENDED' ? 'bg-gray-500/10 text-gray-500' :
                                                    'bg-green-500/10 text-green-500'}`}>
                                            {match.status}
                                            {match.result && ` (${match.result})`}
                                        </div>

                                        {isArchived ? (
                                            <form action={async () => {
                                                "use server"
                                                await restoreMatch(match.id)
                                            }}>
                                                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-green-500 hover:bg-green-500/10">
                                                    <RotateCcw className="h-4 w-4 mr-2" /> Geri Yükle
                                                </Button>
                                            </form>
                                        ) : (
                                            <form action={async () => {
                                                "use server"
                                                await deleteMatch(match.id)
                                            }}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
