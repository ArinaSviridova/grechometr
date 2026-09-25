export type AvatarKind = 'boy' | 'girl'
export type CategoryId =
  | 'pride'
  | 'envy'
  | 'greed'
  | 'wrath'
  | 'lust'
  | 'gluttony'
  | 'sloth'
  | 'lie'
  | 'betrayal'
  | 'other'

export type ViewId = 'home' | 'hell' | 'prayers' | 'history' | 'settings'

export interface Category {
  id: CategoryId
  title: string
  icon: string
  circle: number
  circleTitle: string
  description: string
}

export interface SinDefinition {
  id: string
  title: string
  category: CategoryId
  severity: number
  redemption: string
  isCustom: boolean
  createdAt: string
}

export interface SinEntry {
  id: string
  sinId: string
  sinTitle: string
  category: CategoryId
  severity: number
  intensity: number
  multiplier: number
  points: number
  createdAt: string
  redeemedAt?: string
}

export interface AppSettings {
  id: 'settings'
  avatar: AvatarKind
  onboardingDone: boolean
  installHintDismissed: boolean
  originCollapsed: boolean
  hellRewardSeen: boolean
  createdAt: string
}

export interface Prayer {
  id: string
  category: CategoryId | 'general'
  title: string
  text: string
  note: string
}

export interface ImportPayload {
  version: number
  exportedAt: string
  settings: AppSettings
  sins: SinDefinition[]
  entries: SinEntry[]
}
