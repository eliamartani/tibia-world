/**
 * SEO metadata for all supported locales
 * Used by the useSEO composable to dynamically update meta tags
 */

export interface SEOMetadata {
  title: string
  description: string
  keywords: string
}

export const seoMetadata: Record<string, SEOMetadata> = {
  en: {
    title: 'Tibia Worlds Tracker - Real-time Server Status & Player Counts',
    description:
      'Explore Tibia worlds in real-time. Find servers by region, PvP mode, and player count. Track BattleEye protection status and world transfers instantly.',
    keywords:
      'Tibia worlds, Tibia servers, Tibia tracker, world browser, Open PvP, Hardcore PvP, BattleEye, Tibia PvP, server status, player count',
  },
  de: {
    title: 'Tibia-Welten-Tracker - Echtzeit-Serverstatus & Spielerzahlen',
    description:
      'Erkunde Tibia-Welten in Echtzeit. Finde Server nach Region, PvP-Modus und Spieleranzahl. Verfolge den BattleEye-Schutzstatus und Weltübertragungen sofort.',
    keywords:
      'Tibia Welten, Tibia Server, Tibia Tracker, Welt-Browser, Open PvP, Hardcore PvP, BattleEye, Tibia PvP, Serverstatus, Spieleranzahl',
  },
  es: {
    title: 'Rastreador de Mundos de Tibia - Estado del Servidor en Tiempo Real y Conteo de Jugadores',
    description:
      'Explora mundos de Tibia en tiempo real. Encuentra servidores por región, modo PvP y cantidad de jugadores. Rastrea el estado de protección de BattleEye y las transferencias de mundos al instante.',
    keywords:
      'Mundos de Tibia, Servidores de Tibia, Rastreador de Tibia, Explorador de mundos, Open PvP, Hardcore PvP, BattleEye, PvP de Tibia, Estado del servidor, Conteo de jugadores',
  },
  pt: {
    title: 'Rastreador de Mundos de Tibia - Status do Servidor em Tempo Real e Contagem de Jogadores',
    description:
      'Explore mundos de Tibia em tempo real. Encontre servidores por região, modo PvP e quantidade de jogadores. Rastreie o status de proteção do BattleEye e transferências de mundos instantaneamente.',
    keywords:
      'Mundos de Tibia, Servidores de Tibia, Rastreador de Tibia, Navegador de mundos, Open PvP, Hardcore PvP, BattleEye, PvP de Tibia, Status do servidor, Contagem de jogadores',
  },
  pl: {
    title: 'Tracker Światów Tibia - Stan Serwerów w Czasie Rzeczywistym i Liczba Graczy',
    description:
      'Eksploruj światy Tibia w czasie rzeczywistym. Znajdź serwery według regionu, trybu PvP i liczby graczy. Śledź status ochrony BattleEye i transfery światów natychmiast.',
    keywords:
      'Światy Tibia, Serwery Tibia, Tracker Tibia, Przeglądarka światów, Open PvP, Hardcore PvP, BattleEye, PvP Tibia, Stan serwera, Liczba graczy',
  },
}

export const PRODUCTION_URL = 'https://www.tibiaworld.app'
export const OG_IMAGE_PATH = '/og-image.png'

/**
 * Get SEO metadata for a specific locale, with fallback to English
 */
export function getMetadataForLocale(locale: string): SEOMetadata {
  return seoMetadata[locale] || seoMetadata['en']
}
