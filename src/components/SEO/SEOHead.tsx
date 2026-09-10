import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../../context/StoreContext';

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

  const finalTitle = title || seoConfig?.globalTitleTemplate?.replace('%s', 'Home') || 'Marudhar Fashion Point - Premium Footwear';
  const finalDescription = description || seoConfig?.globalDescription || 'Discover the finest collection of premium footwear at Marudhar Fashion Point. Shop latest trends in men, women, and kids shoes.';
  const finalImage = image || seoConfig?.defaultOgImage || '/logo.png';
  
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteName = 'Marudhar Fashion Point';
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

  // Safely inject Google Analytics without triggering React script rendering warning
  useEffect(() => {
    if (!seoConfig?.googleAnalyticsId) return;
    const gaId = seoConfig.googleAnalyticsId;

    let script1 = document.getElementById('ga-gtag-js') as HTMLScriptElement;
    if (!script1) {
      script1 = document.createElement('script');
      script1.id = 'ga-gtag-js';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);
    }

    let script2 = document.getElementById('ga-gtag-inline') as HTMLScriptElement;
    if (!script2) {
      script2 = document.createElement('script');
      script2.id = 'ga-gtag-inline';
      script2.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
    }
  }, [seoConfig?.googleAnalyticsId]);

  // Safely inject JSON-LD schemas into document.head
  useEffect(() => {
    if (!finalSchemas.length) return;
    const scriptId = 'json-ld-schemas';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.text = JSON.stringify(finalSchemas.length === 1 ? finalSchemas[0] : finalSchemas);
  }, [JSON.stringify(finalSchemas)]);

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
    </Helmet>
  );
};
