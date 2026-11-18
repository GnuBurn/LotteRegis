'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Icon } from './icons'
import { labelClass } from './ui'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Cover image picker with a preview. Sends "image" (the file) and, when editing,
// "removeImage" to clear the current image.
export default function ImageField({ currentUrl }: { currentUrl?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function choose(file: File | undefined) {
    if (preview) URL.revokeObjectURL(preview)
    setError(null)
    if (file && file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 5 MB or smaller.')
      if (inputRef.current) inputRef.current.value = ''
      setPreview(null)
      return
    }
    setPreview(file ? URL.createObjectURL(file) : null)
    if (file) setRemoved(false)
  }

  function clearPick() {
    choose(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  const shown = preview ?? (removed ? null : currentUrl)

  return (
    <div className={labelClass}>
      <span>Cover image <span className="font-normal text-muted">(optional)</span></span>

      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-canvas">
        {shown ? (
          // Object URLs can't go through the image optimizer
          <Image src={shown} alt="Cover image preview" fill sizes="(min-width: 768px) 700px, 100vw" className="object-cover" unoptimized={!!preview} />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm font-normal text-muted">
            <Icon name="ticket" className="h-8 w-8" />
            No image. Cards show the default illustration.
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-normal">
        <input ref={inputRef} type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => choose(e.target.files?.[0])}
          className="text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-medium file:text-primary hover:file:bg-primary-soft/70" />
        {preview && (
          <button type="button" onClick={clearPick} className="text-sm font-medium text-muted hover:text-ink">
            {currentUrl ? 'Keep current image' : 'Remove'}
          </button>
        )}
        {currentUrl && !preview && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name="removeImage" checked={removed} onChange={(e) => setRemoved(e.target.checked)} className="h-4 w-4 accent-primary" />
            Remove current image
          </label>
        )}
      </div>
      <span className="text-xs font-normal text-muted">JPEG, PNG, WebP or GIF, up to 5 MB. A wide image (about 16:9) works best.</span>
      {error && <span role="alert" className="text-sm font-normal text-danger">{error}</span>}
    </div>
  )
}
