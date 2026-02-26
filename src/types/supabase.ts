export interface Profile {
  id: string
  name: string
  username: string
  bio: string
  location: string
  services: string[]
  profile_image: string | null
  resume_url: string | null
  impressions: number
  collaborations: number
  updated_at: string
}

export interface Post {
  id: string
  title: string
  description: string
  cover_image: string | null
  category: string
  project_link: string | null
  created_at: string
}

export interface Highlight {
  id: string
  title: string
  cover_image: string | null
  link: string | null
  created_at: string
}

export interface ExploreLink {
  id: string
  title: string
  icon_image: string | null
  link: string
  created_at: string
}

export interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}
