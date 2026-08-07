import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../context/StoreContext';
import { getPlatformConfig } from '../../lib/platformConfig';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schemas?: any[];
  canonicalUrl?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  schemas = [],
  canonicalUrl,
}) => {
  const { seoConfig } = useStore();
  const platform = getPlatformConfig();

  const finalTitle = title || seoConfig?.globalTitleTemplate?.replace('%s', 'Home') || `${platform.platformDisplayName} - Premium Store`;
  const finalDescription = description || seoConfig?.globalDescription || `Discover the finest collection of products at ${platform.platformDisplayName}. Shop latest trends online with fast delivery.`;
  const finalImage = image || seoConfig?.defaultOgImage || '/logo.png';
  
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteName = platform.platformDisplayName;
  const fullTitle = finalTitle.includes(siteName) ? finalTitle : `${finalTitle} | ${siteName}`;
  const finalCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');

  // Default organization schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": typeof window !== 'undefined' ? window.location.origin : '',
    "logo": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
  };

  const finalSchemas = [defaultSchema, ...schemas];

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Google Search Console */}
      {seoConfig?.googleSearchConsoleVerification && (
        <meta name="google-site-verification" content={seoConfig.googleSearchConsoleVerification} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      {finalImage && <meta property="og:image" content={finalImage} />}
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {finalImage && <meta name="twitter:image" content={finalImage} />}

      {/* Structured Data / JSON-LD */}
      {finalSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Google Analytics - In a real app we'd load gtag.js here via script tags, but since Helmet executes in <head>, we can inject the script string. */}
      {seoConfig?.googleAnalyticsId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${seoConfig.googleAnalyticsId}`}></script>
      )}
      {seoConfig?.googleAnalyticsId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${seoConfig.googleAnalyticsId}');
          `}
        </script>
      )}
    </Helmet>
  );
};
