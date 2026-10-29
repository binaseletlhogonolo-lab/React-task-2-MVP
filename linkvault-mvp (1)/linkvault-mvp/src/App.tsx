import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Bookmark, Search, Plus, LayoutGrid, Heart, Tags, Link2, Sparkles, X, Check, Download, Upload, Menu } from 'lucide-react'
import LinkCard from './components/LinkCard'
import LinkModal from './components/LinkModal'
import type { LinkDraft, SavedLink } from './types'

const STORAGE_KEY = 'linkvault.links.v1'
const starterLinks: SavedLink[] = [
  { id: 'demo-1', title: 'The ultimate guide to CSS Grid', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', description: 'A comprehensive visual guide to building flexible layouts with CSS Grid.', tags: ['design', 'development'], createdAt: '2026-10-20T10:00:00.000Z', favorite: true },
  { id: 'demo-2', title: 'Unsplash — Beautiful free images', url: 'https://unsplash.com', description: 'Find high-quality, free photos for your next creative project.', tags: ['design', 'inspiration'], createdAt: '2026-10-19T10:00:00.000Z', favorite: false },
  { id: 'demo-3', title: 'React documentation', url: 'https://react.dev', description: 'Learn React from the official docs, from first component to advanced patterns.', tags: ['development', 'learning'], createdAt: '2026-10-18T10:00:00.000Z', favorite: true },
  { id: 'demo-4', title: 'Figma Community', url: 'https://www.figma.com/community', description: 'Explore design files, UI kits, plugins, and resources made by the community.', tags: ['design', 'tools'], createdAt: '2026-10-17T10:00:00.000Z', favorite: false },
  { id: 'demo-5', title: 'Notion templates', url: 'https://www.notion.com/templates', description: 'Ready-made templates to organize your notes, projects, and everyday workflow.', tags: ['productivity', 'tools'], createdAt: '2026-10-16T10:00:00.000Z', favorite: false },
  { id: 'demo-6', title: 'JavaScript.info', url: 'https://javascript.info', description: 'A modern tutorial covering JavaScript from the basics to advanced topics.', tags: ['learning', 'development'], createdAt: '2026-10-15T10:00:00.000Z', favorite: false },
]

type Filter = 'all' | 'favorites'
function readStoredLinks(): SavedLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starterLinks))
      return starterLinks
    }
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as SavedLink[] : []
  } catch { return starterLinks }
}

