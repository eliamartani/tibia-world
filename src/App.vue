<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import WorldCard from './components/WorldCard.vue'
import {
  applyWorldFilters,
  collectFilterOptions,
  defaultWorldFilters,
  hasActiveFilters,
  sortWorlds,
} from './lib/worldFilters'
import { loadWorlds } from './services/tibiaWorlds'
import type { TibiaWorld, WorldSortOption } from './types/tibia'

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const worlds = ref<TibiaWorld[]>([])
const errorMessage = ref('')
const initialLoadPending = ref(true)
const reloadPending = ref(false)
const lastFetchedAt = ref('')
const lastLoadSource = ref<'cache' | 'network' | ''>('')
const sortOption = ref<WorldSortOption>('name-asc')

const filters = reactive(defaultWorldFilters())

const filterOptions = computed(() => collectFilterOptions(worlds.value))
const filteredWorlds = computed(() => applyWorldFilters(worlds.value, filters))
const visibleWorlds = computed(() => sortWorlds(filteredWorlds.value, sortOption.value))
const totalOnlinePlayers = computed(() =>
  visibleWorlds.value.reduce((total, world) => total + world.playersOnline, 0),
)
const activeFilterCount = computed(
  () =>
    filters.selectedPvpModes.length +
    filters.selectedRegions.length +
    Number(filters.onlyInitiallyProtected),
)
const formattedLastFetchedAt = computed(() =>
  lastFetchedAt.value ? timestampFormatter.format(new Date(lastFetchedAt.value)) : 'Not loaded yet',
)
const emptyStateCopy = computed(() =>
  worlds.value.length === 0
    ? 'No Tibia world data is available yet. Try reloading to fetch the latest server list.'
    : 'No worlds match the active filters. Clear one or more filters to widen the results.',
)
const sortLabel = computed(() => {
  switch (sortOption.value) {
    case 'name-desc':
      return 'Name Z-A'
    case 'players-desc':
      return 'Players High-Low'
    case 'players-asc':
      return 'Players Low-High'
    case 'name-asc':
    default:
      return 'Name A-Z'
  }
})

const syncWorlds = async (force = false) => {
  errorMessage.value = ''

  if (force) {
    reloadPending.value = true
  } else {
    initialLoadPending.value = true
  }

  try {
    const result = await loadWorlds({ force })

    worlds.value = result.worlds
    lastFetchedAt.value = result.fetchedAt
    lastLoadSource.value = result.source
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'

    errorMessage.value =
      worlds.value.length > 0
        ? `${message} Showing the most recently cached worlds.`
        : `${message} Check your connection and try again.`
  } finally {
    initialLoadPending.value = false
    reloadPending.value = false
  }
}

const togglePvpMode = (pvpMode: string) => {
  if (filters.selectedPvpModes.includes(pvpMode)) {
    filters.selectedPvpModes = filters.selectedPvpModes.filter((item) => item !== pvpMode)
    return
  }

  filters.selectedPvpModes = [...filters.selectedPvpModes, pvpMode]
}

const toggleRegion = (region: string) => {
  if (filters.selectedRegions.includes(region)) {
    filters.selectedRegions = filters.selectedRegions.filter((item) => item !== region)
    return
  }

  filters.selectedRegions = [...filters.selectedRegions, region]
}

const clearPvpModes = () => {
  filters.selectedPvpModes = []
}

const clearRegions = () => {
  filters.selectedRegions = []
}

const clearAllFilters = () => {
  Object.assign(filters, defaultWorldFilters())
}

onMounted(() => {
  void syncWorlds()
})
</script>

