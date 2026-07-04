<script setup lang="ts">
import { computed } from 'vue'
import serverGreenMarker from '../assets/green-world.gif'
import worldGlobe from '../assets/world.png'
import serverYellowMarker from '../assets/yellow-world.gif'

import type { TibiaWorld } from '../types/tibia'

const props = defineProps<{
  world: TibiaWorld
}>()

const formattedPlayers = computed(() => props.world.playersOnline.toLocaleString())
const serverColor = computed(() => (props.world.initiallyProtected ? 'Green' : 'Yellow'))
const serverMarker = computed(() =>
  props.world.initiallyProtected ? serverGreenMarker : serverYellowMarker,
)
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(4,12,28,0.45)] ring-1 ring-cyan-400/10 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:ring-cyan-300/20"
  >
    <div
      class="pointer-events-none absolute inset-x-8 top-3 h-24 rounded-full bg-cyan-300/8 blur-3xl transition duration-300 group-hover:bg-cyan-300/12"
    />

    <div class="relative flex flex-col gap-5">
      <div class="relative mx-auto flex w-full max-w-[18rem] justify-center">
        <div
          class="world-orbit pointer-events-none absolute inset-0 m-auto h-60 w-60 rounded-full border border-cyan-200/10"
        />
        <div
          class="world-globe relative flex h-60 w-60 items-center justify-center rounded-full border border-white/10 shadow-[inset_0_-24px_55px_rgba(0,0,0,0.45),0_18px_32px_rgba(0,0,0,0.35)]"
        >
          <img
            :src="worldGlobe"
            alt=""
            class="absolute inset-0 h-full w-full rounded-full object-cover image-render-pixel opacity-70"
          />
          <div class="absolute inset-0 rounded-full bg-slate-950/25" />
          <div class="absolute inset-0 rounded-full shadow-[inset_0_-18px_35px_rgba(0,0,0,0.45)]" />

          <div class="relative z-10 px-6 text-center">
            <p class="text-xl font-black uppercase tracking-[0.24em] text-white drop-shadow-lg">
              {{ world.name }}
            </p>
            <p class="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-white drop-shadow-md">
              {{ world.region }} • {{ world.pvpType }}
            </p>
            <div class="mt-4 flex justify-center">
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.28em] ring-1 bg-white/30 text-emerald-200 ring-emerald-300/50"
              >
                <img
                  :src="serverMarker"
                  :alt="`${serverColor} server marker`"
                  class="h-5 w-auto image-render-pixel"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-white/8 bg-white/5 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Players Online
        </p>
        <div class="mt-2 flex items-end justify-between gap-4">
          <p class="text-3xl font-black text-white">
            {{ formattedPlayers }}
          </p>
          <span
            class="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
            Live
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
