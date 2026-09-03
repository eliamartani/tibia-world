/**
 * Composable for managing SEO meta tags dynamically
 * Updates document title, description, Open Graph, and Twitter Card meta tags
 */

import { getMetadataForLocale, PRODUCTION_URL, OG_IMAGE_PATH } from '../lib/seoMetadata'

/**
 * Helper function to update or create a meta tag
 */
function updateMetaTag(
  name: string,
  content: string,
  type: 'name' | 'property' = 'name',
): void {
  const selector = type === 'property' ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let meta = document.querySelector(selector) as HTMLMetaElement | null

  if (!meta) {
    meta = document.createElement('meta')
    if (type === 'property') {
      meta.setAttribute('property', name)
    } else {
      meta.setAttribute('name', name)
    }
    document.head.appendChild(meta)
  }

  meta.content = content
}

/**
 * Update all SEO meta tags based on locale and optional custom values
 */
function updateSEOTags(locale: string, customTitle?: string, customDescription?: string): void {
  const metadata = getMetadataForLocale(locale)
  const title = customTitle || metadata.title
  const description = customDescription || metadata.description

  // Update document title
  document.title = title

  // Update or create meta description tag
  updateMetaTag('description', description)

  // Update or create Open Graph tags
  updateMetaTag('og:title', title, 'property')
  updateMetaTag('og:description', description, 'property')
  updateMetaTag('og:url', PRODUCTION_URL, 'property')
  updateMetaTag('og:image', `${PRODUCTION_URL}${OG_IMAGE_PATH}`, 'property')
  updateMetaTag('og:type', 'website', 'property')

  // Update or create Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image')
  updateMetaTag('twitter:title', title)
  updateMetaTag('twitter:description', description)
  updateMetaTag('twitter:image', `${PRODUCTION_URL}${OG_IMAGE_PATH}`)
}

export function useSEO() {
  return {
    updateSEO: updateSEOTags,
  }
}
