"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleLogin = async (provider: string, options?: any) => {
        try {
            setIsLoading(provider)
            await signIn(provider, { callbackUrl: "/admin", ...options })
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
                            <span className="bg-zinc-950 px-2 text-zinc-500">Geliştirici Modu</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                        onClick={() => handleLogin("credentials", { username: "admin", role: "ADMIN" })}
                        disabled={!!isLoading}
                    >
                        {isLoading === "credentials" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mock Admin Girişi (Test)
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
