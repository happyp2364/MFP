import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getPlatformConfig } from '../../lib/platformConfig';

export const SEOSchemaInjector: React.FC = () => {
  const { seoConfig } = useStore();

  useEffect(() => {
    const platform = getPlatformConfig();
    // Generate JSON-LD Schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "ShoeStore", // Specific type of LocalBusiness
      "name": seoConfig.businessName || platform.platformDisplayName,
      "image": [
        seoConfig.defaultOgImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
      ],
      "@id": window.location.origin,
      "url": window.location.origin,
      "telephone": seoConfig.contactNumber || "+919782482250",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": seoConfig.businessAddress || "Pipar City",
        "addressLocality": "Pipar City",
        "addressRegion": "RJ",
        "postalCode": "342601",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": seoConfig.latitude || "26.3862",
        "longitude": seoConfig.longitude || "73.5414"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "09:00",
          "closes": "21:00"
        }
      ],
      "sameAs": [
        seoConfig.gbpUrl
      ].filter(Boolean)
    };

    // Remove old schema if exists
    const existingScript = document.getElementById('seo-local-business-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Inject new schema
    const script = document.createElement('script');
    script.id = 'seo-local-business-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [seoConfig]);

  return null;
};
