
import { getAllTransactions } from "@/actions/admin-wallet-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

export default async function TransactionsPage() {
    const transactions = await getAllTransactions()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Finansal İşlemler</h2>
                <p className="text-zinc-400">Son 100 işlem kaydı.</p>
            </div>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-200">İşlem Geçmişi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Tarih</TableHead>
                                <TableHead className="text-zinc-400">Kullanıcı</TableHead>
                                <TableHead className="text-zinc-400">İşlem Tipi</TableHead>
                                <TableHead className="text-zinc-400">Referans</TableHead>
                                <TableHead className="text-right text-zinc-400">Tutar</TableHead>
                                <TableHead className="text-right text-zinc-400">Durum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="text-zinc-300">
                                        {new Date(tx.timestamp).toLocaleString("tr-TR")}
                                    </TableCell>
                                    <TableCell className="text-zinc-300 font-medium">
                                        {tx.user?.username || "Silinmiş"}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' :
                                                tx.type === 'WITHDRAW_REQUEST' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    tx.type === 'WITHDRAW_COMPLETED' ? 'bg-orange-500/10 text-orange-500' :
                                                        tx.type === 'BET_WIN' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-zinc-500/10 text-zinc-500'}`}>
                                            {tx.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-xs font-mono">
                                        {tx.reference || "-"}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${tx.type === 'BET_WIN' || tx.type === 'DEPOSIT' || tx.type === 'BET_REFUND' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {formatCurrency(tx.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${tx.status === 'COMPLETED' ? 'text-green-500' :
                                                tx.status === 'PENDING' ? 'text-yellow-500' :
                                                    'text-red-500'}`}>
                                            {tx.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
