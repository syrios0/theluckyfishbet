"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPendingWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/actions/admin-wallet-actions"
import { formatCurrency } from "@/lib/utils"

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        loadWithdrawals()
    }, [])

    async function loadWithdrawals() {
        setIsLoading(true)
        const data = await getPendingWithdrawals()
        setWithdrawals(data)
        setIsLoading(false)
    }

    async function handleApprove(id: string) {
        // if (!confirm("Bu çekim işlemini onaylıyor musunuz? Kullanıcıya oyun içinden parayı gönderdiğinizden emin olun.")) return

        try {
            setProcessingId(id)
            const result = await approveWithdrawal(id)

            if (result.success) {
                await loadWithdrawals()
            } else {
                alert(result.error || "Hata oluştu")
            }
        } catch (err) {
            console.error("Client error:", err)
            alert("İşlem sırasında bir hata oluştu")
        } finally {
            setProcessingId(null)
        }
    }

    async function handleReject(id: string) {
        if (!confirm("Bu çekim işlemini reddedip parayı iade etmek istiyor musunuz?")) return

        setProcessingId(id)
        const result = await rejectWithdrawal(id)
        if (result.success) {
            loadWithdrawals()
        } else {
            alert(result.error || "Hata oluştu")
        }
        setProcessingId(null)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Çekim Talepleri</h2>
                <p className="text-zinc-400">Onay bekleyen para çekme işlemleri.</p>
            </div>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-200">Bekleyen İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Tarih</TableHead>
                                <TableHead className="text-zinc-400">Kullanıcı</TableHead>
                                <TableHead className="text-zinc-400">Hesap No (IBAN)</TableHead>
                                <TableHead className="text-right text-zinc-400">Tutar</TableHead>
                                <TableHead className="text-right text-zinc-400">İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {withdrawals.map((tx) => (
                                <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="text-zinc-300">
                                        {new Date(tx.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-zinc-300 font-medium">
                                        {tx.user?.username || "Bilinmiyor"}
                                    </TableCell>
                                    <TableCell className="text-zinc-300 font-mono text-xs">
                                        {tx.reference?.replace("IBAN: ", "")}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-white">
                                        {formatCurrency(tx.amount)}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleApprove(tx.id)}
                                            disabled={!!processingId}
                                        >
                                            {processingId === tx.id ? "..." : "Onayla"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(tx.id)}
                                            disabled={!!processingId}
                                        >
                                            Reddet
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {withdrawals.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                        Bekleyen çekim talebi yok.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
