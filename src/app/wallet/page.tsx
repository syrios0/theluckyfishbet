"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createDepositLink, createWithdrawRequest, getTransactions, getUserBalance } from "@/actions/wallet-actions"
import { formatCurrency } from "@/lib/utils"
// import { Transaction } from "@prisma/client" // Client side import issue avoidance

type Transaction = {
    id: string
    amount: number // Decimal handling needed? usually comes as formatted or string from actions if pure server
    type: string
    status: string
    timestamp: Date
    reference: string | null
}

export default function WalletPage() {
    const { data: session, update } = useSession()
    const router = useRouter()

    // Deposit States
    const [depositAmount, setDepositAmount] = useState<string>("")
    const [isDepositing, setIsDepositing] = useState(false)

    // Withdraw States
    const [withdrawAmount, setWithdrawAmount] = useState<string>("")
    const [iban, setIban] = useState("")
    const [isWithdrawing, setIsWithdrawing] = useState(false)

    // History
    const [transactions, setTransactions] = useState<any[]>([])
    const [balance, setBalance] = useState(0)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    useEffect(() => {
        if (session?.user) {
            loadData()
        }
    }, [session])

    async function loadData() {
        setIsLoadingHistory(true)
        const [txs, bal] = await Promise.all([
            getTransactions(),
            getUserBalance()
        ])
        setTransactions(txs)
        setBalance(bal)
        setIsLoadingHistory(false)
    }

    async function handleDeposit() {
        const amount = parseFloat(depositAmount)
        if (isNaN(amount) || amount < 100) {
            alert("Geçerli bir tutar giriniz (Min: $100)")
            return
        }

        setIsDepositing(true)
        const result = await createDepositLink(amount)
        setIsDepositing(false)

        if (result.success && result.url) {
            window.location.href = result.url
        } else {
            alert(result.error || "Hata oluştu")
        }
    }

    async function handleWithdraw() {
        const amount = parseFloat(withdrawAmount)
        if (isNaN(amount) || amount < 100) {
            alert("Geçerli bir tutar giriniz (Min: $100)")
            return
        }
        if (!iban || iban.length < 5) {
            alert("Geçerli bir IBAN giriniz.")
            return
        }

        setIsWithdrawing(true)
        const result = await createWithdrawRequest(amount, iban)
        setIsWithdrawing(false)

        if (result.success) {
            alert("Çekim talebiniz oluşturuldu!")
            setWithdrawAmount("")
            setIban("")
            update() // Update session for balance
            update() // Update session for balance
            loadData() // Refresh history and balance
        } else {
            alert(result.error || "Hata oluştu")
        }
    }

    const setQuickDeposit = (amount: number) => {
        setDepositAmount(amount.toString())
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 space-y-8">
            <h1 className="text-3xl font-bold text-white">Cüzdanım</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card className="md:col-span-1 bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-400 font-medium">Toplam Bakiye</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-500">
                            {isLoadingHistory ? "..." : formatCurrency(balance)}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions Area */}
                <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
                    <Tabs defaultValue="deposit" className="w-full">
                        <div className="p-4 border-b border-zinc-800">
                            <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                                <TabsTrigger value="deposit">Para Yatır</TabsTrigger>
                                <TabsTrigger value="withdraw">Para Çek</TabsTrigger>
                                <TabsTrigger value="history">Geçmiş</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="deposit" className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Hızlı Seçim</Label>
                                <div className="flex gap-2">
                                    {[100, 500, 1000, 5000].map((amt) => (
                                        <Button
                                            key={amt}
                                            variant="outline"
                                            className="border-zinc-700 bg-zinc-800/50 hover:bg-green-600 hover:text-white transition-colors"
                                            onClick={() => setQuickDeposit(amt)}
                                        >
                                            ${amt}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Tutar ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="1000"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="bg-black/50 border-zinc-700 text-white text-lg"
                                />
                            </div>
                            <Button
                                onClick={handleDeposit}
                                disabled={isDepositing}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                            >
                                {isDepositing ? "Yönlendiriliyor..." : "ÖDEME YAP (FLEECA)"}
                            </Button>
                            <p className="text-xs text-zinc-500 text-center">
                                Güvenli ödeme sayfasına yönlendirileceksiniz.
                            </p>
                        </TabsContent>

                        <TabsContent value="withdraw" className="p-6 space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-md mb-4">
                                <p className="text-yellow-500 text-sm">
                                    ⚠️ Para çekme işlemleri yönetici onayı gerektirir ve ortalama 15-30 dakika sürer.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Tutar ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="500"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="bg-black/50 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Fleeca Hesap Numarası</Label>
                                <Input
                                    type="text"
                                    placeholder="örn: 123456789"
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value)}
                                    className="bg-black/50 border-zinc-700 text-white"
                                />
                            </div>
                            <Button
                                onClick={handleWithdraw}
                                disabled={isWithdrawing}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
                            >
                                {isWithdrawing ? "İşleniyor..." : "ÇEKİM TALEBİ OLUŞTUR"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="history" className="p-0">
                            <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800 hover:bg-transparent">
                                            <TableHead className="text-zinc-400">Tarih</TableHead>
                                            <TableHead className="text-zinc-400">İşlem</TableHead>
                                            <TableHead className="text-zinc-400">Durum</TableHead>
                                            <TableHead className="text-right text-zinc-400">Tutar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                                <TableCell className="text-zinc-300">
                                                    {new Date(tx.timestamp).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-zinc-300">
                                                    {tx.type === "DEPOSIT" && "Para Yatırma"}
                                                    {tx.type === "WITHDRAW_REQUEST" && "Çekim Talebi"}
                                                    {tx.type === "BET_WIN" && "Kazanılan Bahis"}
                                                    {tx.type === "BET_REFUND" && "İade"}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                                        ${tx.status === "COMPLETED" || tx.status === "WON" ? "bg-green-500/20 text-green-400" :
                                                            tx.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                                                                "bg-red-500/20 text-red-400"}`}>
                                                        {tx.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className={`text-right font-medium 
                                                    ${["DEPOSIT", "BET_WIN", "BET_REFUND"].includes(tx.type) ? "text-green-500" : "text-white"}`}>
                                                    {["DEPOSIT", "BET_WIN", "BET_REFUND"].includes(tx.type) ? "+" : "-"}
                                                    {Number(tx.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {transactions.length === 0 && (
                                    <div className="p-8 text-center text-zinc-500">
                                        Henüz işlem geçmişiniz yok.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    )
}
