export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Marudhar Fashion Point",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "sameAs": [
      "https://www.facebook.com/marudharfashionpoint",
      "https://www.instagram.com/marudharfashionpoint"
    ]
  };
};

export const generateLocalBusinessSchema = (store: any) => {
  if (!store) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ShoeStore",
    "name": store.name,
    "image": store.images?.[0] || "",
    "@id": `${window.location.origin}/store-locator#${store.id}`,
    "url": `${window.location.origin}/store-locator`,
    "telephone": store.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": store.address,
      "addressLocality": store.city,
      "addressRegion": store.state,
      "postalCode": store.pincode,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": store.latitude,
      "longitude": store.longitude
    },
    "openingHoursSpecification": {
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
      "opens": "10:00",
      "closes": "21:30"
    }
  };
};

export const generateProductSchema = (product: any) => {
  if (!product) return null;
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description || product.name,
    "sku": product.sku || product.id,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Marudhar Fashion Point"
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Marudhar Fashion Point"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewsCount || 1
    } : undefined
  };
};

export const generateBreadcrumbSchema = (items: { name: string; item: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${window.location.origin}${item.item}`
    }))
  };
};

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};