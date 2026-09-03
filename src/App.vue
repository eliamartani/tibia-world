<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import WorldCard from './components/WorldCard.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import { useSEO } from './composables/useSEO'
import {
  applyWorldFilters,
  collectFilterOptions,
  defaultWorldFilters,
  hasActiveFilters,
  sortWorlds,
} from './lib/worldFilters'
import { loadWorlds } from './services/tibiaWorlds'
import type { TibiaWorld, WorldSortOption } from './types/tibia'
import logo from './assets/logo.png'
import greenWorld from './assets/green-world.gif'
import yellowWorld from './assets/yellow-world.gif'

const { t, locale } = useI18n()
const { updateSEO } = useSEO()

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
    Number(filters.protectionFilter !== 'all'),
)
const formattedLastFetchedAt = computed(() =>
  lastFetchedAt.value ? timestampFormatter.format(new Date(lastFetchedAt.value)) : t('pending'),
)
const emptyStateCopy = computed(() =>
  worlds.value.length === 0
    ? t('emptyStateNoData')
    : t('emptyStateFilters'),
)
const sortLabel = computed(() => {
  switch (sortOption.value) {
    case 'name-desc':
      return t('nameZA')
    case 'players-desc':
      return t('playersHighLow')
    case 'players-asc':
      return t('playersLowHigh')
    case 'name-asc':
    default:
      return t('nameAZ')
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

const setProtectionFilter = (value: 'all' | 'protected' | 'unprotected') => {
  filters.protectionFilter = value
}

onMounted(() => {
  // Initialize SEO with current locale
  updateSEO(locale.value)
  // Load worlds data
  void syncWorlds()
})

// Watch for locale changes and update SEO meta tags
watch(locale, (newLocale) => {
  updateSEO(newLocale)
})
</script>

<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top,#1f4461_0%,#0f1b2e_28%,#060b14_62%,#02040a_100%)] text-slate-100 lg:h-screen lg:overflow-hidden"
  >
    <LanguageSelector />
    <div class="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:h-screen lg:flex-row">
      <aside
        class="border-b border-white/10 bg-black backdrop-blur lg:h-screen lg:w-88 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r"
      >
        <div class="flex h-full flex-col gap-6 p-5 sm:p-6">
          <div class="space-y-4">
          <img
            :src="logo"
            alt="Tibia World"
            class=""
          />
          </div>

          <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {{ t('playersOnline') }}
              </p>
              <p class="mt-2 text-3xl font-black text-white">
                {{ totalOnlinePlayers.toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="space-y-4 rounded-4xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  {{ t('actions') }}
                </h2>
                <p class="mt-1 text-sm text-slate-300">
                  {{ t('refreshDescription') }}
                </p>
              </div>
              <button
                class="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="reloadPending"
                @click="syncWorlds(true)"
              >
                {{ reloadPending ? t('reloading') : t('reload') }}
              </button>
            </div>

            <div class="rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              <p>
                {{ t('lastUpdated') }}
                <span class="font-semibold text-white">{{ formattedLastFetchedAt }}</span>
              </p>
              <p class="mt-1">
                {{ t('activeFilters') }}
                <span class="font-semibold text-white">{{ activeFilterCount }}</span>
              </p>
            </div>

            <button
              v-if="hasActiveFilters(filters)"
              class="w-full rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              @click="clearAllFilters"
            >
              {{ t('clearAllFilters') }}
            </button>
          </div>

          <section class="space-y-4 rounded-4xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  {{ t('sortWorlds') }}
                </h2>
                <p class="mt-1 text-sm text-slate-300">{{ t('sortDescription') }}</p>
              </div>
            </div>

            <label class="block">
              <span class="sr-only">{{ t('sortWorlds') }}</span>
              <select
                v-model="sortOption"
                class="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/45"
              >
                <option value="name-asc">{{ t('nameAZ') }}</option>
                <option value="name-desc">{{ t('nameZA') }}</option>
                <option value="players-desc">{{ t('playersHighLow') }}</option>
                <option value="players-asc">{{ t('playersLowHigh') }}</option>
              </select>
            </label>
          </section>

          <section class="space-y-4 rounded-4xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  {{ t('pvpMode') }}
                </h2>
                <p class="mt-1 text-sm text-slate-300">{{ t('pvpDescription') }}</p>
              </div>
              <button
                class="text-sm font-semibold text-cyan-100 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="filters.selectedPvpModes.length === 0"
                @click="clearPvpModes"
              >
                {{ t('clear') }}
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

          <section class="space-y-4 rounded-4xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  {{ t('initiallyProtected') }}
                </h2>
                <p class="mt-1 text-sm text-slate-300">{{ t('protectedDescription') }}</p>
              </div>
              <button
                class="text-sm font-semibold text-cyan-100 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="filters.protectionFilter === 'all'"
                @click="setProtectionFilter('all')"
              >
                {{ t('clear') }}
              </button>
            </div>

            <div class="flex gap-2">
              <button
                class="flex-1 rounded-2xl border-2 p-3 transition"
                :class="
                  filters.protectionFilter === 'protected'
                    ? 'border-cyan-200/60 bg-cyan-300/20'
                    : 'border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-white/6'
                "
                :aria-pressed="filters.protectionFilter === 'protected'"
                @click="setProtectionFilter('protected')"
                :title="t('showProtected')"
              >
                <img :src="greenWorld" alt="Protected" class="h-7 w-full object-contain" />
                <span class="mt-2 block text-xs font-semibold text-white">{{ t('protected') }}</span>
              </button>
              <button
                class="flex-1 rounded-2xl border-2 p-3 transition"
                :class="
                  filters.protectionFilter === 'unprotected'
                    ? 'border-cyan-200/60 bg-cyan-300/20'
                    : 'border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-white/6'
                "
                :aria-pressed="filters.protectionFilter === 'unprotected'"
                @click="setProtectionFilter('unprotected')"
                :title="t('showUnprotected')"
              >
                <img :src="yellowWorld" alt="Unprotected" class="h-7 w-full object-contain" />
                <span class="mt-2 block text-xs font-semibold text-white">{{ t('unprotected') }}</span>
              </button>
            </div>
          </section>

          <section class="space-y-4 rounded-4xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-white">
                  {{ t('region') }}
                </h2>
                <p class="mt-1 text-sm text-slate-300">{{ t('regionDescription') }}</p>
              </div>
              <button
                class="text-sm font-semibold text-cyan-100 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="filters.selectedRegions.length === 0"
                @click="clearRegions"
              >
                {{ t('clear') }}
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
            <div class="flex flex-col gap-4 rounded-4xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100">
                  {{ t('realTimeSnapshot') }}
                </p>
                <h2 class="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {{ t('worldsReadyToExplore', { count: visibleWorlds.length }) }}
                </h2>
                <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  {{ t('gridDescription') }}
                  <span class="font-semibold text-white">{{ sortLabel }}</span>
                </p>
              </div>

              <div class="rounded-3xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                <p>
                  {{ t('currentSource') }}
                  <span class="font-semibold capitalize text-white">{{ lastLoadSource || t('pending') }}</span>
                </p>
              </div>
            </div>

            <div
              v-if="errorMessage"
              class="rounded-3xl border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm text-rose-100"
            >
              {{ errorMessage }}
            </div>
          </header>

          <section v-if="initialLoadPending" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <div
              v-for="index in 8"
              :key="index"
              class="h-96 animate-pulse rounded-4xl border border-white/10 bg-white/6"
            />
          </section>

          <section
            v-else-if="visibleWorlds.length === 0"
            class="flex min-h-96 flex-col items-center justify-center rounded-4xl border border-dashed border-white/15 bg-white/5 px-6 text-center"
          >
            <div class="max-w-xl">
              <p class="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100">
                Empty State
              </p>
              <h3 class="mt-4 text-3xl font-black tracking-tight text-white">
                {{ t('emptyStateTitle') }}
              </h3>
              <p class="mt-4 text-sm leading-7 text-slate-300">
                {{ emptyStateCopy }}
              </p>
              <button
                v-if="hasActiveFilters(filters)"
                class="mt-6 rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                @click="clearAllFilters"
              >
                {{ t('clearFilters') }}
              </button>
            </div>
          </section>

          <div
            name="worlds"
            tag="section"
            class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            <WorldCard
              v-for="world in visibleWorlds"
              :key="world.name"
              :world="world"
            />
          </div>
        </div>

        <footer class="border-t border-white/10 bg-black/40 backdrop-blur px-5 py-6 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
          <p>&copy; 2026 Tibia World. All rights reserved.</p>
        </footer>
      </main>
    </div>
  </div>
</template>
