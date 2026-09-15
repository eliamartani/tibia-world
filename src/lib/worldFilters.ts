import type { TibiaWorld, WorldFilters, WorldSortOption } from '../types/tibia'

// strips diacritics so e.g. "sao" matches "São"
export const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export const defaultWorldFilters = (): WorldFilters => ({
  selectedPvpModes: [],
  selectedRegions: [],
  protectionFilter: 'all',
  searchQuery: '',
})

export const applyWorldFilters = (
  worlds: TibiaWorld[],
  filters: WorldFilters,
): TibiaWorld[] => {
  const normalizedQuery = normalizeSearchText(filters.searchQuery.trim())

  return worlds.filter((world) => {
    const matchesPvpMode =
      filters.selectedPvpModes.length === 0 ||
      filters.selectedPvpModes.includes(world.pvpType)

    const matchesRegion =
      filters.selectedRegions.length === 0 ||
      filters.selectedRegions.includes(world.region)

    const matchesInitialProtection =
      filters.protectionFilter === 'all' ||
      (filters.protectionFilter === 'protected' && world.initiallyProtected) ||
      (filters.protectionFilter === 'unprotected' && !world.initiallyProtected)

    const matchesSearch =
      normalizedQuery.length === 0 ||
      normalizeSearchText(world.name).includes(normalizedQuery) ||
      normalizeSearchText(world.region).includes(normalizedQuery)

    return matchesPvpMode && matchesRegion && matchesInitialProtection && matchesSearch
  })
}

export const collectFilterOptions = (worlds: TibiaWorld[]) => ({
  pvpModes: [...new Set(worlds.map((world) => world.pvpType))].sort((left, right) =>
    left.localeCompare(right),
  ),
  regions: [...new Set(worlds.map((world) => world.region))].sort((left, right) =>
    left.localeCompare(right),
  ),
})

export const hasActiveFilters = (filters: WorldFilters) =>
  filters.selectedPvpModes.length > 0 ||
  filters.selectedRegions.length > 0 ||
  filters.protectionFilter !== 'all' ||
  filters.searchQuery.trim().length > 0

export const sortWorlds = (worlds: TibiaWorld[], sortOption: WorldSortOption): TibiaWorld[] => {
  const sortedWorlds = [...worlds]

  sortedWorlds.sort((left, right) => {
    switch (sortOption) {
      case 'name-desc':
        return right.name.localeCompare(left.name)
      case 'players-desc':
        return right.playersOnline - left.playersOnline || left.name.localeCompare(right.name)
      case 'players-asc':
        return left.playersOnline - right.playersOnline || left.name.localeCompare(right.name)
      case 'name-asc':
      default:
        return left.name.localeCompare(right.name)
    }
  })

  return sortedWorlds
}
