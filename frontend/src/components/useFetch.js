import { useCallback, useEffect, useState } from 'react'
import client from '../api/client'

export default function useFetch(url, params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const key = JSON.stringify(params || {})

  const load = useCallback(async () => {
    if (!url) return
    setLoading(true)
    try {
      const response = await client.get(url, { params: JSON.parse(key) })
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [url, key])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load, setData }
}
