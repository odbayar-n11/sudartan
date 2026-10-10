'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppShell from '../components/AppShell'

const css = `
.m-list{display:grid;gap:14px;margin-top:20px}
.m-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
.m-date{opacity:.6;font-size:13px;font-weight:700}
.m-q{font-weight:700;line-height:1.6;margin:0 0 14px}
.m-ans{display:grid;gap:8px;margin-bottom:12px}
.m-row{padding:10px 14px;border-radius:14px;font-weight:700;font-size:15px}
.m-row span{display:block;font-size:12px;opacity:.7;margin-bottom:2px}
.m-bad{background:rgba(239,68,68,.15);border:2px solid rgba(239,68,68,.35)}
.m-good{background:rgba(34,197,94,.15);border:2px solid rgba(34,197,94,.35)}
.m-fb{margin:0;padding:12px 14px;border-radius:14px;background:rgba(2,132,199,.12);line-height:1.6;font-size:14px;font-weight:600}
.m-del{border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;border-radius:999px;padding:5px 14px;font-weight:800;font-size:13px;cursor:pointer}
.m-del:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#ef4444}
`

export default function MistakesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) {
        setLoggedIn(false)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('mistakes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) setError(error.message)
      else setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const remove = async (id) => {
    const prev = items
    setItems(items.filter((i) => i.id !== id))
    const { error } = await supabase.from('mistakes').delete().eq('id', id)
    if (error) setItems(prev)
  }

  return (
    <AppShell userName="">
      <style>{css}</style>

      <div className="top">
        <div>
          <h1>Алдсан</h1>
          <p className="lead">
            {items.length > 0
              ? `${items.length} алдаа байна. Дахин уншаад давтаарай.`
              : 'Таны буруу хариулсан асуултууд энд харагдана'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="panel" style={{ textAlign: 'center' }}>
          Ачаалж байна...
        </div>
      )}
      {error && (
        <div className="panel" style={{ color: '#ef4444', fontWeight: 700 }}>
          {error}
        </div>
      )}
      {!loading && !loggedIn && (
        <div className="panel" style={{ textAlign: 'center' }}>
          Алдсанаа харахын тулд нэвтэрнэ үү.
        </div>
      )}
      {!loading && loggedIn && !error && items.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          🎉 Одоогоор алдаа алга. Дасгал хийж үзээрэй!
        </div>
      )}

      <div className="m-list">
        {items.map((m) => (
          <div key={m.id} className="panel">
            <div className="m-head">
              <span className="m-date">
                {new Date(m.created_at).toLocaleDateString('mn-MN')}
              </span>
              <button className="m-del" onClick={() => remove(m.id)}>
                Устгах
              </button>
            </div>
            <p className="m-q">{m.question}</p>
            <div className="m-ans">
              <div className="m-row m-bad">
                <span>Таны хариулт</span>
                {m.user_answer}
              </div>
              <div className="m-row m-good">
                <span>Зөв хариулт</span>
                {m.correct_answer}
              </div>
            </div>
            {m.explanation && <p className="m-fb">💡 {m.explanation}</p>}
          </div>
        ))}
      </div>
    </AppShell>
  )
}