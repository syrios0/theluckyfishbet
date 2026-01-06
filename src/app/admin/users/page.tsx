import { getUsers } from "@/actions/user-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function UsersPage({
    searchParams,
}: {
    searchParams?: Promise<{ query?: string }>
}) {
    const params = await searchParams
    const query = params?.query || ""
    const users = await getUsers(query)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Kullanıcı Yönetimi</h2>
                    <p className="text-zinc-400">Sistemdeki kullanıcıları görüntüleyin ve yönetin.</p>
                </div>
            </div>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <form>
                                <Input
                                    name="query"
                                    placeholder="Kullanıcı ara..."
                                    className="pl-9 bg-zinc-900 border-zinc-800 text-white"
                                    defaultValue={query}
                                />
                            </form>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-zinc-400">Kullanıcı Adı</TableHead>
                                <TableHead className="text-zinc-400">Rol</TableHead>
                                <TableHead className="text-zinc-400">Bakiye</TableHead>
                                <TableHead className="text-zinc-400">Kayıt Tarihi</TableHead>
                                <TableHead className="text-right text-zinc-400">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                                        Kullanıcı bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                        <TableCell className="font-medium text-white">
                                            {user.username}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-bold 
                                                ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-green-400 font-mono">
                                            ${user.balance.toString()}
                                        </TableCell>
                                        <TableCell className="text-zinc-400">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                                    Detaylar
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
