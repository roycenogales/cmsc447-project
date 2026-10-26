
import { useRef, useState, type FormEvent } from 'react'
import { ApiError, uploadCsv } from '../api/client'

/** CSV upload page with error handling. */
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!file || uploading) return

    setUploading(true)
    setMessage('')
    setIsError(false)

    try {
      const result = await uploadCsv(file)

      setMessage(result.detail || 'CSV uploaded successfully.')
      setFile(null)

      // Clear the file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (caught: unknown) {
      setIsError(true)

      if (
        caught instanceof ApiError &&
        caught.status === 404
      ) {
        setMessage(
          'Upload endpoint not found (404). Check that POST /uploads is registered on the backend.'
        )
      } else if (
        caught instanceof ApiError &&
        caught.status === 501
      ) {
        setMessage(
          'CSV uploads are not implemented on the backend yet (501).'
        )
      } else {
        setMessage(
          caught instanceof Error
            ? caught.message
            : 'Upload failed. Please try again.'
        )
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <section>
      <h2>Upload CSV</h2>

      <form onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          aria-label="CSV file"
          disabled={uploading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            setMessage('')
            setIsError(false)
          }}
        />

        <button
          type="submit"
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && (
        <p role={isError ? 'alert' : 'status'}>
          {message}
        </p>
      )}
    </section>
  )
}
