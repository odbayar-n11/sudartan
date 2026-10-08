'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
 
export default function CorrectionsPage() {
  const [corrections, setCorrections] = useState([])
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    async function fetchCorrections() {
      const { data, error } = await supabase
        .from('word_corrections')
        .select('*')
 
      if (error) {
        console.error('Error fetching word corrections:', error)
      } else {
        setCorrections(data)
      }
      setLoading(false)
    }
 
    fetchCorrections()
  }, [])
 
  if (loading) return <div className="p-8 text-white">Loading word corrections...</div>
 
  return (
<div className="p-8 max-w-5xl mx-auto text-white">
<h1 className="text-3xl font-bold mb-6">Word Corrections</h1>
<div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-gray-700 text-gray-300">
<th className="p-3 border-b border-gray-600">ID</th>
<th className="p-3 border-b border-gray-600">Wrong Version</th>
<th className="p-3 border-b border-gray-600">Correct Version</th>
<th className="p-3 border-b border-gray-600">Meaning</th>
</tr>
</thead>
<tbody>
            {corrections.map((item) => (
<tr key={item.id} className="hover:bg-gray-700/50">
<td className="p-3 border-b border-gray-700">{item.id}</td>
<td className="p-3 border-b border-gray-700 text-red-400 font-medium">{item.wrong_version}</td>
<td className="p-3 border-b border-gray-700 text-green-400 font-medium">{item.correct_version}</td>
<td className="p-3 border-b border-gray-700 text-gray-300">{item.meaning}</td>
</tr>
            ))}
</tbody>
</table>
</div>
</div>
  )
}