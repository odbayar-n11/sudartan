import WordGame from './WordGame'

// Server page: reads ?level= from the address and hands it to the client game.
// (Reading it here avoids useSearchParams + Suspense, which delayed the game from starting.)
export default async function Page({ searchParams }) {
  const { level } = await searchParams
  return <WordGame levelParam={level ?? null} />
}
