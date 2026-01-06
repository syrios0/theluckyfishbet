"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [username, setUsername] = useState("")

    const handleLogin = async (provider: string, options?: any) => {
        try {
            setIsLoading(provider)
            // Default to home, but if admin credentials, maybe redirect to admin?
            // Actually, safer to always go to home, and let Admin click "Admin Panel" link if they want.
            // OR checks the role? No, client side doesn't know role yet.
            // Simple fix: Redirect all to "/" (Home).
            // If they are admin, they can navigate to /admin from there.
            const destination = (options?.username === "admin") ? "/admin" : "/"
            await signIn(provider, { callbackUrl: destination, ...options })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">Giriş Yap</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Los Santos Betting yönetim paneline veya hesabınıza erişin.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleLogin("gta-world")}
                        disabled={!!isLoading}
                    >
                        {isLoading === "gta-world" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        GTA World ile Giriş Yap
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-950 px-2 text-zinc-500">Misafir Girişi (Aktif)</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Input
                            placeholder="Kullanıcı Adı (Örn: Misafir_1)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-zinc-900 border-zinc-800"
                        />
                        <Button
                            variant="default"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleLogin("credentials", { username })}
                            disabled={!!isLoading || !username}
                        >
                            {isLoading === "credentials" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Giriş Yap
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-950 px-2 text-zinc-500">Geliştirici</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                        onClick={() => handleLogin("credentials", { username: "admin", role: "ADMIN" })}
                        disabled={!!isLoading}
                    >
                        {isLoading === "credentials" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mock Admin Girişi
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