<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top,#1f4461_0%,#0f1b2e_28%,#060b14_62%,#02040a_100%)] text-slate-100 lg:h-screen lg:overflow-hidden"
  >
    <div class="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:h-screen lg:flex-row">
      <aside
        class="border-b border-white/10 bg-slate-950/75 backdrop-blur lg:h-screen lg:w-[22rem] lg:flex-shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r"
      >
        <div class="flex h-full flex-col gap-6 p-5 sm:p-6">
          <div class="space-y-4">
            <div class="inline-flex items-center rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
              Tibia World
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Players Online
              </p>
              <p class="mt-2 text-3xl font-black text-white">
                {{ totalOnlinePlayers.toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  Actions
                </h2>
                <p class="mt-1 text-sm text-slate-300">
                  Refresh only when you want newer data.
                </p>
              </div>
              <button
                class="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="reloadPending"
                @click="syncWorlds(true)"
              >
                {{ reloadPending ? 'Reloading...' : 'Reload' }}
              </button>
            </div>

            <div class="rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              <p>
                Last updated:
                <span class="font-semibold text-white">{{ formattedLastFetchedAt }}</span>
              </p>
              <p class="mt-1">
                Active filters:
                <span class="font-semibold text-white">{{ activeFilterCount }}</span>
              </p>
            </div>

            <button
              v-if="hasActiveFilters(filters)"
              class="w-full rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              @click="clearAllFilters"
            >
              Clear All Filters
            </button>
          </div>

          <section class="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  Sort Worlds
                </h2>
                <p class="mt-1 text-sm text-slate-300">Order by name or players online.</p>
              </div>
            </div>

            <label class="block">
              <span class="sr-only">Sort worlds</span>
              <select
                v-model="sortOption"
                class="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/45"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="players-desc">Players High-Low</option>
                <option value="players-asc">Players Low-High</option>
              </select>
            </label>
          </section>

          <section class="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  PvP Mode
                </h2>
                <p class="mt-1 text-sm text-slate-300">Multi-select any combination.</p>
              </div>
              <button
                class="text-sm font-semibold text-cyan-100 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="filters.selectedPvpModes.length === 0"
                @click="clearPvpModes"
              >
                Clear
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="pvpMode in filterOptions.pvpModes"
                :key="pvpMode"
                class="rounded-full border px-3 py-2 text-sm font-semibold transition"
                :class="
                  filters.selectedPvpModes.includes(pvpMode)
                    ? 'border-cyan-200/60 bg-cyan-300/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/10'
                "
                :aria-pressed="filters.selectedPvpModes.includes(pvpMode)"
                @click="togglePvpMode(pvpMode)"
              >
                {{ pvpMode }}
              </button>
            </div>
          </section>

          <section class="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  Initially Protected
                </h2>
                <p class="mt-1 text-sm text-slate-300">Toggle to show only protected worlds.</p>
              </div>
              <button
                class="text-sm font-semibold text-cyan-100 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="!filters.onlyInitiallyProtected"
                @click="filters.onlyInitiallyProtected = false"
              >
                Clear
              </button>
            </div>

            <button
              class="flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-3 text-left transition"
              :class="
                filters.onlyInitiallyProtected
                  ? 'border-cyan-200/60 bg-cyan-300/18 text-white'
                  : 'border-white/10 bg-slate-950/45 text-slate-200 hover:border-white/20 hover:bg-white/[0.06]'
              "
              :aria-pressed="filters.onlyInitiallyProtected"
              @click="filters.onlyInitiallyProtected = !filters.onlyInitiallyProtected"
            >
              <span>
                <span class="block text-sm font-semibold">Only show protected worlds</span>
              </span>
              <span
                class="relative inline-flex h-7 w-[3.25rem] rounded-full transition"
                :class="filters.onlyInitiallyProtected ? 'bg-cyan-300/60' : 'bg-white/[0.12]'"
              >
                <span
                  class="absolute top-1 h-5 w-5 rounded-full bg-white transition"
                  :class="filters.onlyInitiallyProtected ? 'left-7' : 'left-1'"
                />
              </span>
            </button>
          </section>

          <section class="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  Region
                </h2>
                <p class="mt-1 text-sm text-slate-300">Select one or multiple regions.</p>
              </div>
              <button
                class="text-sm font-semibold text-cyan-100 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="filters.selectedRegions.length === 0"
                @click="clearRegions"
              >
                Clear
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="region in filterOptions.regions"
                :key="region"
                class="rounded-full border px-3 py-2 text-sm font-semibold transition"
                :class="
                  filters.selectedRegions.includes(region)
                    ? 'border-cyan-200/60 bg-cyan-300/20 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/10'
                "
                :aria-pressed="filters.selectedRegions.includes(region)"
                @click="toggleRegion(region)"
              >
                {{ region }}
              </button>
            </div>
          </section>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto flex min-h-full max-w-7xl flex-col gap-6 p-5 sm:p-6 lg:p-8">
          <header class="space-y-4">
            <div class="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  Real-time World Snapshot
                </p>
                <h2 class="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {{ visibleWorlds.length }} worlds ready to explore
                </h2>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  The grid updates instantly on every filter change while keeping the original
                  world dataset cached locally until you explicitly reload. Current sort:
                  <span class="font-semibold text-white">{{ sortLabel }}</span>
                </p>
              </div>

              <div class="rounded-3xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                <p>
                  Worlds in cache:
                  <span class="font-semibold text-white">{{ worlds.length }}</span>
                </p>
                <p class="mt-1">
                  Current source:
                  <span class="font-semibold capitalize text-white">{{ lastLoadSource || 'pending' }}</span>
                </p>
              </div>
            </div>

            <div
              v-if="errorMessage"
              class="rounded-[1.5rem] border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm text-rose-100"
            >
              {{ errorMessage }}
            </div>
          </header>

          <section v-if="initialLoadPending" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <div
              v-for="index in 8"
              :key="index"
              class="h-[24rem] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.06]"
            />
          </section>

          <section
            v-else-if="visibleWorlds.length === 0"
            class="flex min-h-[24rem] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-white/15 bg-white/[0.04] px-6 text-center"
          >
            <div class="max-w-xl">
              <p class="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100">
                Empty State
              </p>
              <h3 class="mt-4 text-3xl font-black tracking-tight text-white">
                Nothing matches right now
              </h3>
              <p class="mt-4 text-sm leading-7 text-slate-300">
                {{ emptyStateCopy }}
              </p>
              <button
                v-if="hasActiveFilters(filters)"
                class="mt-6 rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                @click="clearAllFilters"
              >
                Clear Filters
              </button>
            </div>
          </section>

          <TransitionGroup
            v-else
            name="worlds"
            tag="section"
            class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            <WorldCard
              v-for="world in visibleWorlds"
              :key="world.name"
              :world="world"
            />
          </TransitionGroup>
        </div>
      </main>
    </div>
  </div>
</template>
