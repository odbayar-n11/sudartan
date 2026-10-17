import { supabase } from '@/lib/supabase'

export async function saveMistake({
  topic,
  questionId,
  question,
  userAnswer,
  correctAnswer,
  explanation = null,
}) {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return

  const { error } = await supabase.from('mistakes').upsert(
    {
      user_id: auth.user.id,
      topic,
      question_id: String(questionId),
      question,
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      explanation,
    },
    { onConflict: 'user_id,topic,question_id' }
  )

  if (error) {
    console.error('saveMistake:', error.message, '| code:', error.code)
  }
}