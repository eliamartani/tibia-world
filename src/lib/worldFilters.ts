import type { TibiaWorld, WorldFilters, WorldSortOption } from '../types/tibia'

export const defaultWorldFilters = (): WorldFilters => ({
  selectedPvpModes: [],
  selectedRegions: [],
  onlyInitiallyProtected: false,
})

export const applyWorldFilters = (
  worlds: TibiaWorld[],
  filters: WorldFilters,
): TibiaWorld[] =>
  worlds.filter((world) => {
    const matchesPvpMode =
      filters.selectedPvpModes.length === 0 ||
      filters.selectedPvpModes.includes(world.pvpType)

    const matchesRegion =
      filters.selectedRegions.length === 0 ||
      filters.selectedRegions.includes(world.region)

    const matchesInitialProtection =
      !filters.onlyInitiallyProtected || world.initiallyProtected

    return matchesPvpMode && matchesRegion && matchesInitialProtection
  })

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
  filters.onlyInitiallyProtected

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
