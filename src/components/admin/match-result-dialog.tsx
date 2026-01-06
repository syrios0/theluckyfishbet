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
import { resultMatch } from "@/actions/match-actions"
import { Trophy } from "lucide-react"

export function MatchResultDialog({ matchId, teamA, teamB }: { matchId: string, teamA: string, teamB: string }) {
    const [open, setOpen] = useState(false)
    const [score, setScore] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    async function handleResult() {
        if (!score) return
        setIsLoading(true)
        try {
            await resultMatch(matchId, score)
            setOpen(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-green-600 text-green-500 hover:bg-green-600/10">
                    <Trophy className="mr-2 h-4 w-4" />
                    Sonuçlandır
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Maçı Sonuçlandır</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Maç skorunu girin ve kazanan tarafı seçin. Bu işlem geri alınamaz ve ödemeler otomatik yapılır.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="score" className="text-right text-zinc-300">
                            Skor
                        </Label>
                        <Input
                            id="score"
                            placeholder="2-1"
                            className="col-span-3 bg-zinc-900 border-zinc-800 text-white"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleResult}
                        disabled={isLoading || !score}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isLoading ? "İşleniyor..." : "Onayla ve Öde"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
