import { useState, type FormEvent } from 'react'
import { uploadCsv } from '../api/client'

/** Placeholder for the CSV upload form. */
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    try {
      const result = await uploadCsv(file)
      setMessage(result.detail)
    } catch (error) {
      setMessage((error as Error).message)
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
        <button type="submit" disabled={!file}>
          Upload
        </button>
      </form>
      {message && <p>{message}</p>}
    </section>
  )
}
