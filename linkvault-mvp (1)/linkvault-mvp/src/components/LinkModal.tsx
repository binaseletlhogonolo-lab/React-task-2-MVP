import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X, Link as LinkIcon } from 'lucide-react'
import type { LinkDraft, SavedLink } from '../types'

type Props = { initial?: SavedLink | null; onClose: () => void; onSave: (draft: LinkDraft, id?: string) => void }

export default function LinkModal({ initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function submit(event: FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) { setError('Please add a title for your link.'); return }
    let cleanUrl = url.trim()
    if (!cleanUrl) { setError('Please enter a URL.'); return }
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`
    try { new URL(cleanUrl) } catch { setError('Enter a valid website URL, such as example.com.'); return }
    const tags = [...new Set(tagsText.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean))]
    onSave({ title: cleanTitle, url: cleanUrl, description: description.trim(), tags }, initial?.id)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading">
        <div className="modal-heading-icon"><LinkIcon size={20} /></div>
        <div><h2 id="modal-title">{initial ? 'Edit saved link' : 'Save a new link'}</h2><p>Keep the useful things you find, all in one place.</p></div>
        <button className="icon-button close-modal" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
      </div>
      <form onSubmit={submit} className="link-form">
        <label>Title <span className="required">*</span><input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. React documentation" maxLength={100} /></label>
        <label>URL <span className="required">*</span><input type="text" inputMode="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" /></label>
        <label>Description <span className="optional">Optional</span><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What makes this link worth saving?" rows={3} maxLength={400} /></label>
        <label>Tags <span className="optional">Optional · comma separated</span><input value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="design, learning, inspiration" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">{initial ? 'Save changes' : 'Save link'}</button></div>
      </form>
    </section>
  </div>
}