export default function App() {
  const [links, setLinks] = useState<SavedLink[]>(readStoredLinks)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [activeTag, setActiveTag] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SavedLink | null>(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(links)) } catch { setToast('Could not save changes to local storage') } }, [links])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer) }, [toast])

  const allTags = useMemo(() => [...new Set(links.flatMap(link => link.tags))].sort((a,b) => a.localeCompare(b)), [links])
  const visibleLinks = useMemo(() => links.filter(link => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [link.title, link.url, link.description, ...link.tags].some(value => value.toLowerCase().includes(query))
    return matchesSearch && (filter === 'all' || link.favorite) && (!activeTag || link.tags.includes(activeTag))
  }).sort((a,b) => b.createdAt.localeCompare(a.createdAt)), [links, search, filter, activeTag])

  function saveLink(draft: LinkDraft, id?: string) {
    if (id) {
      setLinks(prev => prev.map(link => link.id === id ? { ...link, ...draft } : link))
      setToast('Your link has been updated')
    } else {
      const next: SavedLink = { ...draft, id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString(), favorite: false }
      setLinks(prev => [next, ...prev])
      setToast('Link saved to your collection')
    }
    setModalOpen(false); setEditing(null)
  }
  function deleteLink(id: string) {
    const target = links.find(link => link.id === id)
    if (!target || !window.confirm(`Delete "${target.title}" from your collection?`)) return
    setLinks(prev => prev.filter(link => link.id !== id))
    setToast('Link deleted')
  }
  function toggleFavorite(id: string) {
    setLinks(prev => prev.map(link => link.id === id ? { ...link, favorite: !link.favorite } : link))
    setToast('Favorite updated')
  }
  function openAdd() { setEditing(null); setModalOpen(true); setSidebarOpen(false) }
  function openEdit(link: SavedLink) { setEditing(link); setModalOpen(true) }

  function exportLinks() {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = 'linkvault-backup.json'; a.click(); URL.revokeObjectURL(url)
    setToast('Backup exported')
  }
  function importLinks(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(String(reader.result))
        if (!Array.isArray(data) || !data.every(x => x && typeof x.title === 'string' && typeof x.url === 'string' && Array.isArray(x.tags))) throw new Error()
        const imported = (data as SavedLink[]).map(x => ({ ...x, id: `${Date.now()}-${Math.random()}-${x.id}`, favorite: Boolean(x.favorite), description: x.description ?? '', tags: x.tags.filter(t => typeof t === 'string') }))
        setLinks(prev => [...imported, ...prev]); setToast(`${imported.length} links imported`)
      } catch { setToast('That backup file is not valid LinkVault JSON') }
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setFilter('all'); setActiveTag(''); setSearch('') }}><span className="brand-mark"><Bookmark size={21} fill="currentColor" /></span><span>link<span className="brand-light">vault</span><small>YOUR SPACE ON THE WEB</small></span></a>
      <button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
      <div className="sidebar-label">LIBRARY</div>
      <nav className="main-nav">
        <button className={`nav-item ${filter === 'all' && !activeTag ? 'active' : ''}`} onClick={() => { setFilter('all'); setActiveTag(''); setSidebarOpen(false) }}><LayoutGrid size={18} /><span>All links</span><span className="nav-count">{links.length}</span></button>
        <button className={`nav-item ${filter === 'favorites' ? 'active' : ''}`} onClick={() => { setFilter('favorites'); setActiveTag(''); setSidebarOpen(false) }}><Heart size={18} /><span>Favorites</span><span className="nav-count">{links.filter(l => l.favorite).length}</span></button>
      </nav>
      <div className="sidebar-label tags-label"><Tags size={14} /> YOUR TAGS</div>
      <div className="sidebar-tags">
        {allTags.length ? allTags.map(tag => <button key={tag} className={`sidebar-tag ${activeTag === tag ? 'tag-active' : ''}`} onClick={() => { setActiveTag(activeTag === tag ? '' : tag); setFilter('all'); setSidebarOpen(false) }}><span className="tag-dot" />{tag}<span className="tag-count">{links.filter(l => l.tags.includes(tag)).length}</span></button>) : <p className="empty-tags">Tags you add will appear here.</p>}
      </div>
      <div className="sidebar-bottom">
        <div className="storage-card"><div className="storage-icon"><Sparkles size={17} /></div><strong>Your links, your space.</strong><p>Saved privately in this browser. Always within reach on this device.</p><div className="storage-meter"><span style={{ width: `${Math.min(links.length / 100 * 100, 100)}%` }} /></div><small>{links.length} {links.length === 1 ? 'link' : 'links'} saved</small></div>
        <div className="backup-actions"><button onClick={exportLinks}><Download size={15} /> Export backup</button><label className="import-button"><Upload size={15} /> Import backup<input type="file" accept=".json,application/json" onChange={importLinks} /></label></div>
        <div className="sidebar-foot"><span className="status-dot" /> Local storage active</div>
      </div>
    </aside>
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{activeTag ? `#${activeTag}` : filter === 'favorites' ? 'Favorites' : 'All links'}</strong></div><div className="topbar-right"><span className="privacy-pill"><span className="status-dot" /> Private collection</span><button className="button button-primary top-add" onClick={openAdd}><Plus size={17} /> Add a link</button></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL CORNER OF THE INTERNET</div><h1>{filter === 'favorites' ? 'Your favorites.' : activeTag ? `#${activeTag}` : 'Keep the good stuff.'}</h1><p className="page-subtitle">{filter === 'favorites' ? 'The links you love most, all in one place.' : activeTag ? `Every saved link tagged with ${activeTag}.` : 'A home for the links you want to find again.'}</p></div><div className="welcome-illustration" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="illustration-card"><Bookmark size={29} fill="currentColor" /><span /></div><div className="sparkle sparkle-one">✦</div><div className="sparkle sparkle-two">✧</div></div></section>
        <section className="stats-row" aria-label="Collection overview"><div className="stat-card"><div className="stat-icon stat-purple"><Link2 size={18} /></div><div><span>Total links</span><strong>{links.length}</strong></div></div><div className="stat-card"><div className="stat-icon stat-peach"><Heart size={18} /></div><div><span>Favorites</span><strong>{links.filter(l => l.favorite).length}</strong></div></div><div className="stat-card"><div className="stat-icon stat-blue"><Tags size={18} /></div><div><span>Unique tags</span><strong>{allTags.length}</strong></div></div></section>
        <section className="collection-section">
          <div className="collection-heading"><div><h2>Your collection <span className="result-count">{visibleLinks.length}</span></h2><p>All the little things worth coming back to.</p></div><div className="view-controls"><label className="search-box"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search links, tags..." aria-label="Search by title, URL, description or tags" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}<kbd>⌘ K</kbd></label></div></div>
          {(search || activeTag || filter === 'favorites') && <div className="active-filters"><span>Showing {visibleLinks.length} {visibleLinks.length === 1 ? 'result' : 'results'}</span>{search && <button onClick={() => setSearch('')}>“{search}” <X size={13} /></button>}{activeTag && <button onClick={() => setActiveTag('')}>#{activeTag} <X size={13} /></button>}{filter === 'favorites' && <button onClick={() => setFilter('all')}>Favorites <X size={13} /></button>}</div>}
          {visibleLinks.length ? <div className="link-grid">{visibleLinks.map(link => <LinkCard key={link.id} link={link} onEdit={openEdit} onDelete={deleteLink} onToggleFavorite={toggleFavorite} onNotify={setToast} />)}</div> : <div className="empty-state"><div className="empty-state-icon"><Search size={24} /></div><h3>{links.length === 0 ? 'Your collection starts here' : 'No links found'}</h3><p>{links.length === 0 ? 'Save your first favorite website and keep it close.' : 'Try another search or clear your filters to see more links.'}</p>{links.length === 0 ? <button className="button button-primary" onClick={openAdd}><Plus size={17} /> Save your first link</button> : <button className="button button-secondary" onClick={() => { setSearch(''); setActiveTag(''); setFilter('all') }}>Clear filters</button>}</div>}
        </section>
        <footer className="page-footer"><span>Made for your curious mind <span className="footer-heart">♥</span></span><span><span className="status-dot" /> Your data stays in this browser</span></footer>
      </div>
    </main>
    {modalOpen && <LinkModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null) }} onSave={saveLink} />}
    {toast && <div className="toast" role="status"><span className="toast-check"><Check size={15} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}
  </div>
}