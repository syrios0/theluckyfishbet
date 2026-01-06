"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2, Gamepad2, UserCircle2 } from "lucide-react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [username, setUsername] = useState("")

    const handleLogin = async (provider: string, options?: any) => {
        try {
            setIsLoading(provider)
            const destination = (options?.username === "admin") ? "/admin" : "/"
            await signIn(provider, { callbackUrl: destination, ...options })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-emerald-950/30 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center grayscale opacity-20"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=3540&auto=format&fit=crop')" }}
                />
            </div>

            {/* Login Card */}
            <Card className="relative z-20 w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border-zinc-800/50 shadow-2xl">
                <CardContent className="p-8 space-y-8">
                    {/* Header / Brand */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/20 mb-4 shadow-inner ring-1 ring-white/5">
                            <Gamepad2 className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">LF BET</h1>
                        <p className="text-zinc-400 text-sm">Los Santos'un En Güvenilir Bahis Platformu</p>
                    </div>

                    <div className="space-y-6">
                        {/* GTA World Login Button */}
                        <Button
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 border-0 transition-all duration-300 hover:scale-[1.02]"
                            onClick={() => handleLogin("gta-world")}
                            disabled={!!isLoading}
                        >
                            {isLoading === "gta-world" ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Gamepad2 className="mr-2 h-5 w-5" />
                            )}
                            GTA World Hesabı ile Giriş
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-zinc-950/80 px-2 text-zinc-500 backdrop-blur-sm">Alternatif Giriş</span>
                            </div>
                        </div>

                        {/* Guest / Manual Login */}
                        <div className="space-y-3">
                            <div className="relative group">
                                <UserCircle2 className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
                                <Input
                                    placeholder="Kullanıcı Adı"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-12 bg-black/40 border-zinc-800 text-white focus:border-green-500 focus:ring-green-500/20"
                                />
                            </div>
                            <Button
                                variant="default"
                                className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-zinc-600 transition-all font-medium"
                                onClick={() => handleLogin("credentials", { username })}
                                disabled={!!isLoading || !username}
                            >
                                {isLoading === "credentials" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Giriş Yap"}
                            </Button>
                        </div>

                        {/* Developer Mode */}
                        <div className="pt-4 mt-4 border-t border-zinc-800/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-zinc-600 hover:text-zinc-400 hover:bg-transparent"
                                onClick={() => handleLogin("credentials", { username: "admin", role: "ADMIN" })}
                                disabled={!!isLoading}
                            >
                                {isLoading === "credentials" && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                Geliştirici / Admin Modu
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="absolute bottom-6 text-center text-xs text-zinc-600 font-medium">
                © 2026 LF BET & GTA World. Tüm hakları saklıdır.
            </div>
        </div>
    )
}
