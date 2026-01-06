import { getCompletedMatches } from "@/actions/match-actions"
import { ResultsList } from "@/components/results-list"

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams
    const dateParam = params.date ? new Date(params.date) : undefined
    const matches = await getCompletedMatches(dateParam)

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                    Maç Sonuçları
                </h1>
                <ResultsList matches={matches} />
            </div>
        </div>
    )
}
