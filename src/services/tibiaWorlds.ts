import type {
  CachedWorldPayload,
  TibiaWorld,
  TibiaWorldApiEntry,
  TibiaWorldsResponse,
  WorldLoadResult,
} from '../types/tibia'

const API_URL = 'https://api.tibiadata.com/v4/worlds'
const CACHE_KEY = 'tibia-worlds-cache-v2'

let inMemoryCache: CachedWorldPayload | null = null
let inFlightRequest: Promise<WorldLoadResult> | null = null

const clonePayload = (payload: CachedWorldPayload): CachedWorldPayload => ({
  fetchedAt: payload.fetchedAt,
  worlds: payload.worlds.map((world) => ({ ...world })),
})

const normalizeWorld = (world: TibiaWorldApiEntry): TibiaWorld => ({
  name: world.name,
  status: world.status,
  playersOnline: world.players_online,
  region: world.location,
  pvpType: world.pvp_type,
  premiumOnly: world.premium_only,
  transferType: world.transfer_type,
  battleyeProtected: world.battleye_protected,
  battleyeDate: world.battleye_date,
  gameWorldType: world.game_world_type,
  tournamentWorldType: world.tournament_world_type,
  // Worlds with BattleEye protection since launch are marked with `battleye_date: "release"`.
  initiallyProtected: world.battleye_date.toLowerCase() === 'release',
})

const readCache = (): CachedWorldPayload | null => {
  if (inMemoryCache) {
    return clonePayload(inMemoryCache)
  }

  if (globalThis.window === undefined) {
    return null
  }

  try {
    const rawPayload = globalThis.window.localStorage.getItem(CACHE_KEY)

    if (!rawPayload) {
      return null
    }

    const parsedPayload = JSON.parse(rawPayload) as CachedWorldPayload

    if (!Array.isArray(parsedPayload.worlds) || typeof parsedPayload.fetchedAt !== 'string') {
      return null
    }

    inMemoryCache = clonePayload(parsedPayload)
    return clonePayload(parsedPayload)
  } catch {
    return null
  }
}

const writeCache = (payload: CachedWorldPayload) => {
  inMemoryCache = clonePayload(payload)

  if (globalThis.window === undefined) {
    return
  }

  globalThis.window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
}

const fetchWorlds = async (): Promise<WorldLoadResult> => {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error(`TibiaData request failed with status ${response.status}.`)
  }

  const data = (await response.json()) as TibiaWorldsResponse
  const worlds = data.worlds.regular_worlds
    .map(normalizeWorld)
    .sort((left, right) => left.name.localeCompare(right.name))

  const payload: CachedWorldPayload = {
    worlds,
    fetchedAt: new Date().toISOString(),
  }

  writeCache(payload)

  return {
    ...clonePayload(payload),
    source: 'network',
  }
}

export const loadWorlds = async ({ force = false }: { force?: boolean } = {}) => {
  if (!force) {
    const cachedPayload = readCache()

    if (cachedPayload) {
      return {
        ...cachedPayload,
        source: 'cache',
      } satisfies WorldLoadResult
    }

    if (inFlightRequest !== null) {
      return inFlightRequest
    }
  }

  const request = fetchWorlds().finally(() => {
    if (inFlightRequest === request) {
      inFlightRequest = null
    }
  })

  inFlightRequest = request
  return request
}

export const clearWorldCache = () => {
  inMemoryCache = null
  inFlightRequest = null

  if (globalThis.window !== undefined) {
    globalThis.window.localStorage.removeItem(CACHE_KEY)
  }
}
