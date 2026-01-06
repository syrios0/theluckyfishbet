"use client"

import { useEffect, useState } from "react"
import { Megaphone } from "lucide-react"

export function LiveTicker() {
    const [offset, setOffset] = useState(0)

    // Simple animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setOffset((prev) => (prev > 1000 ? -1000 : prev + 1))
        }, 50)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full bg-zinc-950/80 border-y border-zinc-800 backdrop-blur-sm overflow-hidden py-2 relative">
            <div className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-zinc-950 to-transparent w-20 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-zinc-950 to-transparent w-20 pointer-events-none" />

            <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
                {/* Repeat content to create seamless loop illusion */}
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center text-green-500 font-bold"><Megaphone className="w-3 h-3 mr-1" /> CANLI:</span>
                        <span>Los Santos Panic vs Liberty City Penetrators (21:00)</span>
                        <span className="text-zinc-700">|</span>
                        <span className="text-blue-400">🔥 Yüksek Oranlar</span>
                        <span className="text-zinc-700">|</span>
                        <span>İlk Yatırıma %10 Bonus!</span>
                        <span className="text-zinc-700">|</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
        </div>
    )
}
