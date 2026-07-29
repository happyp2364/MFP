import React, { useState, useMemo } from 'react';
import { 
  Share2, Eye, EyeOff, Layout, Sliders, Smartphone, Monitor, Palette, Sparkles, 
  Settings, Instagram, Facebook, MessageCircle, Youtube, Send, Twitter, AtSign, 
  Pin, Camera, Linkedin, MapPin, Plus, Trash2, Edit2, Check, X, RefreshCw, 
  BarChart2, TrendingUp, Calendar, Clock, PlayCircle, MessageSquare, ExternalLink,
  SmartphoneIcon, ArrowUp, Zap, HelpCircle, User, MessageSquareCode, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { SocialPlatformConfig, InstagramStoryHighlight, SocialInstagramMediaItem, YouTubeVideoItem } from '../../types';

export const SocialMediaSettingsView: React.FC = () => {
  const { 
    socialMediaConfig, 
    updateSocialMediaConfig, 
    socialAnalytics 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'platforms' | 'instagram' | 'youtube' | 'whatsapp_fb'>('analytics');
  const [error, setError] = useState<string | null>(null);

  // Platform Edit State
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editProfileUrl, setEditProfileUrl] = useState('');
  const [editButtonText, setEditButtonText] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState(1);
  const [editIconColor, setEditIconColor] = useState('#000000');
  const [editBgColor, setEditBgColor] = useState('#F5F5F5');
  const [editHoverEffect, setEditHoverEffect] = useState<'scale' | 'glow' | 'bounce' | 'fade' | 'rotate'>('scale');
  const [editAnimation, setEditAnimation] = useState<'none' | 'bounce' | 'pulse' | 'pulse-slow' | 'shake' | 'float'>('none');

  // Multi-placement visibility checkboxes
  const [editFloating, setEditFloating] = useState(false);
  const [editHeader, setEditHeader] = useState(false);
  const [editFooter, setEditFooter] = useState(false);
  const [editOnHome, setEditOnHome] = useState(false);
  const [editOnContact, setEditOnContact] = useState(false);
  const [editOnProduct, setEditOnProduct] = useState(false);
  const [editOnMobile, setEditOnMobile] = useState(false);
  const [editOnDesktop, setEditOnDesktop] = useState(false);

  // Story Highlight Editor State
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);
  const [hlTitle, setHlTitle] = useState('');
  const [hlCover, setHlCover] = useState('');
  const [hlLink, setHlLink] = useState('');

  // Instagram Media Feed Editor State
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaImgUrl, setMediaImgUrl] = useState('');
  const [mediaLikes, setMediaLikes] = useState(100);
  const [mediaComments, setMediaComments] = useState(10);
  const [mediaUrl, setMediaUrl] = useState('');

  // YouTube Video State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [ytTitle, setYtTitle] = useState('');
  const [ytViews, setYtViews] = useState('');
  const [ytDuration, setYtDuration] = useState('');
  const [ytPublished, setYtPublished] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [ytThumbnail, setYtThumbnail] = useState('');

  // Predefined Messages Editor
  const [whatsappMsg, setWhatsappMsg] = useState(socialMediaConfig.whatsappPredefinedMessage || '');
  const [whatsappName, setWhatsappName] = useState(socialMediaConfig.whatsappSupportName || '');
  const [whatsappAvatar, setWhatsappAvatar] = useState(socialMediaConfig.whatsappSupportAvatar || '');
  const [whatsappRole, setWhatsappRole] = useState(socialMediaConfig.whatsappSupportRole || '');

  // Facebook custom urls
  const [fbLikeUrl, setFbLikeUrl] = useState(socialMediaConfig.facebookPageLikeUrl || '');
  const [fbMessengerUrl, setFbMessengerUrl] = useState(socialMediaConfig.facebookMessengerUrl || '');

  // Sync / manual feed simulation state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Icon Helper mapping
  const getIcon = (iconName: string, color?: string) => {
    const style = color ? { color } : undefined;
    switch ((iconName || '').toLowerCase()) {
      case 'instagram': return <Instagram className="w-5 h-5" style={style} />;
      case 'facebook': return <Facebook className="w-5 h-5" style={style} />;
      case 'messagecircle': return <MessageCircle className="w-5 h-5" style={style} />;
      case 'youtube': return <Youtube className="w-5 h-5" style={style} />;
      case 'send': return <Send className="w-5 h-5" style={style} />;
      case 'twitter': return <Twitter className="w-5 h-5" style={style} />;
      case 'atsign': return <AtSign className="w-5 h-5" style={style} />;
      case 'pin': return <Pin className="w-5 h-5" style={style} />;
      case 'camera': return <Camera className="w-5 h-5" style={style} />;
      case 'linkedin': return <Linkedin className="w-5 h-5" style={style} />;
      case 'mappin': return <MapPin className="w-5 h-5" style={style} />;
      default: return <Share2 className="w-5 h-5" style={style} />;
    }
  };

  // Total metrics calculations
  const totalClicks = useMemo(() => {
    return Object.values(socialAnalytics.clickCount || {}).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);
  }, [socialAnalytics]);

  const mostUsedPlatform = useMemo(() => {
    let maxClicks = -1;
    let popular = 'None';
    Object.entries(socialAnalytics.clickCount || {}).forEach(([platId, clicks]: [string, any]) => {
      const numClicks = Number(clicks) || 0;
      if (numClicks > maxClicks) {
        maxClicks = numClicks;
        popular = platId.toUpperCase();
      }
    });
    return { name: popular, count: maxClicks };
  }, [socialAnalytics]);

  // Click charts arrays
  const dailyClicksData = useMemo(() => {
    return Object.entries(socialAnalytics.dailyClicks)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [socialAnalytics]);

  const platformClicksData = useMemo(() => {
    return socialMediaConfig.platforms.map((plat) => ({
      name: plat.name,
      clicks: socialAnalytics.clickCount[plat.id] || 0,
      color: plat.iconColor
    })).sort((a, b) => b.clicks - a.clicks);
  }, [socialMediaConfig, socialAnalytics]);

  // Trigger manual simulation of refreshing feed metadata
  const handleManualFeedRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Add random likes/comments to show real-time synchronization
      const updatedMedia = socialMediaConfig.instagramMedia.map(m => ({
        ...m,
        likes: m.likes + Math.floor(Math.random() * 45) + 5,
        comments: m.comments + Math.floor(Math.random() * 8) + 1,
        createdAt: 'Just now refreshed'
      }));

      updateSocialMediaConfig({ instagramMedia: updatedMedia });
      setIsRefreshing(false);
      alert('✨ Simulated API Refresh: Latest Instagram posts metadata, stories highlights and view-counts pulled successfully!');
    }, 1200);
  };

  // Platforms Updates Saving
  const handleStartEditPlatform = (plat: SocialPlatformConfig) => {
    setEditingPlatformId(plat.id);
    setEditUsername(plat.username);
    setEditProfileUrl(plat.profileUrl);
    setEditButtonText(plat.customButtonText || '');
    setEditLabel(plat.customLabel || '');
    setEditDisplayOrder(plat.displayOrder);
    setEditIconColor(plat.iconColor);
    setEditBgColor(plat.bgColor);
    setEditHoverEffect(plat.hoverEffect);
    setEditAnimation(plat.animationType);

    setEditFloating(plat.showAsFloating);
    setEditHeader(plat.showHeader);
    setEditFooter(plat.showFooter);
    setEditOnHome(plat.showOnHome);
    setEditOnContact(plat.showOnContact);
    setEditOnProduct(plat.showOnProduct);
    setEditOnMobile(plat.showOnMobile);
    setEditOnDesktop(plat.showOnDesktop);
  };

  const handleSavePlatform = async (platId: string) => {
    try {
      const updatedPlatforms = socialMediaConfig.platforms.map((p) => {
        if (p.id === platId) {
          return {
            ...p,
            username: editUsername,
            profileUrl: editProfileUrl,
            customButtonText: editButtonText,
            customLabel: editLabel,
            displayOrder: editDisplayOrder,
            iconColor: editIconColor,
            bgColor: editBgColor,
            hoverEffect: editHoverEffect,
            animationType: editAnimation,
            showAsFloating: editFloating,
            showHeader: editHeader,
            showFooter: editFooter,
            showOnHome: editOnHome,
            showOnContact: editOnContact,
            showOnProduct: editOnProduct,
            showOnMobile: editOnMobile,
            showOnDesktop: editOnDesktop
          };
        }
        return p;
      });

      await updateSocialMediaConfig({ platforms: updatedPlatforms });
      setEditingPlatformId(null);
    } catch (err: any) {
      setError('Failed to update platform settings.');
    }
  };

  const handleTogglePlatformActive = async (platId: string, currentVal: boolean) => {
    try {
      const updated = socialMediaConfig.platforms.map(p => 
        p.id === platId ? { ...p, enabled: !currentVal } : p
      );
      await updateSocialMediaConfig({ platforms: updated });
    } catch (err: any) {
      setError('Failed to toggle active status.');
    }
  };

  // Instagram Story Highlights Edit
  const handleEditHighlight = (hl: InstagramStoryHighlight) => {
    setEditingHighlightId(hl.id);
    setHlTitle(hl.title);
    setHlCover(hl.coverUrl);
    setHlLink(hl.linkUrl);
  };

  const handleSaveHighlight = async (id: string) => {
    try {
      const updated = socialMediaConfig.instagramHighlights.map(h => 
        h.id === id ? { ...h, title: hlTitle, coverUrl: hlCover, linkUrl: hlLink } : h
      );
      await updateSocialMediaConfig({ instagramHighlights: updated });
      setEditingHighlightId(null);
    } catch (err) {
      setError('Failed to save highlight.');
    }
  };

  const handleAddHighlight = async () => {
    try {
      const newHl: InstagramStoryHighlight = {
        id: 'hl-' + Date.now(),
        title: 'New Highlight',
        coverUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80',
        linkUrl: 'https://instagram.com/marudhar_fashion_point'
      };
      const updated = [...socialMediaConfig.instagramHighlights, newHl];
      await updateSocialMediaConfig({ instagramHighlights: updated });
    } catch (err) {
      setError('Failed to add new highlight bubble.');
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      const updated = socialMediaConfig.instagramHighlights.filter(h => h.id !== id);
      await updateSocialMediaConfig({ instagramHighlights: updated });
    } catch (err) {
      setError('Failed to delete highlight.');
    }
  };

  // Instagram Post/Reel Feed Edit
  const handleEditInstagramMedia = (item: SocialInstagramMediaItem) => {
    setEditingMediaId(item.id);
    setMediaCaption(item.caption);
    setMediaImgUrl(item.imageUrl);
    setMediaLikes(item.likes);
    setMediaComments(item.comments);
    setMediaUrl(item.postUrl);
  };

  const handleSaveInstagramMedia = async (id: string) => {
    try {
      const updated = socialMediaConfig.instagramMedia.map(m => 
        m.id === id ? { 
          ...m, 
          caption: mediaCaption, 
          imageUrl: mediaImgUrl, 
          likes: mediaLikes, 
          comments: mediaComments, 
          postUrl: mediaUrl 
        } : m
      );
      await updateSocialMediaConfig({ instagramMedia: updated });
      setEditingMediaId(null);
    } catch (err) {
      setError('Failed to update Instagram post config.');
    }
  };

  const handleAddInstagramMedia = async (type: 'post' | 'reel') => {
    try {
      const newItem: SocialInstagramMediaItem = {
        id: 'media-' + Date.now(),
        type,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
        caption: 'Handcrafted premium Mojaris and sneakers! 👑✨ #mojari #jodhpur #footwear',
        likes: 150,
        comments: 12,
        postUrl: 'https://instagram.com/marudhar_fashion_point',
        createdAt: 'Just now'
      };
      const updated = [...socialMediaConfig.instagramMedia, newItem];
      await updateSocialMediaConfig({ instagramMedia: updated });
    } catch (err) {
      setError('Failed to append media feed.');
    }
  };

  const handleDeleteInstagramMedia = async (id: string) => {
    try {
      const updated = socialMediaConfig.instagramMedia.filter(m => m.id !== id);
      await updateSocialMediaConfig({ instagramMedia: updated });
    } catch (err) {
      setError('Failed to delete media card.');
    }
  };

  // YouTube Videos Edit
  const handleEditVideo = (vid: YouTubeVideoItem) => {
    setEditingVideoId(vid.id);
    setYtTitle(vid.title);
    setYtViews(vid.views);
    setYtDuration(vid.duration);
    setYtPublished(vid.publishedAt);
    setYtUrl(vid.videoUrl);
    setYtThumbnail(vid.thumbnailUrl);
  };

  const handleSaveVideo = async (id: string, listType: 'videos' | 'shorts') => {
    try {
      const listToUpdate = listType === 'videos' ? socialMediaConfig.youtubeVideos : socialMediaConfig.youtubeShorts;
      const updatedList = listToUpdate.map(v => 
        v.id === id ? { 
          ...v, 
          title: ytTitle, 
          views: ytViews, 
          duration: ytDuration, 
          publishedAt: ytPublished, 
          videoUrl: ytUrl, 
          thumbnailUrl: ytThumbnail 
        } : v
      );

      if (listType === 'videos') {
        await updateSocialMediaConfig({ youtubeVideos: updatedList });
      } else {
        await updateSocialMediaConfig({ youtubeShorts: updatedList });
      }
      setEditingVideoId(null);
    } catch (err) {
      setError('Failed to save YouTube video card.');
    }
  };

  const handleAddYouTubeVideo = async (listType: 'videos' | 'shorts') => {
    try {
      const listToUpdate = listType === 'videos' ? socialMediaConfig.youtubeVideos : socialMediaConfig.youtubeShorts;
      const newVid: YouTubeVideoItem = {
        id: 'yt-' + Date.now(),
        title: 'New Video Sizing & Quality Showcase',
        views: '1.2K views',
        duration: listType === 'shorts' ? '0:50' : '5:12',
        publishedAt: 'Today',
        videoUrl: 'https://youtube.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80'
      };
      const updated = [...listToUpdate, newVid];

      if (listType === 'videos') {
        await updateSocialMediaConfig({ youtubeVideos: updated });
      } else {
        await updateSocialMediaConfig({ youtubeShorts: updated });
      }
    } catch (err) {
      setError('Failed to append YouTube video.');
    }
  };

  const handleDeleteYouTubeVideo = async (id: string, listType: 'videos' | 'shorts') => {
    try {
      const listToUpdate = listType === 'videos' ? socialMediaConfig.youtubeVideos : socialMediaConfig.youtubeShorts;
      const updated = listToUpdate.filter(v => v.id !== id);

      if (listType === 'videos') {
        await updateSocialMediaConfig({ youtubeVideos: updated });
      } else {
        await updateSocialMediaConfig({ youtubeShorts: updated });
      }
    } catch (err) {
      setError('Failed to delete YouTube video.');
    }
  };

  // WhatsApp & FB settings save
  const handleSaveSupportAndFB = async () => {
    try {
      await updateSocialMediaConfig({
        whatsappPredefinedMessage: whatsappMsg,
        whatsappSupportName: whatsappName,
        whatsappSupportAvatar: whatsappAvatar,
        whatsappSupportRole: whatsappRole,
        facebookPageLikeUrl: fbLikeUrl,
        facebookMessengerUrl: fbMessengerUrl
      });
      alert('💾 Chat & Facebook configs saved successfully live!');
    } catch (err) {
      setError('Failed to save predefined messages.');
    }
  };

  return (
    <div id="admin_social_management_center" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
        <div>
          <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-[#0B8F63]" />
            <span>Social Media Management Center</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Publish custom highlights, configure 11 different platform buttons, view click metrics, and preview live feed widgets.
          </p>
        </div>
        <button
          onClick={handleManualFeedRefresh}
          disabled={isRefreshing}
          className="bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md transition-all self-start sm:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'REFRESHING FEEDS...' : 'SIMULATE FEEDS REFRESH'}</span>
        </button>
      </div>

      {/* Error notification banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-800 font-bold">Dismiss</button>
        </div>
      )}

      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics' 
              ? 'bg-[#121816] text-white' 
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Dashboard & CTR Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'platforms' 
              ? 'bg-[#121816] text-white' 
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Platform Placements (11 channels)</span>
        </button>
        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'instagram' 
              ? 'bg-[#121816] text-white' 
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram Feed & Stories</span>
        </button>
        <button
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'youtube' 
              ? 'bg-[#121816] text-white' 
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Youtube className="w-3.5 h-3.5" />
          <span>YouTube Feed & Playlists</span>
        </button>
        <button
          onClick={() => setActiveTab('whatsapp_fb')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'whatsapp_fb' 
              ? 'bg-[#121816] text-white' 
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Chat & Facebook</span>
        </button>
      </div>

      {/* TAB CONTENT: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-[#0B8F63]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Total Social Clicks</span>
                <span className="text-2xl font-black text-neutral-900 font-serif-heading">{totalClicks}</span>
                <span className="text-[10px] text-emerald-600 block font-bold mt-0.5">Across all channel endpoints</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Most Popular Outlet</span>
                <span className="text-xl font-black text-indigo-900 font-serif-heading truncate max-w-[170px] block">{mostUsedPlatform.name}</span>
                <span className="text-[10px] text-indigo-600 block font-bold mt-0.5">{mostUsedPlatform.count} direct user clicks</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Last Recorded Action</span>
                <span className="text-xs font-mono font-bold text-neutral-800 truncate block max-w-[180px]">
                  {socialAnalytics.lastClickTimestamp.whatsapp 
                    ? new Date(socialAnalytics.lastClickTimestamp.whatsapp).toLocaleTimeString() 
                    : 'Just now'}
                </span>
                <span className="text-[10px] text-amber-600 block font-bold mt-0.5">WhatsApp / Instagram lead</span>
              </div>
            </div>
          </div>

          {/* Graphical Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Daily Click Trends */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase text-neutral-500 mb-4 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0B8F63]" />
                <span>Daily Social Click Trends</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyClicksData}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B8F63" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0B8F63" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#0B8F63" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Platform Clicks Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase text-neutral-500 mb-4 tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>Clicks Breakdown by Channel</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformClicksData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="clicks" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                      {platformClicksData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table List CTR */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="p-4 bg-neutral-50 border-b border-neutral-100">
              <h4 className="text-xs font-black text-neutral-800">PLATFORM ENDPOINT CTR BREAKDOWN</h4>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-100 text-neutral-500 uppercase font-bold text-[10px] tracking-wider">
                  <th className="p-3">Platform</th>
                  <th className="p-3">Profile Account</th>
                  <th className="p-3">Total Clicks</th>
                  <th className="p-3">Relative Popularity</th>
                  <th className="p-3 text-right">Endpoint URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {socialMediaConfig.platforms.map((plat) => {
                  const count = socialAnalytics.clickCount[plat.id] || 0;
                  const ratio = totalClicks > 0 ? (count / totalClicks) * 100 : 0;
                  return (
                    <tr key={plat.id} className="hover:bg-neutral-50/50">
                      <td className="p-3 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: plat.bgColor }}>
                          {getIcon(plat.customIcon || plat.id, plat.iconColor)}
                        </div>
                        <span className="font-extrabold text-neutral-800">{plat.name}</span>
                        {!plat.enabled && (
                          <span className="text-[9px] bg-neutral-200 text-neutral-600 px-1 rounded">Disabled</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-neutral-500 font-normal">@{plat.username}</td>
                      <td className="p-3 font-extrabold text-neutral-900">{count}</td>
                      <td className="p-3">
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden max-w-[150px]">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: `${ratio}%`, backgroundColor: plat.iconColor }} 
                          />
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <a 
                          href={plat.profileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0B8F63] hover:underline font-bold inline-flex items-center gap-0.5"
                        >
                          <span>Go</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PLACEMENTS & CONFIG (11 PLATFORMS) */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl text-amber-900 text-xs flex gap-2">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Display Priority & Multi-Visibility Rules:</p>
              <p className="font-normal text-neutral-600 mt-1">
                You can toggle visibility placements individually (Header, Footer, Floating chat bubble, Product Page, Homepage). Enable or disable platforms to update your storefront instantly without refresh.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {socialMediaConfig.platforms
              .sort((a,b) => a.displayOrder - b.displayOrder)
              .map((plat) => {
                const isEditing = editingPlatformId === plat.id;

                return (
                  <div 
                    key={plat.id} 
                    className={`bg-white border p-5 rounded-3xl transition-all shadow-xs ${
                      plat.enabled ? 'border-neutral-200/80 hover:shadow-sm' : 'border-neutral-200 bg-neutral-50/50 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Left Block - Profile Header */}
                      <div className="md:w-1/4 space-y-3.5">
                        <div className="flex items-center gap-3">
                          <div className="p-3.5 rounded-2xl shadow-xs" style={{ backgroundColor: isEditing ? editBgColor : plat.bgColor }}>
                            {getIcon(plat.customIcon || plat.id, isEditing ? editIconColor : plat.iconColor)}
                          </div>
                          <div>
                            <h4 className="font-serif-heading font-black text-neutral-800 text-sm leading-tight">{plat.name}</h4>
                            <p className="text-[10px] font-mono text-neutral-500">@{plat.username}</p>
                          </div>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleTogglePlatformActive(plat.id, plat.enabled)}
                            className={`text-[10px] font-extrabold px-3 py-1.5 rounded-xl border transition-all ${
                              plat.enabled 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-neutral-100 border-neutral-300 text-neutral-600'
                            }`}
                          >
                            {plat.enabled ? '🟢 Live on Site' : '🔴 Disabled'}
                          </button>
                        </div>
                      </div>

                      {/* Middle Block - Content Inputs */}
                      <div className="flex-1 text-xs">
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-neutral-600 block mb-0.5">Username / Handler</label>
                              <input
                                type="text"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="w-full bg-neutral-50 p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#0B8F63]"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-neutral-600 block mb-0.5">Profile link / Call endpoint</label>
                              <input
                                type="text"
                                value={editProfileUrl}
                                onChange={(e) => setEditProfileUrl(e.target.value)}
                                className="w-full bg-neutral-50 p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#0B8F63]"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-neutral-600 block mb-0.5">Button Call-to-action text</label>
                              <input
                                type="text"
                                value={editButtonText}
                                onChange={(e) => setEditButtonText(e.target.value)}
                                className="w-full bg-neutral-50 p-2 border rounded-lg outline-none"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-neutral-600 block mb-0.5">Platform short label description</label>
                              <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="w-full bg-neutral-50 p-2 border rounded-lg outline-none"
                              />
                            </div>

                            {/* Color settings */}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <label className="font-bold text-neutral-600 block mb-0.5">Icon Hex Color</label>
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="color" 
                                    value={editIconColor} 
                                    onChange={(e) => setEditIconColor(e.target.value)} 
                                    className="w-8 h-8 p-0 rounded-lg border"
                                  />
                                  <input 
                                    type="text" 
                                    value={editIconColor} 
                                    onChange={(e) => setEditIconColor(e.target.value)} 
                                    className="w-full bg-neutral-50 p-1 border rounded-lg text-[10px]"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="font-bold text-neutral-600 block mb-0.5">Card Bg Color</label>
                                <div className="flex items-center gap-1">
                                  <input 
                                    type="color" 
                                    value={editBgColor} 
                                    onChange={(e) => setEditBgColor(e.target.value)} 
                                    className="w-8 h-8 p-0 rounded-lg border"
                                  />
                                  <input 
                                    type="text" 
                                    value={editBgColor} 
                                    onChange={(e) => setEditBgColor(e.target.value)} 
                                    className="w-full bg-neutral-50 p-1 border rounded-lg text-[10px]"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Sort order & FX */}
                            <div className="grid grid-cols-3 gap-2 mt-1">
                              <div>
                                <label className="font-bold text-neutral-600 block mb-0.5">Sort Order</label>
                                <input
                                  type="number"
                                  value={editDisplayOrder}
                                  onChange={(e) => setEditDisplayOrder(parseInt(e.target.value) || 1)}
                                  className="w-full bg-neutral-50 p-2 border rounded-lg outline-none"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-neutral-600 block mb-0.5">Hover effect</label>
                                <select
                                  value={editHoverEffect}
                                  onChange={(e) => setEditHoverEffect(e.target.value as any)}
                                  className="w-full bg-neutral-50 p-2 border rounded-lg outline-none"
                                >
                                  <option value="scale">Zoom scale</option>
                                  <option value="glow">Neon Glow</option>
                                  <option value="bounce">Bounce up</option>
                                  <option value="fade">Dim fade</option>
                                  <option value="rotate">Tilt tilt</option>
                                </select>
                              </div>
                              <div>
                                <label className="font-bold text-neutral-600 block mb-0.5">Idle Animation</label>
                                <select
                                  value={editAnimation}
                                  onChange={(e) => setEditAnimation(e.target.value as any)}
                                  className="w-full bg-neutral-50 p-2 border rounded-lg outline-none"
                                >
                                  <option value="none">No motion</option>
                                  <option value="bounce">Bounce idle</option>
                                  <option value="pulse">Pulse scale</option>
                                  <option value="pulse-slow">Pulse slow</option>
                                  <option value="shake">Wiggle shake</option>
                                  <option value="float">Floating wave</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-400 font-extrabold block">BUTTON DESCRIPTOR</span>
                              <p className="font-extrabold text-neutral-800">{plat.customButtonText || 'Join Profile'}</p>
                              <p className="text-neutral-500 font-normal leading-normal italic">"{plat.customLabel || 'No custom description label provided.'}"</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-neutral-400 font-extrabold block">LINK PATHWAY</span>
                              <p className="font-mono text-neutral-600 break-all leading-tight font-normal">{plat.profileUrl}</p>
                              <div className="flex gap-2 text-[10px] text-neutral-500 pt-1.5">
                                <span>Display Index: <strong className="text-neutral-900">{plat.displayOrder}</strong></span>
                                <span>•</span>
                                <span className="capitalize">Hover: <strong className="text-neutral-900">{plat.hoverEffect}</strong></span>
                                <span>•</span>
                                <span className="capitalize">FX: <strong className="text-neutral-900">{plat.animationType}</strong></span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Placements checkboxes */}
                        <div className="mt-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider block mb-2">Visibility Placements</span>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            {isEditing ? (
                              <>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editHeader} onChange={(e) => setEditHeader(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Site Header</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editFooter} onChange={(e) => setEditFooter(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Site Footer</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editFloating} onChange={(e) => setEditFloating(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Floating Bubble</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnHome} onChange={(e) => setEditOnHome(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Homepage Feed</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnContact} onChange={(e) => setEditOnContact(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Contact Page</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnProduct} onChange={(e) => setEditOnProduct(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Product Details</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnMobile} onChange={(e) => setEditOnMobile(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Mobile Devices</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnDesktop} onChange={(e) => setEditOnDesktop(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Desktop Layout</span>
                                </label>
                              </>
                            ) : (
                              <>
                                <span className={`flex items-center gap-1 font-bold ${plat.showHeader ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showHeader ? '🟢' : '⚪'} Header
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showFooter ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showFooter ? '🟢' : '⚪'} Footer
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showAsFloating ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showAsFloating ? '🟢' : '⚪'} Floating Chat
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnHome ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnHome ? '🟢' : '⚪'} Homepage
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnContact ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnContact ? '🟢' : '⚪'} Contact Us
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnProduct ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnProduct ? '🟢' : '⚪'} Product Detail
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnMobile ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnMobile ? '🟢' : '⚪'} Mobile View
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnDesktop ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnDesktop ? '🟢' : '⚪'} Desktop View
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block - Actions */}
                      <div className="md:w-20 flex items-center justify-end">
                        {isEditing ? (
                          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                            <button
                              onClick={() => handleSavePlatform(plat.id)}
                              className="p-2.5 bg-[#0B8F63] hover:bg-[#086F4C] text-white rounded-xl shadow-md w-full md:w-10 flex items-center justify-center transition-colors"
                              title="Save Channel settings"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPlatformId(null)}
                              className="p-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl w-full md:w-10 flex items-center justify-center transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditPlatform(plat)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2.5 rounded-xl border flex items-center gap-1 text-xs font-bold w-full md:w-auto justify-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="md:hidden">Edit Placement</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INSTAGRAM ADDITIONS */}
      {activeTab === 'instagram' && (
        <div className="space-y-6">
          {/* Stories Highlights Circular List */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-heading font-black text-neutral-800 text-base">Instagram Story Highlights (Circular Bubbles)</h3>
                <p className="text-xs text-neutral-500">Add or edit circular highlighting covers that sit on top of the public feedback section.</p>
              </div>
              <button
                onClick={handleAddHighlight}
                className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD HIGHLIGHT BUBBLE</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-4 items-start pt-2">
              {socialMediaConfig.instagramHighlights.map((hl) => {
                const isEditing = editingHighlightId === hl.id;

                return (
                  <div key={hl.id} className="relative group bg-neutral-50 border p-3 rounded-2xl flex flex-col items-center gap-2 w-32 shadow-xs text-center text-xs">
                    {/* Circle cover */}
                    <div className="w-14 h-14 rounded-full border-2 border-pink-500 p-0.5 overflow-hidden shadow-sm bg-white">
                      <img 
                        src={isEditing ? hlCover : hl.coverUrl} 
                        alt={hl.title} 
                        className="w-full h-full rounded-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {isEditing ? (
                      <div className="space-y-1 w-full">
                        <input
                          type="text"
                          value={hlTitle}
                          onChange={(e) => setHlTitle(e.target.value)}
                          className="w-full text-[10px] p-1 border rounded text-center bg-white"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={hlCover}
                          onChange={(e) => setHlCover(e.target.value)}
                          className="w-full text-[9px] p-1 border rounded text-center bg-white"
                          placeholder="Cover URL"
                        />
                        <input
                          type="text"
                          value={hlLink}
                          onChange={(e) => setHlLink(e.target.value)}
                          className="w-full text-[9px] p-1 border rounded text-center bg-white"
                          placeholder="Link URL"
                        />
                        <div className="flex gap-1 justify-center pt-1">
                          <button onClick={() => handleSaveHighlight(hl.id)} className="p-1 bg-emerald-600 text-white rounded"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setEditingHighlightId(null)} className="p-1 bg-neutral-300 text-neutral-700 rounded"><X className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-extrabold text-neutral-800 leading-tight block truncate max-w-[100px]">{hl.title}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1">
                          <button onClick={() => handleEditHighlight(hl)} className="p-1 bg-white text-neutral-600 border rounded-lg shadow-xs"><Edit2 className="w-2.5 h-2.5" /></button>
                          <button onClick={() => handleDeleteHighlight(hl.id)} className="p-1 bg-white text-rose-600 border rounded-lg shadow-xs"><Trash2 className="w-2.5 h-2.5" /></button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instagram Posts & Reels Feed */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-heading font-black text-neutral-800 text-base">Custom Simulated Instagram Feed (Posts & Reels)</h3>
                <p className="text-xs text-neutral-500">Configure visual cards that render as real posts. These simulate pulling authentic data live from your handler.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddInstagramMedia('post')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl"
                >
                  + Add Post
                </button>
                <button
                  onClick={() => handleAddInstagramMedia('reel')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl"
                >
                  + Add Reel
                </button>
              </div>
            </div>

            {/* Grid of Feed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {socialMediaConfig.instagramMedia.map((m) => {
                const isEditing = editingMediaId === m.id;

                return (
                  <div key={m.id} className="border rounded-2xl overflow-hidden bg-neutral-50 flex flex-col justify-between text-xs group shadow-xs">
                    
                    {/* Media Image */}
                    <div className="relative aspect-square bg-neutral-900">
                      <img 
                        src={isEditing ? mediaImgUrl : m.imageUrl} 
                        alt="Instagram media" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
                        {m.type}
                      </span>
                    </div>

                    {/* Meta info / edits */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      {isEditing ? (
                        <div className="space-y-1 w-full">
                          <textarea
                            value={mediaCaption}
                            onChange={(e) => setMediaCaption(e.target.value)}
                            className="w-full text-[10px] p-1.5 border rounded"
                            rows={2}
                            placeholder="Caption Caption..."
                          />
                          <input
                            type="text"
                            value={mediaImgUrl}
                            onChange={(e) => setMediaImgUrl(e.target.value)}
                            className="w-full text-[9px] p-1 border rounded"
                            placeholder="Image URL"
                          />
                          <input
                            type="text"
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            className="w-full text-[9px] p-1 border rounded"
                            placeholder="Post URL link"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="number"
                              value={mediaLikes}
                              onChange={(e) => setMediaLikes(parseInt(e.target.value) || 0)}
                              className="w-full text-[9px] p-1 border rounded"
                              placeholder="Likes"
                            />
                            <input
                              type="number"
                              value={mediaComments}
                              onChange={(e) => setMediaComments(parseInt(e.target.value) || 0)}
                              className="w-full text-[9px] p-1 border rounded"
                              placeholder="Comments"
                            />
                          </div>
                          <div className="flex gap-1.5 pt-1 justify-end">
                            <button onClick={() => handleSaveInstagramMedia(m.id)} className="p-1 bg-emerald-600 text-white font-extrabold text-[9px] rounded flex items-center gap-0.5"><Check className="w-3 h-3" /> Save</button>
                            <button onClick={() => setEditingMediaId(null)} className="p-1 bg-neutral-300 text-neutral-700 font-extrabold text-[9px] rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                          <p className="text-neutral-600 italic font-medium line-clamp-2">"{m.caption}"</p>
                          <div className="flex justify-between text-[10px] font-extrabold text-[#0B8F63] border-t pt-2 mt-auto">
                            <span>❤️ {m.likes} Likes</span>
                            <span>💬 {m.comments} Comments</span>
                          </div>
                          <div className="text-[9px] text-neutral-400 font-mono">Synced: {m.createdAt}</div>
                        </div>
                      )}

                      {/* Hover action bar */}
                      {!isEditing && (
                        <div className="flex gap-1 border-t pt-2 mt-2">
                          <button
                            onClick={() => handleEditInstagramMedia(m)}
                            className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-bold py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteInstagramMedia(m.id)}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: YOUTUBE MEDIA BUILDERS */}
      {activeTab === 'youtube' && (
        <div className="space-y-6">
          {/* Latest Video Cards */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-heading font-black text-neutral-800 text-base">YouTube Video Showcase Feed</h3>
                <p className="text-xs text-neutral-500">Curate wedding footwear lookbook vlogs and styling guide videos.</p>
              </div>
              <button
                onClick={() => handleAddYouTubeVideo('videos')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>CURATE NEW VIDEO</span>
              </button>
            </div>

            {/* Grid of video cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {socialMediaConfig.youtubeVideos.map((vid) => {
                const isEditing = editingVideoId === vid.id;

                return (
                  <div key={vid.id} className="border rounded-2xl overflow-hidden bg-neutral-50 flex flex-col justify-between text-xs group">
                    <div className="relative aspect-video bg-neutral-900">
                      <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1 rounded font-mono">
                        {vid.duration}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      {isEditing ? (
                        <div className="space-y-1 w-full">
                          <input
                            type="text"
                            value={ytTitle}
                            onChange={(e) => setYtTitle(e.target.value)}
                            className="w-full text-[10px] p-1.5 border rounded"
                            placeholder="Video Title"
                          />
                          <input
                            type="text"
                            value={ytThumbnail}
                            onChange={(e) => setYtThumbnail(e.target.value)}
                            className="w-full text-[9px] p-1 border rounded"
                            placeholder="Thumbnail Image URL"
                          />
                          <input
                            type="text"
                            value={ytUrl}
                            onChange={(e) => setYtUrl(e.target.value)}
                            className="w-full text-[9px] p-1 border rounded"
                            placeholder="Video Play URL"
                          />
                          <div className="grid grid-cols-3 gap-1">
                            <input
                              type="text"
                              value={ytViews}
                              onChange={(e) => setYtViews(e.target.value)}
                              className="w-full text-[9px] p-1 border rounded"
                              placeholder="Views"
                            />
                            <input
                              type="text"
                              value={ytDuration}
                              onChange={(e) => setYtDuration(e.target.value)}
                              className="w-full text-[9px] p-1 border rounded"
                              placeholder="Duration"
                            />
                            <input
                              type="text"
                              value={ytPublished}
                              onChange={(e) => setYtPublished(e.target.value)}
                              className="w-full text-[9px] p-1 border rounded"
                              placeholder="Published"
                            />
                          </div>
                          <div className="flex gap-1.5 pt-1.5 justify-end">
                            <button onClick={() => handleSaveVideo(vid.id, 'videos')} className="p-1 bg-emerald-600 text-white font-extrabold text-[9px] rounded flex items-center gap-0.5"><Check className="w-3 h-3" /> Save</button>
                            <button onClick={() => setEditingVideoId(null)} className="p-1 bg-neutral-300 text-neutral-700 font-extrabold text-[9px] rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <h4 className="font-serif-heading font-black text-neutral-800 text-xs leading-snug line-clamp-2">{vid.title}</h4>
                          <div className="flex justify-between text-[10px] text-neutral-400 font-bold">
                            <span>👁️ {vid.views}</span>
                            <span>📅 {vid.publishedAt}</span>
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex gap-1 border-t pt-2 mt-2">
                          <button
                            onClick={() => handleEditVideo(vid)}
                            className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[10px] font-bold py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteYouTubeVideo(vid.id, 'videos')}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* YouTube Shorts Vertical gallery */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-heading font-black text-neutral-800 text-base">YouTube Shorts Gallery (Vertical Mobile Format)</h3>
                <p className="text-xs text-neutral-500">Manage curated YouTube Shorts that feature fast unboxings and visual try-on loops.</p>
              </div>
              <button
                onClick={() => handleAddYouTubeVideo('shorts')}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD SHORT CLIP</span>
              </button>
            </div>

            {/* Shorts gallery grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {socialMediaConfig.youtubeShorts.map((sh) => {
                const isEditing = editingVideoId === sh.id;

                return (
                  <div key={sh.id} className="border rounded-2xl overflow-hidden bg-neutral-50 flex flex-col justify-between text-xs group shadow-xs">
                    <div className="relative aspect-[9/16] bg-neutral-950 overflow-hidden">
                      <img src={sh.thumbnailUrl} alt={sh.title} className="w-full h-full object-cover scale-102 hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-2.5">
                        <span className="text-[10px] text-white font-bold block truncate max-w-[150px]">{sh.title}</span>
                        <span className="text-[9px] text-neutral-300 font-mono block mt-0.5">🔥 {sh.views}</span>
                      </div>
                    </div>

                    <div className="p-2 bg-white">
                      {isEditing ? (
                        <div className="space-y-1 w-full">
                          <input type="text" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} className="w-full text-[9px] p-1 border rounded" placeholder="Title" />
                          <input type="text" value={ytViews} onChange={(e) => setYtViews(e.target.value)} className="w-full text-[9px] p-1 border rounded" placeholder="Views" />
                          <div className="flex gap-1 pt-1 justify-end">
                            <button onClick={() => handleSaveVideo(sh.id, 'shorts')} className="p-1 bg-emerald-600 text-white text-[9px] rounded"><Check className="w-3 h-3" /></button>
                            <button onClick={() => setEditingVideoId(null)} className="p-1 bg-neutral-300 text-neutral-700 text-[9px] rounded"><X className="w-3 h-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEditVideo(sh)} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1 text-[9px] font-bold rounded">Edit</button>
                          <button onClick={() => handleDeleteYouTubeVideo(sh.id, 'shorts')} className="bg-rose-50 text-rose-600 p-1 rounded"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WHATSAPP CHAT & FACEBOOK PAGE SETTINGS */}
      {activeTab === 'whatsapp_fb' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* WhatsApp settings form */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="font-serif-heading font-black text-neutral-800 text-base flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>WhatsApp Predefined Chat Configurations</span>
              </h3>
              <p className="text-xs text-neutral-500">Configure the floating helper support desk chat bubble on your customer frontpage.</p>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">WhatsApp Predefined Messages (Appends to clicks) *</label>
                  <textarea
                    rows={3}
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    placeholder="e.g. Hello, I am visiting your store and want to inquire about leather jutis sizing..."
                    className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl focus:ring-1 focus:ring-[#0B8F63] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Support Agent Display Name</label>
                    <input
                      type="text"
                      value={whatsappName}
                      onChange={(e) => setWhatsappName(e.target.value)}
                      placeholder="e.g. Viju Bhai"
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Support Agent Slogan / Role</label>
                    <input
                      type="text"
                      value={whatsappRole}
                      onChange={(e) => setWhatsappRole(e.target.value)}
                      placeholder="e.g. Senior Shoe Sizing Expert"
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Support Avatar Profile Picture URL</label>
                  <input
                    type="text"
                    value={whatsappAvatar}
                    onChange={(e) => setWhatsappAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-neutral-50 border p-2.5 rounded-xl font-mono text-[10px]"
                  />
                </div>

                {/* Facebook Custom fields */}
                <div className="border-t pt-4 mt-2 space-y-3">
                  <h4 className="text-xs font-black text-neutral-800 flex items-center gap-1">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>Facebook Pages Custom Integrations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Facebook Page Like URL</label>
                      <input
                        type="text"
                        value={fbLikeUrl}
                        onChange={(e) => setFbLikeUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-neutral-50 border p-2.5 rounded-xl font-mono text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Facebook Messenger URL</label>
                      <input
                        type="text"
                        value={fbMessengerUrl}
                        onChange={(e) => setFbMessengerUrl(e.target.value)}
                        placeholder="https://m.me/..."
                        className="w-full bg-neutral-50 border p-2.5 rounded-xl font-mono text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveSupportAndFB}
                  className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-colors block text-center"
                >
                  SAVE MESSAGING CONFIGS LIVE
                </button>
              </div>
            </div>

            {/* Interactive Chat bubble mockup preview */}
            <div className="bg-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-serif-heading font-black text-white text-base">Interactive WhatsApp Chat Bubble Live Preview</h3>
                <p className="text-xs text-neutral-400">This is how your customer-facing chat assistant will look on the live website.</p>
              </div>

              {/* Chat box container mock */}
              <div className="bg-white rounded-2xl p-4 text-neutral-800 shadow-lg space-y-3.5 max-w-sm mx-auto w-full border border-neutral-100">
                {/* Header agent banner */}
                <div className="flex items-center gap-2.5 border-b pb-3 bg-emerald-700 text-white p-3 -mx-4 -mt-4 rounded-t-2xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-100 border">
                    <img 
                      src={whatsappAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80'} 
                      alt="Agent Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs leading-none">{whatsappName || 'Viju Bhai'}</h5>
                    <span className="text-[9px] text-emerald-100 block font-semibold mt-0.5">{whatsappRole || 'Store Support Agent'}</span>
                  </div>
                  <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>

                {/* Dialog Bubble */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border text-[11px] leading-relaxed relative">
                  <span className="font-bold text-emerald-800 block mb-0.5">Customer Sizing Assistant</span>
                  "Namaste! We can customize any leather Jutis or shoe size for your perfect wedding fit. Send us sizing pics! 👞✨"
                </div>

                {/* Simulated click buttons */}
                <div className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-center text-xs font-black cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                  <MessageSquareCode className="w-4 h-4" />
                  <span>Start Live WhatsApp Chat Session</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-neutral-400">
                <span className="font-extrabold text-white block mb-0.5">💡 DID YOU KNOW?</span>
                Whenever customers click your storefront chat buttons, their product context & cart contents are automatically parsed and formatted into predefined messages!
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
