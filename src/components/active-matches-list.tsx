"use client"

import { Match } from "@prisma/client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Clock, Trophy } from "lucide-react"
import { BetModal } from "@/components/bet-modal"

interface ActiveMatchesListProps {
    matches: Match[]
}

export function ActiveMatchesList({ matches }: ActiveMatchesListProps) {
    const [filter, setFilter] = useState("ALL")

    const filteredMatches = matches.filter(match => {
        if (filter === "ALL") return true
        return match.sport === filter
    })

    return (
        <div className="space-y-6">
            <Tabs defaultValue="ALL" className="w-full" onValueChange={setFilter}>
                <TabsList className="bg-zinc-900 border-zinc-800 text-zinc-400">
                    <TabsTrigger value="ALL">Tümü</TabsTrigger>
                    <TabsTrigger value="FOOTBALL">Futbol</TabsTrigger>
                    <TabsTrigger value="BASKETBALL">Basketbol</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {filteredMatches.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                        <Trophy className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400">Aktif Maç Bulunamadı</h3>
                        <p className="text-zinc-500 mt-2">Bu kategoride şu anda oynanabilir bir maç yok.</p>
                    </div>
                ) : (
                    filteredMatches.map((match) => (
                        <Card key={match.id} className="bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors group overflow-hidden">
                            <CardContent className="p-6">
                                {/* Header: Date & Status */}
                                <div className="flex items-center justify-between mb-6 text-sm text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        <span>{new Date(match.startTime).toLocaleDateString('tr-TR')}</span>
                                        <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                                        <Clock className="w-4 h-4" />
                                        <span>{new Date(match.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                                        <span className="text-xs font-bold text-zinc-400">{match.sport === 'BASKETBALL' ? '🏀 BASKETBOL' : '⚽ FUTBOL'}</span>
                                    </div>
                                    {match.status === 'LIVE' && (
                                        <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                            <span className="font-bold text-xs">CANLI</span>
                                        </div>
                                    )}
                                </div>

                                {/* Teams */}
                                <div className="grid grid-cols-7 gap-4 items-center mb-8">
                                    <div className="col-span-3 text-right flex items-center justify-end gap-3">
                                        <div className="flex flex-col items-end">
                                            <div className="text-xl md:text-2xl font-bold text-white truncate">{match.teamA}</div>
                                            <div className="text-xs text-zinc-500 mt-1">Ev Sahibi</div>
                                        </div>
                                        {/* @ts-ignore */}
                                        {match.teamALogo && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={match.teamALogo} alt={match.teamA} className="w-10 h-10 object-contain" />
                                        )}
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-zinc-600">VS</div>
                                    </div>
                                    <div className="col-span-3 text-left flex items-center justify-start gap-3">
                                        {/* @ts-ignore */}
                                        {match.teamBLogo && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={match.teamBLogo} alt={match.teamB} className="w-10 h-10 object-contain" />
                                        )}
                                        <div className="flex flex-col items-start">
                                            <div className="text-xl md:text-2xl font-bold text-white truncate">{match.teamB}</div>
                                            <div className="text-xs text-zinc-500 mt-1">Deplasman</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Betting Options */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-3">
                                        <BetModal
                                            matchId={match.id}
                                            teamA={match.teamA}
                                            teamB={match.teamB}
                                            choice="HOME"
                                            odds={Number(match.oddsA)}
                                        />
                                        {/* Show Draw only if odds exist */}
                                        {match.oddsDraw ? (
                                            <BetModal
                                                matchId={match.id}
                                                teamA={match.teamA}
                                                teamB={match.teamB}
                                                choice="DRAW"
                                                odds={Number(match.oddsDraw)}
                                            />
                                        ) : (
                                            <div className="opacity-20 pointer-events-none rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-center">
                                                <div className="text-xs text-zinc-500 mb-1">Beraberlik</div>
                                                <div className="text-lg font-bold text-zinc-600">-</div>
                                            </div>
                                        )}
                                        <BetModal
                                            matchId={match.id}
                                            teamA={match.teamA}
                                            teamB={match.teamB}
                                            choice="AWAY"
                                            odds={Number(match.oddsB)}
                                        />
                                    </div>

                                    {/* Over/Under Options */}
                                    {match.oddsOver && match.oddsUnder && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <BetModal
                                                matchId={match.id}
                                                teamA={match.teamA}
                                                teamB={match.teamB}
                                                choice="OVER"
                                                odds={Number(match.oddsOver)}
                                                line={Number(match.overUnderLine || 2.5)}
                                            />
                                            <BetModal
                                                matchId={match.id}
                                                teamA={match.teamA}
                                                teamB={match.teamB}
                                                choice="UNDER"
                                                odds={Number(match.oddsUnder)}
                                                line={Number(match.overUnderLine || 2.5)}
                                            />
                                        </div>
                                    )}

                                    {/* Team Specific Goal Options (Only if Football and odds exist) */}
                                    {match.sport !== "BASKETBALL" && match.oddsHomeOver && match.oddsAwayOver && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <BetModal
                                                matchId={match.id}
                                                teamA={match.teamA}
                                                teamB={match.teamB}
                                                choice="HOME_OVER"
                                                odds={Number(match.oddsHomeOver || 2.50)}
                                            />
                                            <BetModal
                                                matchId={match.id}
                                                teamA={match.teamA}
                                                teamB={match.teamB}
                                                choice="AWAY_OVER"
                                                odds={Number(match.oddsAwayOver || 2.50)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
