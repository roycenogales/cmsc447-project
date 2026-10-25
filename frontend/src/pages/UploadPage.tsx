import { useState, type FormEvent } from 'react'
import { uploadCsv } from '../api/client'

/** Placeholder for the CSV upload form. */
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || uploading) return
    setUploading(true)
    setMessage('')
    try {
      const result = await uploadCsv(file)
      setMessage(result.detail)
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section>
      <h2>Upload CSV</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          aria-label="CSV file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </section>
  )
}
