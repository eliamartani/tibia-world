import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearWorldCache, loadWorlds } from './tibiaWorlds'

const worldResponse = {
  worlds: {
    players_online: 1500,
    record_players: 65000,
    record_date: '2007-11-28T18:26:00Z',
    regular_worlds: [
      {
        name: 'Belobra',
        status: 'online',
        players_online: 537,
        location: 'South America',
        pvp_type: 'Optional PvP',
        premium_only: false,
        transfer_type: 'regular',
        battleye_protected: true,
        battleye_date: '2017-06-22',
        game_world_type: 'regular',
        tournament_world_type: '',
      },
      {
        name: 'Blumera',
        status: 'online',
        players_online: 295,
        location: 'North America',
        pvp_type: 'Optional PvP',
        premium_only: false,
        transfer_type: 'regular',
        battleye_protected: true,
        battleye_date: 'release',
        game_world_type: 'regular',
        tournament_world_type: '',
      },
      {
        name: 'Antica',
        status: 'online',
        players_online: 1150,
        location: 'Europe',
        pvp_type: 'Open PvP',
        premium_only: false,
        transfer_type: 'regular',
        battleye_protected: true,
        battleye_date: '2017-08-29',
        game_world_type: 'regular',
        tournament_world_type: '',
      },
    ],
  },
}

describe('loadWorlds', () => {
  const createWorldsResponse = () => new Response(JSON.stringify(worldResponse), { status: 200 })

  beforeEach(() => {
    clearWorldCache()
    globalThis.window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('caches the first successful response and reuses it without another fetch', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => createWorldsResponse())

    const firstResult = await loadWorlds()
    const secondResult = await loadWorlds()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(firstResult.source).toBe('network')
    expect(secondResult.source).toBe('cache')
    expect(secondResult.worlds.map((world) => world.name)).toEqual(['Antica', 'Belobra', 'Blumera'])
  })

  it('marks only release-protected worlds as initially protected', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => createWorldsResponse())

    const result = await loadWorlds()

    expect(result.worlds.find((world) => world.name === 'Blumera')?.initiallyProtected).toBe(true)
    expect(result.worlds.find((world) => world.name === 'Antica')?.initiallyProtected).toBe(false)
    expect(result.worlds.find((world) => world.name === 'Belobra')?.initiallyProtected).toBe(false)
  })

  it('fetches again when reload is forced', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => createWorldsResponse())

    await loadWorlds()
    const refreshed = await loadWorlds({ force: true })

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(refreshed.source).toBe('network')
  })
})
