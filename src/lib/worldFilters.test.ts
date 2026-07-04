import { describe, expect, it } from 'vitest'

import {
  applyWorldFilters,
  collectFilterOptions,
  defaultWorldFilters,
  sortWorlds,
} from './worldFilters'

import type { TibiaWorld } from '../types/tibia'

const sampleWorlds: TibiaWorld[] = [
  {
    name: 'Antica',
    status: 'online',
    playersOnline: 1100,
    region: 'Europe',
    pvpType: 'Open PvP',
    premiumOnly: false,
    transferType: 'regular',
    battleyeProtected: true,
    battleyeDate: '2017-08-29',
    gameWorldType: 'regular',
    tournamentWorldType: '',
    initiallyProtected: true,
  },
  {
    name: 'Astera',
    status: 'online',
    playersOnline: 550,
    region: 'North America',
    pvpType: 'Optional PvP',
    premiumOnly: false,
    transferType: 'regular',
    battleyeProtected: true,
    battleyeDate: '2017-09-12',
    gameWorldType: 'regular',
    tournamentWorldType: '',
    initiallyProtected: true,
  },
  {
    name: 'Zuna',
    status: 'online',
    playersOnline: 95,
    region: 'South America',
    pvpType: 'Hardcore PvP',
    premiumOnly: false,
    transferType: 'blocked',
    battleyeProtected: false,
    battleyeDate: '',
    gameWorldType: 'tournament',
    tournamentWorldType: '',
    initiallyProtected: false,
  },
]

describe('worldFilters', () => {
  it('returns every world when no filters are active', () => {
    expect(applyWorldFilters(sampleWorlds, defaultWorldFilters())).toEqual(sampleWorlds)
  })

  it('applies PvP, region, and protection filters together', () => {
    const result = applyWorldFilters(sampleWorlds, {
      selectedPvpModes: ['Open PvP', 'Optional PvP'],
      selectedRegions: ['Europe'],
      onlyInitiallyProtected: true,
    })

    expect(result.map((world) => world.name)).toEqual(['Antica'])
  })

  it('builds sorted unique options for the sidebar', () => {
    expect(collectFilterOptions(sampleWorlds)).toEqual({
      pvpModes: ['Hardcore PvP', 'Open PvP', 'Optional PvP'],
      regions: ['Europe', 'North America', 'South America'],
    })
  })

  it('sorts worlds by name in both directions', () => {
    expect(sortWorlds(sampleWorlds, 'name-asc').map((world) => world.name)).toEqual([
      'Antica',
      'Astera',
      'Zuna',
    ])

    expect(sortWorlds(sampleWorlds, 'name-desc').map((world) => world.name)).toEqual([
      'Zuna',
      'Astera',
      'Antica',
    ])
  })

  it('sorts worlds by online players in both directions', () => {
    expect(sortWorlds(sampleWorlds, 'players-desc').map((world) => world.name)).toEqual([
      'Antica',
      'Astera',
      'Zuna',
    ])

    expect(sortWorlds(sampleWorlds, 'players-asc').map((world) => world.name)).toEqual([
      'Zuna',
      'Astera',
      'Antica',
    ])
  })
})
