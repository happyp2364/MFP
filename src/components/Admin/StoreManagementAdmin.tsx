import React, { useState, useRef } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Phone,
  MessageCircle,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sliders,
  ShieldCheck,
  Search,
  Sparkles,
  UserCheck,
  Tag,
  Store,
  Layers,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PhysicalStore, MobileCategoryIcon, StoreGalleryPhoto, StoreGalleryPhotoCategory } from '../../types';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export const StoreManagementAdmin: React.FC = () => {
  const {
    physicalStores,
    addPhysicalStore,
    updatePhysicalStore,
    deletePhysicalStore,
    togglePhysicalStoreStatus,
    mobileCategories,
    updateMobileCategories,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stores' | 'categories'>('stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('all');

  // Modal State for Store
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<PhysicalStore | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PhysicalStore>>({
    name: '',
    slug: '',
    rating: 4.9,
    reviewsCount: 150,
    address: '',
    area: '',
    city: 'Jodhpur',
    state: 'Rajasthan',
    pincode: '',
    latitude: 26.2918,
    longitude: 73.0168,
    phone: '',
    whatsapp: '',
    openingHoursToday: '10:00 AM - 9:30 PM',
    openingHoursWeek: 'Mon - Sun: 10:00 AM - 9:30 PM',
    isOpen: true,
    images: [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      'Open Box Delivery',
      'Try Before Buy',
      'Shoe Trial',
      'Card Payment',
      'Parking',
      'Wheelchair Accessible',
    ],
    managerName: '',
    holidayTiming: 'Open Daily',
    specialOffers: '',
    googleMapsUrl: '',
    isFeatured: false,
    isEnabled: true,
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCategory, setNewImageCategory] = useState<StoreGalleryPhotoCategory>('exterior');
  const [newImageTitle, setNewImageTitle] = useState('');

  // Photo upload state
  const [isUploadingGalleryPhoto, setIsUploadingGalleryPhoto] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerGalleryFilePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryUploadError(null);
    if (!isUploadingGalleryPhoto && galleryFileInputRef.current) {
      galleryFileInputRef.current.click();
    }
  };

  const processGalleryFiles = async (files: FileList | File[]) => {
    setGalleryUploadError(null);
    setIsUploadingGalleryPhoto(true);

    const newUrls: string[] = [];
    const newPhotos: StoreGalleryPhoto[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setGalleryUploadError('Please select valid image files (PNG, JPG, WEBP).');
          continue;
        }

        const optimizedUrl = await optimizeImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
        newUrls.push(optimizedUrl);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}-${i}`,
          url: optimizedUrl,
          title: newImageTitle.trim() || `Store Photo (${newImageCategory})`,
          category: newImageCategory,
          description: `Uploaded store photo for ${formData.name || 'Branch'}`,
        });
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...newUrls],
          galleryPhotos: [...(prev.galleryPhotos || []), ...newPhotos],
        }));
        showToast(`📸 ${newUrls.length} store photo(s) added to gallery!`, 'success');
        setNewImageTitle('');
      }
    } catch (err) {
      console.error('Error optimizing gallery photos:', err);
      setGalleryUploadError('Failed to process image files. Please try smaller files.');
    } finally {
      setIsUploadingGalleryPhoto(false);
    }
  };

  const handleGalleryFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processGalleryFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleGalleryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadingGalleryPhoto) setIsDraggingGallery(true);
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
    if (isUploadingGalleryPhoto) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processGalleryFiles(e.dataTransfer.files);
    }
  };

  const ALL_SERVICES = [
    'Open Box Delivery',
    'Try Before Buy',
    'Shoe Trial',
    'Card Payment',
    'Parking',
    'Wheelchair Accessible',
  ];

  const cities = Array.from(new Set(physicalStores.map((s) => s.city)));

  const handleOpenAddModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      slug: '',
      rating: 4.9,
      reviewsCount: 120,
      address: '',
      area: '',
      city: 'Jodhpur',
      state: 'Rajasthan',
      pincode: '342001',
      latitude: 26.2918,
      longitude: 73.0168,
      phone: '+91 98290 ',
      whatsapp: '9198290',
      openingHoursToday: '10:00 AM - 9:30 PM',
      openingHoursWeek: 'Mon - Sun: 10:00 AM - 9:30 PM',
      isOpen: true,
      images: [
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
      ],
      services: [...ALL_SERVICES],
      managerName: '',
      holidayTiming: 'Open 365 Days',
      specialOffers: '🔥 Flat 10% OFF on all sports shoes at store!',
      googleMapsUrl: 'https://maps.google.com/?q=26.2918,73.0168',
      isFeatured: false,
      isEnabled: true,
    });
    setIsStoreModalOpen(true);
  };

  const handleOpenEditModal = (store: PhysicalStore) => {
    setEditingStore(store);
    setFormData({ ...store });
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city) {
      showToast('Please fill in Store Name, Address, and City', 'error');
      return;
    }

    const payload: PhysicalStore = {
      id: editingStore ? editingStore.id : `store-${Date.now()}`,
      name: formData.name || 'Marudhar Fashion Point Store',
      slug: (formData.name || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: Number(formData.rating) || 4.9,
      reviewsCount: Number(formData.reviewsCount) || 100,
      address: formData.address || '',
      area: formData.area || '',
      city: formData.city || 'Jodhpur',
      state: formData.state || 'Rajasthan',
      pincode: formData.pincode || '',
      latitude: Number(formData.latitude) || 26.2918,
      longitude: Number(formData.longitude) || 73.0168,
      phone: formData.phone || '',
      whatsapp: formData.whatsapp || '',
      openingHoursToday: formData.openingHoursToday || '10:00 AM - 9:30 PM',
      openingHoursWeek: formData.openingHoursWeek || 'Mon - Sun: 10:00 AM - 9:30 PM',
      isOpen: formData.isOpen !== false,
      images: formData.images && formData.images.length > 0
        ? formData.images
        : ['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'],
      services: formData.services || ALL_SERVICES,
      managerName: formData.managerName || '',
      holidayTiming: formData.holidayTiming || 'Open Daily',
      specialOffers: formData.specialOffers || '',
      googleMapsUrl: formData.googleMapsUrl || `https://maps.google.com/?q=${formData.latitude || 26.2918},${formData.longitude || 73.0168}`,
      isFeatured: Boolean(formData.isFeatured),
      isEnabled: formData.isEnabled !== false,
      updatedAt: new Date().toISOString(),
    };

    if (editingStore) {
      await updatePhysicalStore(editingStore.id, payload);
    } else {
      await addPhysicalStore(payload);
    }
    setIsStoreModalOpen(false);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    const newPhoto: StoreGalleryPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url,
      title: newImageTitle.trim() || `Store Photo (${newImageCategory})`,
      category: newImageCategory,
      description: `Uploaded store photo for ${formData.name || 'Branch'}`,
    };

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
      galleryPhotos: [...(prev.galleryPhotos || []), newPhoto],
    }));
    setNewImageUrl('');
    setNewImageTitle('');
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
      galleryPhotos: (prev.galleryPhotos || []).filter((_, i) => i !== index),
    }));
  };

  const handleToggleService = (serviceName: string) => {
    setFormData((prev) => {
      const current = prev.services || [];
      const updated = current.includes(serviceName)
        ? current.filter((s) => s !== serviceName)
        : [...current, serviceName];
      return { ...prev, services: updated };
    });
  };

  const filteredStores = physicalStores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pincode.includes(searchQuery);
    const matchesCity = selectedCityFilter === 'all' || s.city.toLowerCase() === selectedCityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  // Mobile Categories Handlers
  const handleToggleCategory = (catId: string) => {
    const updated = mobileCategories.map((c) =>
      c.id === catId ? { ...c, enabled: !c.enabled } : c
    );
    updateMobileCategories(updated);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const updated = [...mobileCategories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    // update orders
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateMobileCategories(reordered);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                LIVE STORE LOCATOR & NAV SYSTEM
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Physical Store Outlets & Mobile Category Manager
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              Manage physical Marudhar Fashion Point branches, Google ratings, GPS coordinates, opening hours, WhatsApp links, and mobile home category icons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'stores'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Stores ({physicalStores.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Category Bar ({mobileCategories.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Physical Stores */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stores by name, city, address, or pincode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {cities.length > 0 && (
                <select
                  value={selectedCityFilter}
                  onChange={(e) => setSelectedCityFilter(e.target.value)}
                  className="px-3 py-2.5 text-xs sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-neutral-50 font-medium"
                >
                  <option value="all">All Cities</option>
                  {cities.map((city: any) => (
                    <option key={String(city)} value={String(city)}>
                      {String(city)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-[#0B8F63] hover:bg-[#097551] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW PHYSICAL STORE</span>
            </button>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${
                  !store.isEnabled ? 'opacity-60 border-dashed border-neutral-300' : 'border-neutral-200'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-48 bg-neutral-900 overflow-hidden">
                  <img
                    src={store.images?.[0] || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'}
                    alt={store.name}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {store.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> FEATURED BRANCH
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                        store.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {store.isOpen ? 'OPEN TODAY' : 'CLOSED TODAY'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20 text-white text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                    <span className="text-neutral-400 text-[10px]">({store.reviewsCount})</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">
                      {store.name}
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {store.area ? `${store.area}, ` : ''}{store.city}, {store.state} - {store.pincode}
                    </p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 text-xs text-neutral-700">
                    <p className="line-clamp-2 text-neutral-600 font-normal">
                      <strong className="text-neutral-900 font-bold">Full Address:</strong> {store.address}
                    </p>

                    <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Phone</span>
                        <span className="font-bold text-neutral-900 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" /> {store.phone || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">WhatsApp</span>
                        <span className="font-bold text-neutral-900 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-500" /> {store.whatsapp || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Hours Today</span>
                        <span className="font-semibold text-neutral-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" /> {store.openingHoursToday}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Manager</span>
                        <span className="font-semibold text-neutral-800 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-500" /> {store.managerName || 'General Staff'}
                        </span>
                      </div>
                    </div>

                    {/* Services Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {store.services.map((srv) => (
                        <span
                          key={srv}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                        >
                          ✓ {srv}
                        </span>
                      ))}
                    </div>

                    {store.specialOffers && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium text-xs flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{store.specialOffers}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => togglePhysicalStoreStatus(store.id, !store.isEnabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        store.isEnabled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      {store.isEnabled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{store.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(store)}
                        className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${store.name}?`)) {
                            deletePhysicalStore(store.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Category Icons Manager */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-neutral-900">Mobile Home Category Bar Items</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Reorder, enable, or disable horizontal category icons shown below the search bar on mobile devices.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mobileCategories.map((cat, index) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  cat.enabled ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveCategory(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-neutral-100 rounded text-neutral-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveCategory(index, 'down')}
                      disabled={index === mobileCategories.length - 1}
                      className="p-1 hover:bg-neutral-100 rounded text-neutral-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center border border-emerald-200 text-sm">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-neutral-900">{cat.name}</h4>
                      {cat.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${cat.badgeColor || 'bg-rose-500 text-white'}`}>
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 font-mono">Key: {cat.categoryKey} | Icon: {cat.iconName}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    cat.enabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {cat.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Physical Store */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-neutral-100 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                {editingStore ? 'Edit Physical Store Branch' : 'Add New Physical Store Branch'}
              </h3>
              <button
                onClick={() => setIsStoreModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Marudhar Fashion Point — Ratanada Branch"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Jodhpur, Jaipur, Udaipur"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. Ratanada, MI Road"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">State & Pincode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Rajasthan"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="342001"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Full Street Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot No. 14, Main Station Road, Near Clock Tower..."
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98290 12345"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">WhatsApp Number (Digits Only)</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="919829012345"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Opening Hours Today</label>
                  <input
                    type="text"
                    value={formData.openingHoursToday || ''}
                    onChange={(e) => setFormData({ ...formData, openingHoursToday: e.target.value })}
                    placeholder="10:00 AM - 9:30 PM"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Manager Name</label>
                  <input
                    type="text"
                    value={formData.managerName || ''}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    placeholder="Vikram Singh"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    placeholder="26.2918"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    placeholder="73.0168"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Special Store Offers / Banner</label>
                  <input
                    type="text"
                    value={formData.specialOffers || ''}
                    onChange={(e) => setFormData({ ...formData, specialOffers: e.target.value })}
                    placeholder="e.g. 🔥 Flat 15% OFF on College Shoes this week!"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Services Checkboxes */}
              <div>
                <label className="block font-bold text-neutral-700 mb-2">Available In-Store Services</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  {ALL_SERVICES.map((srv) => {
                    const isChecked = (formData.services || []).includes(srv);
                    return (
                      <label key={srv} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleService(srv)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{srv}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Store Gallery Photos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-neutral-800 text-xs">
                    Store Gallery Photos (Interior, Exterior, Staff, Displays)
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {(formData.images || []).length} photos attached
                  </span>
                </div>

                <div className="space-y-3 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                  {/* Category & Title Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Photo Category</label>
                      <select
                        value={newImageCategory}
                        onChange={(e) => setNewImageCategory(e.target.value as StoreGalleryPhotoCategory)}
                        className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-xs"
                      >
                        <option value="exterior">🏢 Exterior View & Building</option>
                        <option value="interior">🏪 Interior Lounge & Aisles</option>
                        <option value="staff">👔 Staff, Trial & Cashier</option>
                        <option value="display">👟 Shoes Display & Stock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">Caption / Title (Optional)</label>
                      <input
                        type="text"
                        value={newImageTitle}
                        onChange={(e) => setNewImageTitle(e.target.value)}
                        placeholder="e.g. Front Entrance & Signboard"
                        className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                      >
                      </input>
                    </div>
                  </div>

                  {/* Upload Error Banner */}
                  {galleryUploadError && (
                    <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span className="flex-1">{galleryUploadError}</span>
                      <button
                        type="button"
                        onClick={() => setGalleryUploadError(null)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Main File Upload Dropzone */}
                  <div
                    onClick={handleTriggerGalleryFilePicker}
                    onDragOver={handleGalleryDragOver}
                    onDragEnter={handleGalleryDragOver}
                    onDragLeave={handleGalleryDragLeave}
                    onDrop={handleGalleryDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTriggerGalleryFilePicker(e as any);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isDraggingGallery
                        ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                        : 'border-neutral-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20'
                    }`}
                  >
                    {isUploadingGalleryPhoto ? (
                      <div className="flex items-center gap-2 py-2 text-emerald-800 text-xs font-bold">
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                        <span>Compressing and attaching store photos...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-neutral-800">
                          Click or Drag Photos from Device to Upload
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          PNG, JPG, WEBP (Supports multiple photo selection)
                        </span>
                        <button
                          type="button"
                          className="mt-1 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold pointer-events-none"
                        >
                          Choose Photo(s) from Device
                        </button>
                      </>
                    )}

                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                      onChange={handleGalleryFileInputChange}
                      className="sr-only hidden"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Direct URL Fallback */}
                  <div className="pt-2 border-t border-neutral-200/70">
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      Or Add by Direct Image URL:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or direct image link"
                        className="flex-1 px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        disabled={!newImageUrl.trim()}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-bold rounded-xl cursor-pointer text-xs shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Photos Grid */}
                  {(formData.images || []).length > 0 && (
                    <div className="pt-2">
                      <span className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                        Gallery Preview ({formData.images?.length || 0})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(formData.images || []).map((img, i) => {
                          const photoMeta = formData.galleryPhotos?.[i];
                          return (
                            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-neutral-200 bg-black shadow-xs">
                              <img src={img} alt="Store" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex flex-col justify-between">
                                <span className="self-start text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                  {photoMeta?.category || 'photo'}
                                </span>
                                <span className="text-[10px] text-white font-bold truncate">
                                  {photoMeta?.title || `Photo #${i + 1}`}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(i)}
                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-transform cursor-pointer shadow-md"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formData.isOpen !== false}
                    onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Open Today</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Featured Outlet</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled !== false}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Active & Visible</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B8F63] hover:bg-[#097551] text-white font-extrabold shadow-md cursor-pointer"
                >
                  {editingStore ? 'Save Store Changes' : 'Publish New Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
