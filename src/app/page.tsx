import { getActiveMatches } from "@/actions/match-actions"
import { BetModal } from "@/components/bet-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Clock, Trophy } from "lucide-react"

export default async function Home() {
  const matches = await getActiveMatches()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-black z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=3540&auto=format&fit=crop')] bg-cover bg-center opacity-30" />

        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center space-y-6">
          <Badge variant="outline" className="text-green-400 border-green-500/50 bg-green-500/10 px-4 py-1 text-sm uppercase tracking-widest">
            LF BET
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
            Kazanmaya Başla
          </h1>

          <p className="text-zinc-400 max-w-2xl text-lg md:text-xl font-light">
            Şehrin en yüksek oranları ve en güvenilir bahis platformu.
            Maçları takip et, bahsini yap ve kazanmanın tadını çıkar.
          </p>
        </div>
      </div>

      {/* Match List Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-1 bg-green-500 rounded-full" />
          <h2 className="text-2xl font-bold">Maç Bülteni</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {matches.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
              <Trophy className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <h3 className="text-xl font-bold text-zinc-400">Aktif Maç Bulunamadı</h3>
              <p className="text-zinc-500 mt-2">Şu anda oynanabilir bir maç yok. Lütfen daha sonra tekrar kontrol edin.</p>
            </div>
          ) : (
            matches.map((match) => (
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
                      <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                      <span className="text-xs font-bold text-zinc-400">{match.sport === 'BASKETBALL' ? 'BASKETBOL' : 'FUTBOL'}</span>
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
                      {match.oddsDraw && (
                        <BetModal
                          matchId={match.id}
                          teamA={match.teamA}
                          teamB={match.teamB}
                          choice="DRAW"
                          odds={Number(match.oddsDraw)}
                        />
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

                    {/* KG Var Options (Only if Football and odds exist) */}
                    {match.sport !== "BASKETBALL" && match.oddsBothTeamsScoreYes && match.oddsBothTeamsScoreNo && (
                      <div className="grid grid-cols-2 gap-3">
                        <BetModal
                          matchId={match.id}
                          teamA={match.teamA}
                          teamB={match.teamB}
                          choice="KG_VAR"
                          odds={Number(match.oddsBothTeamsScoreYes || 1.80)}
                        />
                        <BetModal
                          matchId={match.id}
                          teamA={match.teamA}
                          teamB={match.teamB}
                          choice="KG_YOK"
                          odds={Number(match.oddsBothTeamsScoreNo || 1.80)}
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
    </div>
  )
}
