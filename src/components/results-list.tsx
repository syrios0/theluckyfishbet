"use client"

import { Match } from "@prisma/client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Trophy } from "lucide-react"

interface ResultsListProps {
    matches: Match[]
}

export function ResultsList({ matches }: ResultsListProps) {
    const [filter, setFilter] = useState("ALL")

    const filteredMatches = matches.filter(match => {
        if (filter === "ALL") return true
        return match.sport === filter
    })

    // Group by Date
    const groupedMatches: { [key: string]: Match[] } = {}
    filteredMatches.forEach(match => {
        const dateKey = new Date(match.startTime).toLocaleDateString("tr-TR", { weekday: 'long', day: 'numeric', month: 'long' })
        if (!groupedMatches[dateKey]) {
            groupedMatches[dateKey] = []
        }
        groupedMatches[dateKey].push(match)
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

            {Object.keys(groupedMatches).length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800/50">
                    <Trophy className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
                    <h3 className="text-xl font-bold text-zinc-500">Sonuç Bulunamadı</h3>
                    <p className="text-zinc-600 mt-2">Seçilen kriterlere uygun tamamlanmış müsabaka yok.</p>
                </div>
            ) : (
                Object.entries(groupedMatches).map(([date, dateMatches]) => (
                    <div key={date} className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-400 pl-1">
                            <CalendarDays className="w-4 h-4" />
                            <h3 className="font-semibold text-sm">{date}</h3>
                        </div>
                        <div className="grid gap-3">
                            {dateMatches.map((match) => (
                                <Card key={match.id} className="bg-zinc-950/50 border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-zinc-500 w-16">
                                                {new Date(match.startTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className={`p-1.5 rounded-lg ${match.sport === 'BASKETBALL' ? 'bg-orange-500/10 text-orange-500' : 'bg-white/10 text-white'}`}>
                                                {match.sport === 'BASKETBALL' ? '🏀' : '⚽'}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {match.teamALogo && <img src={match.teamALogo} alt="" className="h-5 w-5 object-contain" />}
                                                    <span className={match.scoreA! > match.scoreB! ? "text-green-400" : "text-zinc-300"}>{match.teamA}</span>
                                                    <span className="text-zinc-600 text-xs">vs</span>
                                                    <span className={match.scoreB! > match.scoreA! ? "text-green-400" : "text-zinc-300"}>{match.teamB}</span>
                                                    {match.teamBLogo && <img src={match.teamBLogo} alt="" className="h-5 w-5 object-contain" />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white tracking-widest bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800">
                                                    {match.scoreA} - {match.scoreB}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
