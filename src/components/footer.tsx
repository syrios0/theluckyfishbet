export function Footer() {
    return (
        <footer className="w-full py-6 bg-zinc-950 border-t border-white/5 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                    ⚠️ <strong>YASAL UYARI:</strong> Bu web sitesi, <strong>Grand Theft Auto V</strong> tabanlı <strong>GTA World Roleplay</strong> sunucusu için hazırlanmış, tamamen <strong>kurgusal (IC)</strong> bir bahis platformudur.
                    <br className="my-2" />
                    Sitede kullanılan bakiyelerin, oranların ve kazançların <strong>gerçek dünyada hiçbir maddi değeri veya karşılığı yoktur.</strong>
                    <br />
                    Bu platform sadece oyun içi eğlence ve rol yapma (Roleplay) amaçlıdır.
                </p>
                <div className="mt-4 text-xs text-zinc-600">
                    &copy; {new Date().getFullYear()} The Lucky Fish - GTA World. Tüm hakları saklıdır (IC).
                </div>
            </div>
        </footer>
    )
}
