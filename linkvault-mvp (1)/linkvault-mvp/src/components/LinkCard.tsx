import { useState } from 'react'
import { ArrowUpRight, Copy, Edit2, ExternalLink, Heart, MoreHorizontal, Trash2, Globe } from 'lucide-react'
import type { SavedLink } from '../types'

type Props = {
  link: SavedLink
  onEdit: (link: SavedLink) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onNotify: (message: string) => void
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

export default function LinkCard({ link, onEdit, onDelete, onToggleFavorite, onNotify }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(getDomain(link.url))}&sz=64`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link.url)
      onNotify('Link copied to clipboard')
    } catch { onNotify('Copy is unavailable in this browser') }
    setMenuOpen(false)
  }

  return (
    <article className="link-card">
      <div className="card-top">
        <div className="site-icon"><img src={favicon} alt="" onError={(e) => { e.currentTarget.style.display = 'none' }} /><Globe size={19} /></div>
        <div className="site-domain">{getDomain(link.url)}</div>
        <button className={`icon-button favorite-button ${link.favorite ? 'is-favorite' : ''}`} aria-label={link.favorite ? 'Remove from favorites' : 'Add to favorites'} onClick={() => onToggleFavorite(link.id)}><Heart size={17} fill={link.favorite ? 'currentColor' : 'none'} /></button>
        <div className="menu-wrap">
          <button className="icon-button" aria-label="More actions" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={19} /></button>
          {menuOpen && <div className="action-menu">
            <button onClick={() => { onEdit(link); setMenuOpen(false) }}><Edit2 size={15} /> Edit link</button>
            <button onClick={copyLink}><Copy size={15} /> Copy URL</button>
            <button className="danger-text" onClick={() => { onDelete(link.id); setMenuOpen(false) }}><Trash2 size={15} /> Delete</button>
          </div>}
        </div>
      </div>
      <a className="link-title" href={link.url} target="_blank" rel="noreferrer">{link.title}<ArrowUpRight size={16} /></a>
      <p className={`link-description ${!link.description ? 'muted-description' : ''}`}>{link.description || 'No description added yet.'}</p>
      <div className="card-bottom">
        <div className="tag-list">{link.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
        <a className="open-link" href={link.url} target="_blank" rel="noreferrer" aria-label={`Open ${link.title}`}><ExternalLink size={15} /></a>
      </div>
    </article>
  )
}