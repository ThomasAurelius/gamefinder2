import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thegatheringcall.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/', '/messages/', '/profile/', '/subscriptions/', '/library/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
