"use client"

import { cancelBet } from "@/actions/bet-actions"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function CancelBetButton({ betId, matchStartTime }: { betId: string, matchStartTime: Date }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const now = new Date()
    const timeDiff = new Date(matchStartTime).getTime() - now.getTime()
    const threeHoursInMs = 3 * 60 * 60 * 1000
    const canCancel = timeDiff > threeHoursInMs

    if (!canCancel) return null

    async function handleCancel() {
        if (!confirm("Bahsi iptal etmek istediğinize emin misiniz? Tutar bakiyenize iade edilecektir.")) return

        setIsLoading(true)
        try {
            const result = await cancelBet(betId)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error) {
            alert("İptal işlemi başarısız.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-7 text-xs bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
        >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
            İptal Et
        </Button>
    )
}
