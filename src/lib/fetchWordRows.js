// Reads every row of the public word_corrections table (correct spelling + meaning) for the word games.
// Uses Supabase's REST endpoint directly with the public key, since the words need no login.

const PAGE = 1000

export async function fetchWordRows() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let rows = []
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(
      `${base}/rest/v1/word_corrections?select=correct_version,meaning&order=id.asc&offset=${from}&limit=${PAGE}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' }
    )
    if (!res.ok) throw new Error(`Үг ачаалж чадсангүй (${res.status})`)
    const data = await res.json()
    rows = rows.concat(data)
    if (data.length < PAGE) break
  }
  return rows
}
