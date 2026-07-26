<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'pl', label: 'Polski' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
]

const changeLanguage = (code: string) => {
  locale.value = code as 'en' | 'pt' | 'pl' | 'es'
  localStorage.setItem('language', code)
}
</script>

<template>
  <div class="fixed right-6 top-6 z-50">
    <label for="language-select" class="sr-only">Select language</label>
    <select
      id="language-select"
      :value="locale"
      @change="changeLanguage(($event.target as HTMLSelectElement).value)"
      class="rounded-lg border border-cyan-300/30 bg-cyan-300/15 px-3 py-2 text-sm font-semibold text-cyan-50 outline-none transition hover:border-cyan-200/50 hover:bg-cyan-300/25 focus:border-cyan-200/50 focus:bg-cyan-300/25 cursor-pointer"
    >
      <option
        v-for="lang in languages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.label }}
      </option>
    </select>
  </div>
</template>
