'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AppShell from '../components/AppShell'

const css = `
.s-list{display:grid;gap:14px;margin-top:20px}
.s-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px}
.s-title{font-size:18px;font-weight:800;line-height:1.35;margin:0}
.s-desc{margin:0;line-height:1.65;opacity:.85}
.s-del{flex-shrink:0;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;border-radius:999px;padding:5px 14px;font-weight:800;font-size:13px;cursor:pointer}
.s-del:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#ef4444}
`

export default function SavedPage() {
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
        .from('saved_items')
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
    const { error } = await supabase.from('saved_items').delete().eq('id', id)
    if (error) setItems(prev)
  }

  return (
    <AppShell userName="">
      <style>{css}</style>

      <div className="top">
        <div>
          <h1>Хадгалсан</h1>
          <p className="lead">
            {items.length > 0
              ? `${items.length} хадгалсан зүйл`
              : 'Хадгалсан дүрмүүд энд харагдана'}
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
          Хадгалсанаа харахын тулд нэвтэрнэ үү.
        </div>
      )}
      {!loading && loggedIn && !error && items.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          🔖 Хоосон байна. Дүрэм дээрх 🔖 товчийг дарж хадгална уу.
        </div>
      )}

      <div className="s-list">
        {items.map((s) => (
          <div key={s.id} className="panel">
            <div className="s-head">
              <p className="s-title">{s.title}</p>
              <button className="s-del" onClick={() => remove(s.id)}>
                Хасах
              </button>
            </div>
            <p className="s-desc">{s.content}</p>
          </div>
        ))}
      </div>
    </AppShell>
  )
}