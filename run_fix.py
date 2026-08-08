Total files modified: 44
=== ./server.ts (8 changes) ===
  L351: const lower = q.toLowerCase();
     -> const lower = (q || '').toLowerCase();
  L652: const isDark = prompt.toLowerCase().includes("dark") || prompt.toLowerCase().includes("black") || prompt.toLowerCase().includes("nike") || prompt.toLowerCase().includes("sports");
     -> const isDark = (prompt || '').toLowerCase().includes("dark") || (prompt || '').toLowerCase().includes("black") || (prompt || '').toLowerCase().includes("nike") || (prompt || '').toLowerCase().includes("sports");
  L653: const isFestival = prompt.toLowerCase().includes("festival") || prompt.toLowerCase().includes("rakhi") || prompt.toLowerCase().includes("diwali") || prompt.toLowerCase().includes("wedding") || prompt.toLowerCase().includes("royal");
     -> const isFestival = (prompt || '').toLowerCase().includes("festival") || (prompt || '').toLowerCase().includes("rakhi") || (prompt || '').toLowerCase().includes("diwali") || (prompt || '').toLowerCase().includes("wedding") || (prompt || '').toLowerCase().includes("royal");
  L1692: const target = rawSlug.trim().toLowerCase();
     -> const target = (rawSlug || \'\').trim().toLowerCase();
  L1697: p.slug.toLowerCase() === target ||
     -> (p.slug || '').toLowerCase() === target ||
  ... and 3 more
=== ./src/App.tsx (9 changes) ===
  L149: if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
     -> if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key || '').toLowerCase() === 'a') {
  L249: (v) => v.color.toLowerCase() === color.toLowerCase() && v.size.toString() === size.toString()
     -> (v) => (v.color || '').toLowerCase() === (color || '').toLowerCase() && v.size.toString() === size.toString()
  L290: (v) => v.color.toLowerCase() === chosenColor.toLowerCase() && v.size.toString() === chosenSize.toString()
     -> (v) => (v.color || '').toLowerCase() === (chosenColor || '').toLowerCase() && v.size.toString() === chosenSize.toString()
  L396: (tag: any) => tag.toLowerCase() === filterState.collection.toLowerCase()
     -> (tag: any) => (tag || '').toLowerCase() === (filterState.collection || '').toLowerCase()
  L403: const q = filterState.searchQuery.toLowerCase();
     -> const q = (filterState.searchQuery || '').toLowerCase();
  ... and 4 more
=== ./src/components/Admin/AdminDashboardModal.tsx (8 changes) ===
  L356: const q = adminSearch.toLowerCase();
     -> const q = (adminSearch || '').toLowerCase();
  L358: p.name.toLowerCase().includes(q) ||
     -> (p.name || '').toLowerCase().includes(q) ||
  L359: p.brand.toLowerCase().includes(q) ||
     -> (p.brand || '').toLowerCase().includes(q) ||
  L360: p.subcategory.toLowerCase().includes(q)
     -> (p.subcategory || '').toLowerCase().includes(q)
  L370: const q = auditSearch.toLowerCase();
     -> const q = (auditSearch || '').toLowerCase();
  ... and 3 more
=== ./src/components/Admin/AdminManagementView.tsx (4 changes) ===
  L138: admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (admin.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L139: admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (admin.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L140: (admin.roleName || '').toLowerCase().includes(searchTerm.toLowerCase());
     -> (admin.roleName || '').toLowerCase().includes((searchTerm || '').toLowerCase());
  L508: admin.email.toLowerCase() === 'vpcreation2002@gmail.com';
     -> (admin.email || '').toLowerCase() === 'vpcreation2002@gmail.com';
=== ./src/components/Admin/CategoriesSettingsView.tsx (2 changes) ===
  L328: const subKey = p.subcategory.toLowerCase();
     -> const subKey = (p.subcategory || '').toLowerCase();
  L1131: onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
     -> onChange={(e) => setFormId((e.target.value || '').toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
=== ./src/components/Admin/CouponManagementView.tsx (2 changes) ===
  L111: const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> const matchesSearch = (c.code || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L112: c.name.toLowerCase().includes(searchQuery.toLowerCase());
     -> (c.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
=== ./src/components/Admin/CreateAdminModal.tsx (1 changes) ===
  L77: const cleanEmail = email.trim().toLowerCase();
     -> const cleanEmail = (email || \'\').trim().toLowerCase();
=== ./src/components/Admin/CustomerIntelligenceCRMView.tsx (3 changes) ===
  L67: c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L68: c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> c.email?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L70: c.city.toLowerCase().includes(searchTerm.toLowerCase())
     -> (c.city || '').toLowerCase().includes((searchTerm || '').toLowerCase())
=== ./src/components/Admin/FeatureReleaseManagerView.tsx (4 changes) ===
  L118: f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (f.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L119: f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (f.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L120: f.description.toLowerCase().includes(searchTerm.toLowerCase());
     -> (f.description || '').toLowerCase().includes((searchTerm || '').toLowerCase());
  L134: const cleanId = newFeature.id.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
     -> const cleanId = (newFeature.id || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
=== ./src/components/Admin/HomepageBuilder/TemplateMarketplaceView.tsx (6 changes) ===
  L151: `homepage_template_${preset.name.toLowerCase().replace(/\s+/g, '_')}.json`
     -> `homepage_template_${(preset.name || '').toLowerCase().replace(/\s+/g, '_')}.json`
  L218: const q = searchQuery.toLowerCase();
     -> const q = (searchQuery || '').toLowerCase();
  L221: p.name.toLowerCase().includes(q) ||
     -> (p.name || '').toLowerCase().includes(q) ||
  L222: p.description.toLowerCase().includes(q) ||
     -> (p.description || '').toLowerCase().includes(q) ||
  L223: p.badge.toLowerCase().includes(q) ||
     -> (p.badge || '').toLowerCase().includes(q) ||
  ... and 1 more
=== ./src/components/Admin/MarketingCenterView.tsx (3 changes) ===
  L150: const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
     -> const matchesSearch = (c.title || '').toLowerCase().includes((searchTerm || '').toLowerCase());
  L158: const term = searchTerm.toLowerCase();
     -> const term = (searchTerm || '').toLowerCase();
  L159: const matchesSearch = s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || (s.phoneNumber || '').includes(term);
     -> const matchesSearch = (s.name || '').toLowerCase().includes(term) || (s.email || '').toLowerCase().includes(term) || (s.phoneNumber || '').includes(term);
=== ./src/components/Admin/OpenBoxDeliverySettingsView.tsx (3 changes) ===
  L89: p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
     -> (p.name || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
  L90: p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
     -> (p.category || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
  L91: (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
     -> (p.sku && (p.sku || '').toLowerCase().includes((productSearch || '').toLowerCase()))
=== ./src/components/Admin/OrderManagementView.tsx (3 changes) ===
  L48: o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (o.id || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L49: o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (o.customerName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L51: o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
     -> (o.customerEmail || '').toLowerCase().includes((searchQuery || '').toLowerCase());
=== ./src/components/Admin/PricePointSettingsView.tsx (3 changes) ===
  L85: p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
     -> (p.name || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
  L86: p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
     -> (p.brand || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
  L87: p.category.toLowerCase().includes(productSearch.toLowerCase())
     -> (p.category || '').toLowerCase().includes((productSearch || '').toLowerCase())
=== ./src/components/Admin/ReviewsSettingsView.tsx (4 changes) ===
  L49: rev.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (rev.author || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L50: rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (rev.comment || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L51: (rev.location && rev.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
     -> (rev.location && (rev.location || '').toLowerCase().includes((searchQuery || '').toLowerCase())) ||
  L52: (rev.productBought && rev.productBought.toLowerCase().includes(searchQuery.toLowerCase()));
     -> (rev.productBought && (rev.productBought || '').toLowerCase().includes((searchQuery || '').toLowerCase()));
=== ./src/components/Admin/SizeStockManager.tsx (1 changes) ===
  L72: if (sizeStocks.some((s) => s.size.toLowerCase() === trimmed.toLowerCase())) {
     -> if (sizeStocks.some((s) => (s.size || '').toLowerCase() === (trimmed || '').toLowerCase())) {
=== ./src/components/Admin/SmartProductFormModal.tsx (12 changes) ===
  L122: v => v.color.toLowerCase() === col.name.toLowerCase() && v.size.toString() === sz.toString()
     -> v => (v.color || '').toLowerCase() === (col.name || '').toLowerCase() && v.size.toString() === sz.toString()
  L138: .find(v => v.color.toLowerCase() === col.name.toLowerCase() && v.images && v.images.length > 0)
     -> .find(v => (v.color || '').toLowerCase() === (col.name || '').toLowerCase() && v.images && v.images.length > 0)
  L184: if (v.color.toLowerCase() === colorName.toLowerCase()) {
     -> if ((v.color || '').toLowerCase() === (colorName || '').toLowerCase()) {
  L354: (c) => c.name.toLowerCase() === colorObj.name.toLowerCase()
     -> (c) => (c.name || '').toLowerCase() === (colorObj.name || '').toLowerCase()
  L1034: selectedColorForGallery.toLowerCase() === c.name.toLowerCase()
     -> (selectedColorForGallery || '').toLowerCase() === (c.name || '').toLowerCase()
  ... and 7 more
=== ./src/components/Admin/SocialMediaSettingsView.tsx (2 changes) ===
  L320: if (socialMediaConfig.platforms.some((p: any) => p.id === addId.trim().toLowerCase())) {
     -> if (socialMediaConfig.platforms.some((p: any) => p.id === (addId || \'\').trim().toLowerCase())) {
  L330: id: addId.trim().toLowerCase(),
     -> id: (addId || \'\').trim().toLowerCase(),
=== ./src/components/Admin/StoreManagementAdmin.tsx (4 changes) ===
  L229: s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (s.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L230: s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (s.city || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L231: s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (s.address || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L233: const matchesCity = selectedCityFilter === 'all' || s.city.toLowerCase() === selectedCityFilter.toLowerCase();
     -> const matchesCity = selectedCityFilter === 'all' || (s.city || '').toLowerCase() === (selectedCityFilter || '').toLowerCase();
=== ./src/components/Admin/SuperAdminConsoleView.tsx (3 changes) ===
  L162: admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (admin.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L163: admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (admin.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L1042: admin.email.toLowerCase() === 'vpcreation2002@gmail.com';
     -> (admin.email || '').toLowerCase() === 'vpcreation2002@gmail.com';
=== ./src/components/Admin/TrendingShoesSettingsView.tsx (3 changes) ===
  L85: p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
     -> (p.name || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
  L86: p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
     -> (p.brand || '').toLowerCase().includes((productSearch || '').toLowerCase()) ||
  L87: p.category.toLowerCase().includes(productSearch.toLowerCase())
     -> (p.category || '').toLowerCase().includes((productSearch || '').toLowerCase())
=== ./src/components/Admin/WebsiteConfigurationView.tsx (2 changes) ===
  L256: s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     -> (s.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
  L257: s.description.toLowerCase().includes(searchQuery.toLowerCase())
     -> (s.description || '').toLowerCase().includes((searchQuery || '').toLowerCase())
=== ./src/components/Admin/WebsiteDirectoryManager.tsx (6 changes) ===
  L131: tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (tenant.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L132: tenant.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (tenant.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L133: tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (tenant.domain || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L134: (tenant.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (tenant.ownerName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  L135: (tenant.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
     -> (tenant.ownerEmail || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
  ... and 1 more
=== ./src/components/Collections/PricePointCollectionSection.tsx (1 changes) ===
  L145: p.collectionTags?.some((t: any) => ['budget', 'value', 'college', 'bestseller'].includes(t.toLowerCase()))
     -> p.collectionTags?.some((t: any) => ['budget', 'value', 'college', 'bestseller'].includes((t || '').toLowerCase()))
=== ./src/components/Collections/TrendingShoesSection.tsx (1 changes) ===
  L109: tag.toLowerCase()
     -> (tag || '').toLowerCase()
=== ./src/components/Common/UniversalImageSystem.tsx (1 changes) ===
  L347: const query = aiPrompt.toLowerCase();
     -> const query = (aiPrompt || '').toLowerCase();
=== ./src/components/Customer/HomepageRenderer.tsx (3 changes) ===
  L235: items = items.filter((p: any) => p.category?.toLowerCase() === filteredCat.toLowerCase());
     -> items = items.filter((p: any) => p.category?.toLowerCase() === (filteredCat || '').toLowerCase());
  L999: p.name.toLowerCase() === activeSlide.productName.toLowerCase()
     -> (p.name || '').toLowerCase() === (activeSlide.productName || '').toLowerCase()
  L1012: p.name.toLowerCase() === activeSlide.productName.toLowerCase()
     -> (p.name || '').toLowerCase() === (activeSlide.productName || '').toLowerCase()
=== ./src/components/Products/ProductCard.tsx (2 changes) ===
  L84: v.color.toLowerCase() === selectedColor.toLowerCase() &&
     -> (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() &&
  L103: (v) => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
     -> (v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.size === selectedSize
=== ./src/components/Products/ProductDetailPage.tsx (8 changes) ===
  L97: v => v.color.toLowerCase() === firstColor.toLowerCase() && v.status === 'active'
     -> v => (v.color || '').toLowerCase() === (firstColor || '').toLowerCase() && v.status === 'active'
  L118: v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.status === 'active'
     -> v => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.status === 'active'
  L132: v.color.toLowerCase() === selectedColor.toLowerCase() &&
     -> (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() &&
  L146: .filter((v) => v.color.toLowerCase() === selectedColor.toLowerCase())
     -> .filter((v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase())
  L290: v.color.toLowerCase(),
     -> (v.color || '').toLowerCase(),
  ... and 3 more
=== ./src/components/Products/QuickViewModal.tsx (3 changes) ===
  L108: (v) => v.color.toLowerCase() === selectedColor.toLowerCase() && v.images && v.images.length > 0
     -> (v) => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.images && v.images.length > 0
  L122: const isVariantSelected = Boolean(product.variants?.find(v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize));
     -> const isVariantSelected = Boolean(product.variants?.find(v => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.size === selectedSize));
  L123: const activeVariant = product.variants?.find(v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize);
     -> const activeVariant = product.variants?.find(v => (v.color || '').toLowerCase() === (selectedColor || '').toLowerCase() && v.size === selectedSize);
=== ./src/components/Reviews/ReviewsSection.tsx (2 changes) ===
  L59: (r: any) => r.productBought?.toLowerCase() === productId.toLowerCase() || r.id === productId
     -> (r: any) => r.productBought?.toLowerCase() === (productId || '').toLowerCase() || r.id === productId
  L160: order.customerEmail.toLowerCase() === customerUser.email.toLowerCase());
     -> (order.customerEmail || '').toLowerCase() === (customerUser.email || '').toLowerCase());
=== ./src/components/Search/LiveSearchModal.tsx (4 changes) ===
  L89: p.name.toLowerCase().includes(query.toLowerCase()) ||
     -> (p.name || '').toLowerCase().includes((query || '').toLowerCase()) ||
  L90: p.category.toLowerCase().includes(query.toLowerCase()) ||
     -> (p.category || '').toLowerCase().includes((query || '').toLowerCase()) ||
  L91: p.subcategory.toLowerCase().includes(query.toLowerCase()) ||
     -> (p.subcategory || '').toLowerCase().includes((query || '').toLowerCase()) ||
  L92: p.brand.toLowerCase().includes(query.toLowerCase())
     -> (p.brand || '').toLowerCase().includes((query || '').toLowerCase())
=== ./src/components/Social/SocialIconRenderer.tsx (2 changes) ===
  L77: if (identifier.toLowerCase().startsWith('<svg')) {
     -> if ((identifier || '').toLowerCase().startsWith('<svg')) {
  L107: const LucideIcon = LUCIDE_MAP[identifier] || LUCIDE_MAP[identifier.toLowerCase()] || Share2;
     -> const LucideIcon = LUCIDE_MAP[identifier] || LUCIDE_MAP[(identifier || '').toLowerCase()] || Share2;
=== ./src/components/StoreLocator/StoreLocatorPage.tsx (6 changes) ===
  L116: const q = searchQuery.toLowerCase().trim();
     -> const q = (searchQuery || '').toLowerCase().trim();
  L119: store.name.toLowerCase().includes(q) ||
     -> (store.name || '').toLowerCase().includes(q) ||
  L120: store.city.toLowerCase().includes(q) ||
     -> (store.city || '').toLowerCase().includes(q) ||
  L121: store.area.toLowerCase().includes(q) ||
     -> (store.area || '').toLowerCase().includes(q) ||
  L122: store.state.toLowerCase().includes(q) ||
     -> (store.state || '').toLowerCase().includes(q) ||
  ... and 1 more
=== ./src/context/AISEOContext.tsx (1 changes) ===
  L22: const keywords = [productTitle.toLowerCase(), 'products', 'online store', 'shopping'];
     -> const keywords = [(productTitle || '').toLowerCase(), 'products', 'online store', 'shopping'];
=== ./src/context/AuthContext.tsx (1 changes) ===
  L176: const emailLower = email.toLowerCase();
     -> const emailLower = (email || '').toLowerCase();
=== ./src/lib/adminService.ts (3 changes) ===
  L50: if (targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && data.roleId !== 'super_admin') {
     -> if ((targetEmail || '').toLowerCase() === (SUPER_ADMIN_EMAIL || '').toLowerCase() && data.roleId !== 'super_admin') {
  L320: adminData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
     -> (adminData.email || '').toLowerCase() === (SUPER_ADMIN_EMAIL || '').toLowerCase() ||
  L380: adminData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
     -> (adminData.email || '').toLowerCase() === (SUPER_ADMIN_EMAIL || '').toLowerCase() ||
=== ./src/lib/firebase.ts (2 changes) ===
  L242: const msg = typeof err.message === 'string' ? err.message.toLowerCase() : '';
     -> const msg = typeof err.message === 'string' ? (err.message || '').toLowerCase() : '';
  L1017: const subId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
     -> const subId = (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
=== ./src/lib/security.ts (1 changes) ===
  L76: if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
     -> if (!ALLOWED_MIME_TYPES.includes((file.type || '').toLowerCase())) {
=== ./src/utils/productCategoryDefaults.ts (1 changes) ===
  L119: const sub = subcategory.toLowerCase();
     -> const sub = (subcategory || '').toLowerCase();
=== ./src/utils/productFeedOptimizer.ts (4 changes) ===
  L30: const formattedSku = p.sku.trim().toLowerCase();
     -> const formattedSku = (p.sku || \'\').trim().toLowerCase();
  L36: const formattedSlug = p.slug.trim().toLowerCase();
     -> const formattedSlug = (p.slug || \'\').trim().toLowerCase();
  L49: if (p.sku && p.sku.trim() !== '') seenSkus.add(p.sku.trim().toLowerCase());
     -> if (p.sku && p.sku.trim() !== '') seenSkus.add(p.(sku || \'\').trim().toLowerCase());
  L50: if (p.slug && p.slug.trim() !== '') seenSlugs.add(p.slug.trim().toLowerCase());
     -> if (p.slug && p.slug.trim() !== '') seenSlugs.add(p.(slug || \'\').trim().toLowerCase());
=== ./src/utils/productUtils.ts (1 changes) ===
  L67: cleanTarget = targetSlugOrId.trim().toLowerCase();
     -> cleanTarget = (targetSlugOrId || \'\').trim().toLowerCase();
=== ./src/utils/sizeStockUtils.ts (1 changes) ===
  L72: return stocks.find((s) => s.size.trim().toLowerCase() === size.trim().toLowerCase());
     -> return stocks.find((s) => (s.size || \'\').trim().toLowerCase() === (size || \'\').trim().toLowerCase());
=== ./src/utils/variantUtils.ts (4 changes) ===
  L18: (v) => v.color.toLowerCase() === color.toLowerCase() && (!size || v.size === size)
     -> (v) => (v.color || '').toLowerCase() === (color || '').toLowerCase() && (!size || v.size === size)
  L34: (v) => v.color.toLowerCase() === color.toLowerCase() && (!size || v.size === size)
     -> (v) => (v.color || '').toLowerCase() === (color || '').toLowerCase() && (!size || v.size === size)
  L77: (v) => v.color.toLowerCase() === color.toLowerCase() && v.images && v.images.length > 0
     -> (v) => (v.color || '').toLowerCase() === (color || '').toLowerCase() && v.images && v.images.length > 0
  L97: (v) => v.color.toLowerCase() === item.selectedColor.toLowerCase() && v.images && v.images.length > 0
     -> (v) => (v.color || '').toLowerCase() === (item.selectedColor || '').toLowerCase() && v.images && v.images.length > 0
