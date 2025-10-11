import Script from 'next/script'

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Gathering Call',
    description: 'Find and host board game nights, D&D, Pathfinder, Shadowdark and TTRPG sessions. Schedule tabletop gaming sessions, connect with players, and manage your campaigns.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'}/find?game={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Midnight Oil Software',
      url: 'https://midnightoil.software'
    }
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Gathering Call',
    description: 'Platform for finding and hosting board games, D&D, Pathfinder, Shadowdark, and TTRPG sessions',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'}/newlogo.png`,
    sameAs: []
  }

  return (
    <>
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  )
}
