// src/lib/quizBuilders.js
// Builds a mixed Duolingo-style round: 1 matching board + choice + typing questions.

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Traditional Mongolian script glyphs cannot be typed on a normal keyboard
const MONGOL_SCRIPT = /[\u1800-\u18AF]/

/**
 * rows:      the items this round is made from
 * pool:      where wrong options come from (defaults to rows)
 * promptOf:  row -> text shown to the learner
 * answerOf:  row -> correct text
 * idOf:      row -> unique id (used when saving mistakes)
 * total:     questions in the round (default 10)
 * matchPairs:pairs on the matching board (default 5)
 * allowType: allow "type the answer" questions
 * explainOf: row -> optional explanation shown after a wrong answer
 */
export function buildMixedRound({
  rows,
  pool = rows,
  promptOf,
  answerOf,
  idOf,
  total = 10,
  matchPairs = 5,
  allowType = true,
  matchLabel = 'Хосыг холбо',
  explainOf,
}) {
  const shuffled = shuffle(rows)

  // pairs must have unique prompt and unique answer text
  const seenP = new Set()
  const seenA = new Set()
  const pairRows = shuffled
    .filter((r) => {
      const p = String(promptOf(r))
      const a = String(answerOf(r))
      if (seenP.has(p) || seenA.has(a)) return false
      seenP.add(p)
      seenA.add(a)
      return true
    })
    .slice(0, matchPairs)

  const questions = []
  if (pairRows.length >= 3) {
    questions.push({
      id: `match-${idOf(pairRows[0])}`,
      type: 'match',
      prompt: matchLabel,
      pairs: pairRows.map((r) => ({ left: String(promptOf(r)), right: String(answerOf(r)) })),
    })
  }

  const need = Math.max(0, total - questions.length)
  const rest = shuffled.filter((r) => !pairRows.includes(r))
  const singles = (rest.length >= need ? rest : shuffled).slice(0, need)

  singles.forEach((r, i) => {
    const prompt = String(promptOf(r))
    const answer = String(answerOf(r))
    const explanation = explainOf ? explainOf(r) : undefined
    const typeable = allowType && answer.length <= 24 && !MONGOL_SCRIPT.test(answer)

    if (typeable && i % 3 === 2) {
      questions.push({ id: `${idOf(r)}-t`, type: 'type', prompt, answer, explanation })
      return
    }

    const wrong = [
      ...new Set(
        shuffle(pool)
          .map((x) => String(answerOf(x)))
          .filter((v) => v !== answer)
      ),
    ].slice(0, 3)

    questions.push({
      id: idOf(r),
      type: 'choice',
      prompt,
      answer,
      options: shuffle([answer, ...wrong]),
      explanation,
    })
  })

  return questions
}