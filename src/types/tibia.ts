export interface TibiaWorldApiEntry {
  name: string
  status: string
  players_online: number
  location: string
  pvp_type: string
  premium_only: boolean
  transfer_type: string
  battleye_protected: boolean
  battleye_date: string
  game_world_type: string
  tournament_world_type: string
}

export interface TibiaWorldsResponse {
  worlds: {
    players_online: number
    record_players: number
    record_date: string
    regular_worlds: TibiaWorldApiEntry[]
  }
}

export interface TibiaWorld {
  name: string
  status: string
  playersOnline: number
  region: string
  pvpType: string
  premiumOnly: boolean
  transferType: string
  battleyeProtected: boolean
  battleyeDate: string
  gameWorldType: string
  tournamentWorldType: string
  initiallyProtected: boolean
}

export interface WorldFilters {
  selectedPvpModes: string[]
  selectedRegions: string[]
  onlyInitiallyProtected: boolean
}

export type WorldSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'players-desc'
  | 'players-asc'

export interface CachedWorldPayload {
  worlds: TibiaWorld[]
  fetchedAt: string
}

export interface WorldLoadResult extends CachedWorldPayload {
  source: 'cache' | 'network'
}
