export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawId = (req.query.id || req.query.productId || '').toString();
    const cleanId = rawId.replace(/^\/+api\/+product-image\/+/, '').split('?')[0].trim();

    if (!cleanId) {
      return res.status(404).send('Product ID is required');
    }

    // 1. Try querying Firestore REST API directly
    const firestoreDbUrl = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0934233443/databases/ai-studio-marudharfashionp-84582cae-673f-469e-bad0-503eef199989/documents/products';
    const candidateDocIds = Array.from(new Set([
      cleanId,
      cleanId.toLowerCase(),
      cleanId.toUpperCase()
    ]));

    let foundImage: string | null = null;

    for (const docId of candidateDocIds) {
      try {
        const fsRes = await fetch(`${firestoreDbUrl}/${encodeURIComponent(docId)}`);
        if (fsRes.ok) {
          const docData = await fsRes.json();
          const fields = docData.fields || {};
          
          // Check images array
          const imagesValues = fields.images?.arrayValue?.values || [];
          if (imagesValues.length > 0) {
            const firstImg = imagesValues[0]?.stringValue;
            if (firstImg && typeof firstImg === 'string' && firstImg.trim()) {
              foundImage = firstImg.trim();
              break;
            }
          }

          // Check single image / ogImage / thumbnail field
          const singleImg = fields.image?.stringValue || fields.imageUrl?.stringValue || fields.ogImage?.stringValue || fields.thumbnail?.stringValue;
          if (singleImg && typeof singleImg === 'string' && singleImg.trim()) {
            foundImage = singleImg.trim();
            break;
          }
        }
      } catch (e) {
        // Continue to next candidate
      }
    }

    // 2. If not found by direct doc ID, try querying collection by slug or sku
    if (!foundImage) {
      try {
        const queryUrl = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0934233443/databases/ai-studio-marudharfashionp-84582cae-673f-469e-bad0-503eef199989/documents:runQuery';
        const queryRes = await fetch(queryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: 'products' }],
              where: {
                compositeFilter: {
                  op: 'OR',
                  filters: [
                    {
                      fieldFilter: {
                        field: { fieldPath: 'slug' },
                        op: 'EQUAL',
                        value: { stringValue: cleanId.toLowerCase() }
                      }
                    },
                    {
                      fieldFilter: {
                        field: { fieldPath: 'sku' },
                        op: 'EQUAL',
                        value: { stringValue: cleanId.toUpperCase() }
                      }
                    }
                  ]
                }
              },
              limit: 1
            }
          })
        });

        if (queryRes.ok) {
          const queryResults = await queryRes.json();
          if (Array.isArray(queryResults) && queryResults[0]?.document?.fields) {
            const fields = queryResults[0].document.fields;
            const imagesValues = fields.images?.arrayValue?.values || [];
            if (imagesValues.length > 0) {
              const firstImg = imagesValues[0]?.stringValue;
              if (firstImg && typeof firstImg === 'string' && firstImg.trim()) {
                foundImage = firstImg.trim();
              }
            }
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    // 3. Process the resolved image URL or base64 data
    if (foundImage) {
      // If it's a data URI (base64)
      if (foundImage.startsWith('data:image/')) {
        const matches = foundImage.match(/^data:image\/([a-zA-Z+.-]+);base64,(.+)$/);
        if (matches) {
          const mimeType = `image/${matches[1]}`;
          const imgBuffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
          return res.status(200).send(imgBuffer);
        }
      }

      // If it's an external safe HTTP/HTTPS URL
      if (foundImage.startsWith('http://') || foundImage.startsWith('https://')) {
        // If it points to an unpurchased old domain or circular /api/product-image, avoid loop
        if (
          !foundImage.includes('marudharfashionpoint.com') &&
          !foundImage.includes('marudharfashion.com') &&
          !foundImage.includes('/api/product-image')
        ) {
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
          return res.redirect(302, foundImage);
        }
      }
    }

    // 4. Default high-quality product placeholder fallback
    return res.redirect(302, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80');
  } catch (err: any) {
    return res.status(500).send('Error serving product image');
  }
}
