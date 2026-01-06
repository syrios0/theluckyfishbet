"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { placeBet } from "@/actions/bet-actions"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface BetModalProps {
    matchId: string
    teamA: string
    teamB: string
    choice: "HOME" | "DRAW" | "AWAY" | "OVER" | "UNDER" | "HOME_OVER" | "AWAY_OVER" | "KG_VAR" | "KG_YOK"
    odds: number
    line?: number
    disabled?: boolean
    customTrigger?: React.ReactNode
}

export function BetModal({ matchId, teamA, teamB, choice, odds, line = 2.5, disabled, customTrigger }: BetModalProps) {
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const potentialPayout = amount ? (parseFloat(amount) * odds).toFixed(2) : "0.00"

    // Helper text for choice
    let choiceText = ""
    let selectionName = ""

    if (choice === "HOME") {
        choiceText = "Ev Sahibi"
        selectionName = teamA
    } else if (choice === "DRAW") {
        choiceText = "Beraberlik"
        selectionName = "Beraberlik"
    } else if (choice === "AWAY") {
        choiceText = "Deplasman"
        selectionName = teamB
    } else if (choice === "OVER") {
        choiceText = `Üst ${line}`
        selectionName = `Toplam Gol/Sayı Üst (${line})`
    } else if (choice === "UNDER") {
        choiceText = `Alt ${line}`
        selectionName = `Toplam Gol/Sayı Alt (${line})`
    } else if (choice === "KG_VAR") {
        choiceText = "KG Var"
        selectionName = "Karşılıklı Gol Var"
    } else if (choice === "KG_YOK") {
        choiceText = "KG Yok"
        selectionName = "Karşılıklı Gol Yok"
    } else if (choice === "HOME_OVER") {
        choiceText = "Ev Sahibi Üst"
        selectionName = `${teamA} Toplam Gol Üst (1.5)`
    } else {
        choiceText = "Deplasman Üst"
        selectionName = `${teamB} Toplam Gol Üst (1.5)`
    }

    async function handlePlaceBet() {
        if (!amount || parseFloat(amount) <= 0) return

        setIsLoading(true)
        setError(null)

        try {
            const result = await placeBet(matchId, choice, parseFloat(amount))
            if (result.success) {
                setOpen(false)
                setAmount("")
                router.refresh() // Update balance in navbar
            } else {
                setError(result.error || "Bir hata oluştu.")
            }
        } catch (e) {
            setError("Beklenmedik bir hata.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger ? (
                    customTrigger
                ) : (
                    <div
                        aria-disabled={disabled}
                        className={`
                            cursor-pointer group relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-center transition-all hover:bg-zinc-800 hover:border-zinc-700
                            ${disabled ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        <div className="text-xs text-zinc-500 mb-1">{choiceText}</div>
                        <div className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{odds.toFixed(2)}</div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors" />
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="w-2 h-6 bg-green-500 rounded-full" />
                        Bahis Yap
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Seçiminizi ve tutarı onaylayın.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Selection Info */}
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Maç:</span>
                            <span className="text-zinc-300">{teamA} vs {teamB}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Seçim:</span>
                            <span className="font-bold text-white">{selectionName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Oran:</span>
                            <span className="font-bold text-yellow-400">{odds.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-zinc-300">Bahis Tutarı ($1.000 - $10.000)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-7 bg-zinc-900 border-zinc-700 text-white focus:border-green-500 focus:ring-green-500/20 py-6 text-lg"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Potential Payout */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <span className="text-green-400 font-medium">Olası Kazanç</span>
                        <span className="text-xl font-bold text-green-400">${potentialPayout}</span>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={handlePlaceBet}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg"
                        disabled={isLoading || !amount || parseFloat(amount) <= 0}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bahsi Onayla"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
