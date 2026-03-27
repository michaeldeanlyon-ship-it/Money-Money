import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEntries(fromDate, toDate) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!fromDate || !toDate) return
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('created_at')
    if (!error) setEntries(data || [])
    setLoading(false)
  }, [fromDate, toDate])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const addEntry = async (entry) => {
    const { data, error } = await supabase
      .from('entries')
      .insert({
        date: entry.date,
        type: entry.type,
        job_id: entry.jobId || null,
        job_name: entry.jobName || null,
        job_label: entry.jobLabel || null,
        paid_time_category: entry.paidTimeCategory || null,
        paid_time_name: entry.paidTimeName || null,
        minutes: entry.minutes,
      })
      .select()
      .single()
    if (error) throw error
    setEntries(prev => [...prev, data])
    return data
  }

  const updateEntry = async (id, entry) => {
    const { data, error } = await supabase
      .from('entries')
      .update({
        date: entry.date,
        type: entry.type,
        job_id: entry.jobId || null,
        job_name: entry.jobName || null,
        job_label: entry.jobLabel || null,
        paid_time_category: entry.paidTimeCategory || null,
        paid_time_name: entry.paidTimeName || null,
        minutes: entry.minutes,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setEntries(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  const deleteEntry = async (id) => {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) throw error
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry, refetch: fetchEntries }
}
