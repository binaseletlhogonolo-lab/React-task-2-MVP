export type SavedLink = {
  id: string
  title: string
  url: string
  description: string
  tags: string[]
  createdAt: string
  favorite: boolean
}

export type LinkDraft = Pick<SavedLink, 'title' | 'url' | 'description' | 'tags'>