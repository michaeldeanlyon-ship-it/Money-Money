import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useJobs(enabled = true) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchJobs = useCallback(async () => {
    if (!enabled) return
    try {
      const { data, error } = await supabase.from('jobs').select('*').order('name')
      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const addJob = async ({ name, label, runtimeMinutes }) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert({ name, label, runtime_minutes: runtimeMinutes })
      .select()
      .single()
    if (error) throw error
    setJobs(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const updateJob = async (id, { name, label, runtimeMinutes }) => {
    const { data, error } = await supabase
      .from('jobs')
      .update({ name, label, runtime_minutes: runtimeMinutes })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setJobs(prev =>
      prev.map(j => j.id === id ? data : j).sort((a, b) => a.name.localeCompare(b.name))
    )
    return data
  }

  const deleteJob = async (id) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) throw error
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  return { jobs, loading, error, addJob, updateJob, deleteJob, refetch: fetchJobs }
}
