"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createMatch } from "@/actions/match-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    teamA: z.string().min(2, {
        message: "Takım A adı en az 2 karakter olmalıdır.",
    }),
    teamB: z.string().min(2, {
        message: "Takım B adı en az 2 karakter olmalıdır.",
    }),
    teamALogo: z.string().optional(),
    teamBLogo: z.string().optional(),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Geçerli bir tarih ve saat giriniz.",
    }),
    oddsA: z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: "Geçerli bir oran giriniz (örn: 1.50)",
    }),
    oddsB: z.string().regex(/^\d+(\.\d{1,2})?$/, {
        message: "Geçerli bir oran giriniz (örn: 1.50)",
    }),
    oddsDraw: z.string().optional(),
    oddsOver: z.string().optional(),
    oddsUnder: z.string().optional(),
    oddsHomeOver: z.string().optional(),
    oddsAwayOver: z.string().optional(),
    sport: z.string(),
    overUnderLine: z.string(),
})

export function MatchForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamA: "",
            teamB: "",
            teamALogo: "",
            teamBLogo: "",
            startTime: "",
            oddsA: "1.00",
            oddsB: "1.00",
            oddsDraw: "1.00",
            oddsOver: "1.70",
            oddsUnder: "1.70",
            oddsHomeOver: "2.50",
            oddsAwayOver: "2.50",
            sport: "FOOTBALL",
            overUnderLine: "2.5",
        },
    })

    const [hasDraw, setHasDraw] = useState(true)
    const [hasOverUnder, setHasOverUnder] = useState(true)
    const [hasTeamProps, setHasTeamProps] = useState(true)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        // Clear disabled fields
        const finalValues = { ...values }
        if (!hasDraw) finalValues.oddsDraw = ""
        if (!hasOverUnder) {
            finalValues.oddsOver = ""
            finalValues.oddsUnder = ""
        }
        if (!hasTeamProps) {
            finalValues.oddsHomeOver = ""
            finalValues.oddsAwayOver = ""
        }

        try {
            const result = await createMatch({
                ...finalValues,
                startTime: new Date(values.startTime)
            })

            if (result.success) {
                form.reset()
                onSuccess?.()
                router.refresh()
            } else {
                setError(result.error || "Maç oluşturulamadı.")
            }
        } catch (error) {
            console.error(error)
            setError("Beklenmedik bir hata oluştu.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="teamA"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Ev Sahibi (Takım A)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Liverpool" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="teamB"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Deplasman (Takım B)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Manchester City" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Team Logos */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="teamALogo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400 text-xs">Ev Sahibi Logo URL (Opsiyonel)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." className="bg-zinc-900 border-zinc-800 text-white text-xs" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="teamBLogo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-400 text-xs">Deplasman Logo URL (Opsiyonel)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." className="bg-zinc-900 border-zinc-800 text-white text-xs" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>



                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sport"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Spor Türü</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="FOOTBALL">Futbol</SelectItem>
                                        <SelectItem value="BASKETBALL">Basketbol</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="overUnderLine"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Alt/Üst Limiti (Örn: 2.5 veya 210.5)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.5" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-zinc-300">Maç Saati</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="oddsA"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Oran 1</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="oddsDraw"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Oran X</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="oddsB"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">Oran 2</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" className="bg-zinc-900 border-zinc-800 text-white" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-2 border-t border-zinc-800 pt-4 mt-2">
                    <div className="flex items-center space-x-2 mb-2">
                        <Checkbox id="hasOverUnder" checked={hasOverUnder} onCheckedChange={(c) => setHasOverUnder(!!c)} />
                        <label
                            htmlFor="hasOverUnder"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                        >
                            Alt/Üst Bahisleri ({form.watch("overUnderLine") || "2.5"})
                        </label>
                    </div>

                    {hasOverUnder && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="oddsOver"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-green-400">Üst Oranı</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" className="bg-zinc-900 border-green-900/30 focus:border-green-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="oddsUnder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-red-400">Alt Oranı</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" className="bg-zinc-900 border-red-900/30 focus:border-red-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2 border-t border-zinc-800 pt-4 mt-2">
                    <div className="flex items-center space-x-2 mb-2">
                        <Checkbox id="hasTeamProps" checked={hasTeamProps} onCheckedChange={(c) => setHasTeamProps(!!c)} />
                        <label
                            htmlFor="hasTeamProps"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400"
                        >
                            Takım Alt/Üst (1.5)
                        </label>
                    </div>

                    {hasTeamProps && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="oddsHomeOver"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-blue-400">Ev Sahibi Üst</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" className="bg-zinc-900 border-blue-900/30 focus:border-blue-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="oddsAwayOver"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-blue-400">Deplasman Üst</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" className="bg-zinc-900 border-blue-900/30 focus:border-blue-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? "Oluşturuluyor..." : "Maç Oluştur"}
                </Button>
            </form>
        </Form >
    )
}
