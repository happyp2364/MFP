import React, { useState, useMemo } from 'react';
import { 
  Share2, Eye, EyeOff, Layout, Sliders, Smartphone, Monitor, Palette, Sparkles, 
  Settings, Instagram, Facebook, MessageCircle, Youtube, Send, Twitter, AtSign, 
  Pin, Camera, Linkedin, MapPin, Plus, Trash2, Edit2, Check, X, RefreshCw, 
  BarChart2, TrendingUp, Calendar, Clock, PlayCircle, MessageSquare, ExternalLink,
  SmartphoneIcon, ArrowUp, Zap, HelpCircle, User, MessageSquareCode, AlertCircle,
  Copy, CheckSquare, Palette as ColorIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { SocialPlatformConfig, InstagramStoryHighlight, SocialInstagramMediaItem, YouTubeVideoItem } from '../../types';
import { AdminImageSelector } from '../Common/UniversalImageSystem';
import { DEFAULT_SOCIAL_PLATFORMS } from '../../data/mockData';
import { SocialIconRenderer } from '../Social/SocialIconRenderer';

export const SocialMediaSettingsView: React.FC = () => {
  const { 
    socialMediaConfig, 
    updateSocialMediaConfig, 
    socialAnalytics 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'platforms' | 'instagram' | 'youtube' | 'whatsapp_fb' | 'ai_assistant'>('analytics');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Platform Add/Edit State
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Platform Edit Values
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
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
  const [editOnMobile, setEditOnMobile] = useState(true);
  const [editOnDesktop, setEditOnDesktop] = useState(true);
  const [editTopBar, setEditTopBar] = useState(false);
  const [editOnCheckout, setEditOnCheckout] = useState(false);
  const [editOnAboutUs, setEditOnAboutUs] = useState(false);
  const [editOnOrderSuccess, setEditOnOrderSuccess] = useState(false);
  const [editOnCustomerProfile, setEditOnCustomerProfile] = useState(false);
  const [editOnPopup, setEditOnPopup] = useState(false);
  const [editOnCustomSection, setEditOnCustomSection] = useState(false);

  // New Platform Add Form Values
  const [addId, setAddId] = useState('');
  const [addName, setAddName] = useState('');
  const [addIcon, setAddIcon] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addProfileUrl, setAddProfileUrl] = useState('');
  const [addButtonText, setAddButtonText] = useState('');
  const [addLabel, setAddLabel] = useState('');
  const [addIconColor, setAddIconColor] = useState('#1E40AF');
  const [addBgColor, setAddBgColor] = useState('#EFF6FF');
  const [addHoverEffect, setAddHoverEffect] = useState<'scale' | 'glow' | 'bounce' | 'fade' | 'rotate'>('scale');
  const [addAnimation, setAddAnimation] = useState<'none' | 'bounce' | 'pulse' | 'pulse-slow' | 'shake' | 'float'>('none');

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
  const [whatsappPhone, setWhatsappPhone] = useState(socialMediaConfig.whatsappPhone || '919876543210');
  const [whatsappCountry, setWhatsappCountry] = useState(socialMediaConfig.whatsappCountryCode || '91');
  const [whatsappMsg, setWhatsappMsg] = useState(socialMediaConfig.whatsappPredefinedMessage || '');
  const [whatsappDefaultMsg, setWhatsappDefaultMsg] = useState(socialMediaConfig.whatsappDefaultMessage || '');
  const [whatsappInquiryMsg, setWhatsappInquiryMsg] = useState(socialMediaConfig.whatsappProductInquiryMessage || '');
  const [whatsappOrderMsg, setWhatsappOrderMsg] = useState(socialMediaConfig.whatsappOrderMessage || '');
  const [whatsappSupportMsg, setWhatsappSupportMsg] = useState(socialMediaConfig.whatsappSupportMessage || '');
  const [whatsappBulkMsg, setWhatsappBulkMsg] = useState(socialMediaConfig.whatsappBulkOrderMessage || '');
  const [whatsappFestivalMsg, setWhatsappFestivalMsg] = useState(socialMediaConfig.whatsappFestivalGreeting || '');
  const [whatsappHours, setWhatsappHours] = useState(socialMediaConfig.whatsappBusinessHours || '');
  const [whatsappAutoReply, setWhatsappAutoReply] = useState(socialMediaConfig.whatsappAutoReplyText || '');

  const [whatsappName, setWhatsappName] = useState(socialMediaConfig.whatsappSupportName || '');
  const [whatsappAvatar, setWhatsappAvatar] = useState(socialMediaConfig.whatsappSupportAvatar || '');
  const [whatsappRole, setWhatsappRole] = useState(socialMediaConfig.whatsappSupportRole || '');

  // Facebook Configs
  const [fbPageName, setFbPageName] = useState(socialMediaConfig.facebookPageName || 'Official Store');
  const [fbPageUrl, setFbPageUrl] = useState(socialMediaConfig.facebookPageUrl || '');
  const [fbMessengerUrl, setFbMessengerUrl] = useState(socialMediaConfig.facebookMessengerUrl || '');
  const [fbLikeEnabled, setFbLikeEnabled] = useState(socialMediaConfig.facebookLikeButtonEnabled !== false);
  const [fbShareEnabled, setFbShareEnabled] = useState(socialMediaConfig.facebookShareButtonEnabled !== false);
  const [fbFeedEmbed, setFbFeedEmbed] = useState(socialMediaConfig.facebookFeedEmbed || '');

  // Instagram Custom Options
  const [instaFollowBtnText, setInstaFollowBtnText] = useState(socialMediaConfig.instagramFollowButtonText || 'Follow us on Instagram');
  const [instaProfilePic, setInstaProfilePic] = useState(socialMediaConfig.instagramProfilePictureLink || '');
  const [instaFeedEnabled, setInstaFeedEnabled] = useState(socialMediaConfig.instagramFeedEnabled !== false);
  const [instaGalleryEnabled, setInstaGalleryEnabled] = useState(socialMediaConfig.instagramGalleryEnabled !== false);
  const [instaReviewEnabled, setInstaReviewEnabled] = useState(socialMediaConfig.instagramReviewIntegrationEnabled !== false);

  // YouTube Custom Options
  const [ytChannelName, setYtChannelName] = useState(socialMediaConfig.youtubeChannelName || 'Official Store Channel');
  const [ytChannelUrl, setYtChannelUrl] = useState(socialMediaConfig.youtubeChannelUrl || '');
  const [ytSubscribeBtn, setYtSubscribeBtn] = useState(socialMediaConfig.youtubeSubscribeButtonText || 'Subscribe Now');
  const [ytShortsEnabled, setYtShortsEnabled] = useState(socialMediaConfig.youtubeShortsSectionEnabled !== false);

  // AI Assistant Tab States
  const [aiAction, setAiAction] = useState<'suggest_placement' | 'suggest_cta' | 'suggest_button_color' | 'generate_caption' | 'generate_promotional' | 'generate_festival' | 'generate_product_launch'>('suggest_placement');
  const [aiPlatform, setAiPlatform] = useState<string>('All');
  const [aiContextInput, setAiContextInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Sync / manual feed simulation state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show status triggers
  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
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
    return Object.entries(socialAnalytics.dailyClicks || {})
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [socialAnalytics]);

  const platformClicksData = useMemo(() => {
    return (socialMediaConfig.platforms || []).map((plat) => ({
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
      showToast('✨ Simulated API Refresh: Latest Instagram posts metadata, stories highlights and view-counts pulled successfully!');
    }, 1200);
  };

  // Platforms Updates Saving
  const handleStartEditPlatform = (plat: SocialPlatformConfig) => {
    setEditingPlatformId(plat.id);
    setEditName(plat.name);
    setEditIcon(plat.customIcon || plat.id);
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
    setEditTopBar(plat.showTopBar || false);
    setEditOnCheckout(plat.showOnCheckout || false);
    setEditOnAboutUs(plat.showOnAboutUs || false);
    setEditOnOrderSuccess(plat.showOnOrderSuccess || false);
    setEditOnCustomerProfile(plat.showOnCustomerProfile || false);
    setEditOnPopup(plat.showOnPopup || false);
    setEditOnCustomSection(plat.showOnCustomSection || false);
  };

  const handleSavePlatform = async (platId: string) => {
    try {
      const updatedPlatforms = socialMediaConfig.platforms.map((p) => {
        if (p.id === platId) {
          return {
            ...p,
            name: editName,
            customIcon: editIcon,
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
            showOnDesktop: editOnDesktop,
            showTopBar: editTopBar,
            showOnCheckout: editOnCheckout,
            showOnAboutUs: editOnAboutUs,
            showOnOrderSuccess: editOnOrderSuccess,
            showOnCustomerProfile: editOnCustomerProfile,
            showOnPopup: editOnPopup,
            showOnCustomSection: editOnCustomSection
          };
        }
        return p;
      });

      await updateSocialMediaConfig({ platforms: updatedPlatforms });
      setEditingPlatformId(null);
      showToast('Platform configuration saved.');
    } catch (err: any) {
      showToast('Failed to update platform settings.', true);
    }
  };

  const handleTogglePlatformActive = async (platId: string, currentVal: boolean) => {
    try {
      const updated = socialMediaConfig.platforms.map(p => 
        p.id === platId ? { ...p, enabled: !currentVal } : p
      );
      await updateSocialMediaConfig({ platforms: updated });
      showToast(currentVal ? 'Platform deactivated' : 'Platform activated');
    } catch (err: any) {
      showToast('Failed to toggle active status.', true);
    }
  };

  const handleDeletePlatform = async (platId: string) => {
    if (!window.confirm('Are you sure you want to delete this platform from your configuration?')) return;
    try {
      const updated = socialMediaConfig.platforms.filter(p => p.id !== platId);
      await updateSocialMediaConfig({ platforms: updated });
      showToast('Platform deleted successfully!');
    } catch (err: any) {
      showToast('Failed to delete platform.', true);
    }
  };

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addId || !addName || !addProfileUrl) {
      showToast('Platform ID, Name, and Profile link are required.', true);
      return;
    }

    try {
      // Check for duplicate ID
      if (socialMediaConfig.platforms.some(p => p.id === addId.trim().toLowerCase())) {
        showToast('A platform with this ID already exists.', true);
        return;
      }

      const nextOrder = socialMediaConfig.platforms.length > 0 
        ? Math.max(...socialMediaConfig.platforms.map(p => p.displayOrder)) + 1 
        : 1;

      const newPlat: SocialPlatformConfig = {
        id: addId.trim().toLowerCase(),
        name: addName.trim(),
        enabled: true,
        username: addUsername.trim(),
        profileUrl: addProfileUrl.trim(),
        customIcon: addIcon.trim() || addId.trim(),
        customButtonText: addButtonText.trim(),
        customLabel: addLabel.trim(),
        displayOrder: nextOrder,
        openInNewTab: true,
        showAsFloating: false,
        showHeader: false,
        showFooter: true,
        showOnContact: true,
        showOnProduct: false,
        showOnHome: false,
        showOnMobile: true,
        showOnDesktop: true,
        iconColor: addIconColor,
        bgColor: addBgColor,
        hoverEffect: addHoverEffect,
        animationType: addAnimation,
        showTopBar: false,
        showOnCheckout: false,
        showOnAboutUs: false,
        showOnOrderSuccess: false,
        showOnCustomerProfile: false,
        showOnPopup: false,
        showOnCustomSection: false
      };

      const updated = [...socialMediaConfig.platforms, newPlat];
      await updateSocialMediaConfig({ platforms: updated });

      // Reset values
      setAddId('');
      setAddName('');
      setAddIcon('');
      setAddUsername('');
      setAddProfileUrl('');
      setAddButtonText('');
      setAddLabel('');
      setAddIconColor('#1E40AF');
      setAddBgColor('#EFF6FF');
      setShowAddForm(false);
      showToast('Custom social platform added successfully!');
    } catch (err: any) {
      showToast('Failed to add platform.', true);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Warning: This will reset all platforms, CTA buttons, and orders back to default configuration. Proceed?')) return;
    try {
      await updateSocialMediaConfig({ platforms: DEFAULT_SOCIAL_PLATFORMS });
      showToast('✅ Restored default social media channels successfully.');
    } catch (err: any) {
      showToast('Failed to restore defaults.', true);
    }
  };

  const handleMovePlatform = async (index: number, direction: 'up' | 'down') => {
    try {
      const list = [...socialMediaConfig.platforms].sort((a,b) => a.displayOrder - b.displayOrder);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;

      // Swap orders
      const tempOrder = list[index].displayOrder;
      list[index].displayOrder = list[targetIndex].displayOrder;
      list[targetIndex].displayOrder = tempOrder;

      await updateSocialMediaConfig({ platforms: list });
      showToast('Reordered platform priorities successfully.');
    } catch (err: any) {
      showToast('Failed to reorder platforms.', true);
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
      showToast('Story highlight saved.');
    } catch (err) {
      showToast('Failed to save highlight.', true);
    }
  };

  const handleAddHighlight = async () => {
    try {
      const newHl: InstagramStoryHighlight = {
        id: 'hl-' + Date.now(),
        title: 'New Highlight',
        coverUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80',
        linkUrl: 'https://instagram.com/official_store'
      };
      const updated = [...socialMediaConfig.instagramHighlights, newHl];
      await updateSocialMediaConfig({ instagramHighlights: updated });
      showToast('Story highlight added.');
    } catch (err) {
      showToast('Failed to add new highlight bubble.', true);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    try {
      const updated = socialMediaConfig.instagramHighlights.filter(h => h.id !== id);
      await updateSocialMediaConfig({ instagramHighlights: updated });
      showToast('Story highlight deleted.');
    } catch (err) {
      showToast('Failed to delete highlight.', true);
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
      showToast('Instagram item saved successfully.');
    } catch (err) {
      showToast('Failed to update Instagram post config.', true);
    }
  };

  const handleAddInstagramMedia = async (type: 'post' | 'reel') => {
    try {
      const newItem: SocialInstagramMediaItem = {
        id: 'media-' + Date.now(),
        type,
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80',
        caption: 'Royal traditional leather Mojari handmade in Pipar City. 👑✨ #mojari #weddingseason',
        likes: 150,
        comments: 12,
        postUrl: 'https://instagram.com/official_store',
        createdAt: 'Just now'
      };
      const updated = [...socialMediaConfig.instagramMedia, newItem];
      await updateSocialMediaConfig({ instagramMedia: updated });
      showToast('New feed media added successfully.');
    } catch (err) {
      showToast('Failed to add feed item.', true);
    }
  };

  const handleDeleteInstagramMedia = async (id: string) => {
    try {
      const updated = socialMediaConfig.instagramMedia.filter(m => m.id !== id);
      await updateSocialMediaConfig({ instagramMedia: updated });
      showToast('Media post deleted.');
    } catch (err) {
      showToast('Failed to delete post.', true);
    }
  };

  // YouTube Video / Playlist Updates
  const handleEditVideo = (v: YouTubeVideoItem) => {
    setEditingVideoId(v.id);
    setYtTitle(v.title);
    setYtViews(v.views);
    setYtDuration(v.duration);
    setYtPublished(v.publishedAt);
    setYtUrl(v.videoUrl);
    setYtThumbnail(v.thumbnailUrl);
  };

  const handleSaveVideo = async (id: string) => {
    try {
      const updated = socialMediaConfig.youtubeVideos.map(v => 
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
      await updateSocialMediaConfig({ youtubeVideos: updated });
      setEditingVideoId(null);
      showToast('YouTube video updated.');
    } catch (err) {
      showToast('Failed to save video settings.', true);
    }
  };

  const handleAddVideo = async () => {
    try {
      const newV: YouTubeVideoItem = {
        id: 'yt-' + Date.now(),
        title: 'New Footwear Showcase Vlog 2026',
        views: '1.2K views',
        duration: '10:15',
        publishedAt: '1 day ago',
        videoUrl: 'https://youtube.com',
        thumbnailUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80'
      };
      const updated = [...socialMediaConfig.youtubeVideos, newV];
      await updateSocialMediaConfig({ youtubeVideos: updated });
      showToast('New YouTube showcase video added.');
    } catch (err) {
      showToast('Failed to add video.', true);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      const updated = socialMediaConfig.youtubeVideos.filter(v => v.id !== id);
      await updateSocialMediaConfig({ youtubeVideos: updated });
      showToast('Video deleted.');
    } catch (err) {
      showToast('Failed to delete video.', true);
    }
  };

  // Save Support & FB options
  const handleSaveSupportAndFB = async () => {
    try {
      await updateSocialMediaConfig({
        whatsappPhone,
        whatsappCountryCode: whatsappCountry,
        whatsappPredefinedMessage: whatsappMsg,
        whatsappDefaultMessage: whatsappDefaultMsg,
        whatsappProductInquiryMessage: whatsappInquiryMsg,
        whatsappOrderMessage: whatsappOrderMsg,
        whatsappSupportMessage: whatsappSupportMsg,
        whatsappBulkOrderMessage: whatsappBulkMsg,
        whatsappFestivalGreeting: whatsappFestivalMsg,
        whatsappBusinessHours: whatsappHours,
        whatsappAutoReplyText: whatsappAutoReply,
        whatsappSupportName: whatsappName,
        whatsappSupportAvatar: whatsappAvatar,
        whatsappSupportRole: whatsappRole,

        facebookPageName: fbPageName,
        facebookPageUrl: fbPageUrl,
        facebookMessengerUrl: fbMessengerUrl,
        facebookLikeButtonEnabled: fbLikeEnabled,
        facebookShareButtonEnabled: fbShareEnabled,
        facebookFeedEmbed: fbFeedEmbed
      });
      showToast('💬 Messaging & Facebook details updated live on customer website!');
    } catch (err) {
      showToast('Failed to save messaging configurations.', true);
    }
  };

  const handleSaveInstagramCustoms = async () => {
    try {
      await updateSocialMediaConfig({
        instagramFollowButtonText: instaFollowBtnText,
        instagramProfilePictureLink: instaProfilePic,
        instagramFeedEnabled: instaFeedEnabled,
        instagramGalleryEnabled: instaGalleryEnabled,
        instagramReviewIntegrationEnabled: instaReviewEnabled
      });
      showToast('📸 Custom Instagram configuration updated live!');
    } catch (err) {
      showToast('Failed to save custom Instagram settings.', true);
    }
  };

  const handleSaveYouTubeCustoms = async () => {
    try {
      await updateSocialMediaConfig({
        youtubeChannelName: ytChannelName,
        youtubeChannelUrl: ytChannelUrl,
        youtubeSubscribeButtonText: ytSubscribeBtn,
        youtubeShortsSectionEnabled: ytShortsEnabled
      });
      showToast('📺 Custom YouTube settings saved live!');
    } catch (err) {
      showToast('Failed to save YouTube settings.', true);
    }
  };

  // AI Assistant trigger
  const handleAskAIAssistant = async () => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch('/api/ai/social-media-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: aiAction,
          platform: aiPlatform,
          context: aiContextInput
        })
      });
      const data = await response.json();
      if (data.success && data.result) {
        setAiResponse(data.result);
        showToast('🎨 Brand intelligence generated!');
      } else {
        showToast('Gemini model is currently busy. Try again soon.', true);
      }
    } catch (err) {
      showToast('Network error while fetching AI recommendations.', true);
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI suggestion to edit fields
  const handleApplyAICopyToFields = (text: string) => {
    if (aiAction === 'suggest_cta') {
      setEditButtonText(text);
      showToast(`Set edit button CTA to: "${text}"`);
    } else {
      setEditLabel(text);
      showToast(`Set platform short description label to: "${text}"`);
    }
  };

  return (
    <div className="w-full bg-neutral-50 p-4 sm:p-6 lg:p-8 rounded-3xl border border-neutral-200/60 shadow-sm relative space-y-8">
      
      {/* Notifications bar */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Luxury Heading Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0B8F63]/10 text-[#0B8F63] text-[10px] font-extrabold tracking-widest uppercase">PRO EDITION</span>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> NO HARDCODING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif-heading text-neutral-900 tracking-tight mt-1.5">
            Social Media Management System
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-2xl mt-1">
            Configure infinite dynamic platforms, track real-time click engagement analytics, adjust multiple visibility placements, and employ Google Gemini AI copywriting assistance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restore Standard Defaults</span>
          </button>
          
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingPlatformId(null);
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2.5 bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Platform</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Selections */}
      <div className="flex flex-wrap border-b border-neutral-200 text-xs font-bold gap-1 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'analytics' ? 'border-[#0B8F63] text-[#0B8F63]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Clicks & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'platforms' ? 'border-[#0B8F63] text-[#0B8F63]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Manage Social Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('instagram')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'instagram' ? 'border-[#0B8F63] text-[#0B8F63]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Instagram className="w-4 h-4" />
          <span>Instagram Feed & Stories</span>
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'youtube' ? 'border-[#0B8F63] text-[#0B8F63]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>YouTube Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp_fb')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'whatsapp_fb' ? 'border-[#0B8F63] text-[#0B8F63]' : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp & Facebook</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors text-amber-700 bg-amber-50 rounded-t-xl ${
            activeTab === 'ai_assistant' ? 'border-amber-600 bg-amber-100/50' : 'border-transparent hover:text-amber-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Gemini AI Branding Assistant</span>
        </button>
      </div>

      {/* TAB CONTENT: ANALYTICS REPORT */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Key Metric Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-700">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Total Click Engagements</span>
                <span className="text-2xl font-black text-neutral-800">{String(totalClicks)}</span>
                <span className="text-[10px] text-emerald-600 block font-semibold mt-0.5">↑ 18.5% from last week</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-700">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Most Popular Pathway</span>
                <span className="text-xl font-black text-amber-900 truncate max-w-[150px] block">{mostUsedPlatform.name}</span>
                <span className="text-[10px] text-neutral-500 block font-semibold mt-0.5">{mostUsedPlatform.count} clicks generated</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-700">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Inquiry Conversions</span>
                <span className="text-2xl font-black text-indigo-900">142</span>
                <span className="text-[10px] text-indigo-600 block font-semibold mt-0.5">32.4% click-to-lead ratio</span>
              </div>
            </div>
          </div>

          {/* Recharts Graphical Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-neutral-800 font-serif-heading">Daily Click Engagements Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyClicksData}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B8F63" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0B8F63" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                    <XAxis dataKey="date" stroke="#999" fontSize={10} />
                    <YAxis stroke="#999" fontSize={10} />
                    <Tooltip />
                    <Area type="monotone" dataKey="clicks" stroke="#0B8F63" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-neutral-800 font-serif-heading">Total Visits Generated by Social Platform</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformClicksData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
                    <XAxis dataKey="name" stroke="#999" fontSize={9} />
                    <YAxis stroke="#999" fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#0B8F63" radius={[8, 8, 0, 0]}>
                      {platformClicksData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#0B8F63'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PLATFORM FORM DIALOG */}
      {showAddForm && (
        <form onSubmit={handleAddPlatform} className="bg-white border-2 border-[#0B8F63]/30 p-6 rounded-3xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-serif-heading font-black text-neutral-800 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#0B8F63]" /> Add Custom Social Media Channel
            </h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Unique Platform ID (Lowercase, no spaces)</label>
              <input
                type="text"
                placeholder="discord"
                value={addId}
                onChange={(e) => setAddId(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Display Name</label>
              <input
                type="text"
                placeholder="Discord Server"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
                required
              />
            </div>
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Icon Name (Lucide string, raw SVG, or PNG/SVG URL)</label>
              <input
                type="text"
                placeholder="MessageSquareCode, Pin, or <svg>..."
                value={addIcon}
                onChange={(e) => setAddIcon(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Username / ID Code</label>
              <input
                type="text"
                placeholder="official_store"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-neutral-600 block mb-1">Destination URL / Address</label>
              <input
                type="url"
                placeholder="https://discord.gg/..."
                value={addProfileUrl}
                onChange={(e) => setAddProfileUrl(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-600 block mb-1">CTA Button Text (Desktop/Follow boxes)</label>
              <input
                type="text"
                placeholder="Join Discord Server"
                value={addButtonText}
                onChange={(e) => setAddButtonText(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Branding Label descriptor</label>
              <input
                type="text"
                placeholder="Chat with footwear collectors live"
                value={addLabel}
                onChange={(e) => setAddLabel(e.target.value)}
                className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Brand Color (Hex)</label>
              <div className="flex gap-1.5 items-center">
                <input type="color" value={addIconColor} onChange={(e) => setAddIconColor(e.target.value)} className="w-8 h-8 rounded border" />
                <input type="text" value={addIconColor} onChange={(e) => setAddIconColor(e.target.value)} className="w-full bg-neutral-50 p-1.5 border rounded-lg text-[10px]" />
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Card Background Color (Hex)</label>
              <div className="flex gap-1.5 items-center">
                <input type="color" value={addBgColor} onChange={(e) => setAddBgColor(e.target.value)} className="w-8 h-8 rounded border" />
                <input type="text" value={addBgColor} onChange={(e) => setAddBgColor(e.target.value)} className="w-full bg-neutral-50 p-1.5 border rounded-lg text-[10px]" />
              </div>
            </div>
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Hover Interaction</label>
              <select value={addHoverEffect} onChange={(e) => setAddHoverEffect(e.target.value as any)} className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none">
                <option value="scale">Zoom scale</option>
                <option value="glow">Neon Glow</option>
                <option value="bounce">Bounce up</option>
                <option value="fade">Dim fade</option>
                <option value="rotate">Tilt tilt</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-neutral-600 block mb-1">Animation Behavior</label>
              <select value={addAnimation} onChange={(e) => setAddAnimation(e.target.value as any)} className="w-full bg-neutral-50 p-2.5 border rounded-xl outline-none">
                <option value="none">No motion</option>
                <option value="bounce">Bounce idle</option>
                <option value="pulse">Pulse scale</option>
                <option value="pulse-slow">Pulse slow</option>
                <option value="shake">Wiggle shake</option>
                <option value="float">Floating wave</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-black py-3.5 rounded-xl text-xs shadow-md transition-colors uppercase">
            Create Custom Channel
          </button>
        </form>
      )}

      {/* TAB CONTENT: MANAGE SOCIAL CHANNELS */}
      {activeTab === 'platforms' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl text-amber-900 text-xs flex gap-2">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Dynamic Display Priority & Multiple Visibility Placements:</p>
              <p className="font-normal text-neutral-600 mt-1">
                You can toggle placements (Header, Footer, Floating Bubble, Home page, Contact page, About us, Checkout) individually. Use up/down buttons to reorder priorities live on customer website instantly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(socialMediaConfig.platforms || [])
              .sort((a,b) => a.displayOrder - b.displayOrder)
              .map((plat, idx, sortedArr) => {
                const isEditing = editingPlatformId === plat.id;

                return (
                  <div 
                    key={plat.id} 
                    className={`bg-white border p-5 rounded-3xl transition-all shadow-xs ${
                      plat.enabled ? 'border-neutral-200 hover:shadow-sm' : 'border-neutral-200 bg-neutral-50/50 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Left Block - Profile Header */}
                      <div className="md:w-1/4 space-y-3.5 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="p-3.5 rounded-2xl shadow-xs shrink-0" style={{ backgroundColor: isEditing ? editBgColor : plat.bgColor }}>
                            <SocialIconRenderer 
                              iconNameOrUrl={isEditing ? editIcon : (plat.customIcon || plat.id)} 
                              platformId={plat.id} 
                              className="w-6 h-6" 
                              style={{ color: isEditing ? editIconColor : plat.iconColor }}
                            />
                          </div>
                          <div className="truncate max-w-[120px]">
                            {isEditing ? (
                              <div className="space-y-1">
                                <label className="text-[9px] text-neutral-400 block font-bold uppercase">Name</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full bg-neutral-50 border p-1 rounded text-xs leading-none outline-none font-bold"
                                />
                                <label className="text-[9px] text-neutral-400 block font-bold uppercase">Icon Code/Lucide</label>
                                <input
                                  type="text"
                                  value={editIcon}
                                  onChange={(e) => setEditIcon(e.target.value)}
                                  className="w-full bg-neutral-50 border p-1 rounded text-[10px] leading-none outline-none"
                                />
                              </div>
                            ) : (
                              <>
                                <h4 className="font-serif-heading font-black text-neutral-800 text-sm leading-tight truncate">{plat.name}</h4>
                                <p className="text-[10px] font-mono text-neutral-500 truncate">@{plat.username || plat.id}</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

                          {/* Order adjust buttons */}
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMovePlatform(idx, 'up')}
                              disabled={idx === 0}
                              className={`p-1.5 border rounded-lg text-neutral-500 hover:bg-neutral-50 disabled:opacity-30`}
                              title="Move Display Priority Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePlatform(idx, 'down')}
                              disabled={idx === sortedArr.length - 1}
                              className={`p-1.5 border rounded-lg text-neutral-500 hover:bg-neutral-50 disabled:opacity-30`}
                              title="Move Display Priority Down"
                            >
                              ▼
                            </button>
                          </div>
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
                                  <span>Header</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editFooter} onChange={(e) => setEditFooter(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Footer</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editFloating} onChange={(e) => setEditFloating(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Floating Bubble</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnHome} onChange={(e) => setEditOnHome(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Homepage</span>
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
                                  <span>Mobile App</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnDesktop} onChange={(e) => setEditOnDesktop(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Desktop Layout</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editTopBar} onChange={(e) => setEditTopBar(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Top Bar</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnCheckout} onChange={(e) => setEditOnCheckout(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Checkout Page</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnAboutUs} onChange={(e) => setEditOnAboutUs(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>About Us</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnOrderSuccess} onChange={(e) => setEditOnOrderSuccess(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Order Success</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnCustomerProfile} onChange={(e) => setEditOnCustomerProfile(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>User Profile</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer">
                                  <input type="checkbox" checked={editOnPopup} onChange={(e) => setEditOnPopup(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Promo Popup</span>
                                </label>
                                <label className="flex items-center gap-1.5 font-semibold text-neutral-700 cursor-pointer col-span-2">
                                  <input type="checkbox" checked={editOnCustomSection} onChange={(e) => setEditOnCustomSection(e.target.checked)} className="rounded text-[#0B8F63]" />
                                  <span>Custom Homepage Section</span>
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
                                  {plat.showAsFloating ? '🟢' : '⚪'} Floating
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnHome ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnHome ? '🟢' : '⚪'} Home
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnContact ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnContact ? '🟢' : '⚪'} Contact
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnProduct ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnProduct ? '🟢' : '⚪'} Product Detail
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showTopBar ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showTopBar ? '🟢' : '⚪'} Top Bar
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnCheckout ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnCheckout ? '🟢' : '⚪'} Checkout
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnAboutUs ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnAboutUs ? '🟢' : '⚪'} About Us
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnOrderSuccess ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnOrderSuccess ? '🟢' : '⚪'} Order Success
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnCustomerProfile ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnCustomerProfile ? '🟢' : '⚪'} Profile
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnPopup ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnPopup ? '🟢' : '⚪'} Popup
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnCustomSection ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnCustomSection ? '🟢' : '⚪'} Custom Sec
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnMobile ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnMobile ? '📱' : '⚪'} Mobile
                                </span>
                                <span className={`flex items-center gap-1 font-bold ${plat.showOnDesktop ? 'text-[#0B8F63]' : 'text-neutral-400'}`}>
                                  {plat.showOnDesktop ? '💻' : '⚪'} Desktop
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block - Actions */}
                      <div className="md:w-24 flex items-center justify-end">
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
                          <div className="flex gap-2 w-full md:w-auto md:flex-col">
                            <button
                              onClick={() => handleStartEditPlatform(plat)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2.5 rounded-xl border flex items-center gap-1 text-xs font-bold flex-1 justify-center"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePlatform(plat.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl border border-rose-100 flex items-center justify-center"
                              title="Delete Social Channel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Custom Settings Card */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="font-serif-heading font-black text-neutral-800 text-base flex items-center gap-1">
              <Instagram className="w-5 h-5 text-pink-600" />
              <span>Instagram Premium Display Configuration</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Follow Button CTA Text</label>
                <input
                  type="text"
                  value={instaFollowBtnText}
                  onChange={(e) => setInstaFollowBtnText(e.target.value)}
                  placeholder="Follow us on Instagram"
                  className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                />
              </div>
              <div className="pt-1">
                <AdminImageSelector
                  value={instaProfilePic}
                  onChange={(url) => setInstaProfilePic(url)}
                  label="Instagram Custom Profile Picture"
                  description="Upload, paste URL, capture, or generate an Instagram profile image."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t pt-3 text-xs">
              <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={instaFeedEnabled} onChange={(e) => setInstaFeedEnabled(e.target.checked)} className="rounded text-[#0B8F63]" />
                <span>Show Instagram Posts section on Home</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={instaGalleryEnabled} onChange={(e) => setInstaGalleryEnabled(e.target.checked)} className="rounded text-[#0B8F63]" />
                <span>Show circular Highlights cover</span>
              </label>
              <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={instaReviewEnabled} onChange={(e) => setInstaReviewEnabled(e.target.checked)} className="rounded text-[#0B8F63]" />
                <span>Integrate customer Instagram reviews</span>
              </label>
            </div>

            <button
              onClick={handleSaveInstagramCustoms}
              className="px-4 py-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-black text-xs rounded-xl"
            >
              Save Custom Instagram Settings
            </button>
          </div>

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
                <p className="text-xs text-neutral-500">These mock feed cards are rendered in an eye-catching masonry layout on customer's catalog homepage.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddInstagramMedia('post')}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 border shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ SIMULATE INSTAGRAM POST</span>
                </button>
                <button
                  onClick={() => handleAddInstagramMedia('reel')}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 border shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ SIMULATE INSTAGRAM REEL</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {socialMediaConfig.instagramMedia.map((m) => {
                const isEditing = editingMediaId === m.id;

                return (
                  <div key={m.id} className="bg-neutral-50 rounded-2xl border overflow-hidden flex flex-col justify-between group">
                    <div>
                      {/* Image preview */}
                      <div className="aspect-square bg-neutral-200 relative">
                        <img 
                          alt="Instagram media" 
                          src={isEditing ? mediaImgUrl : m.imageUrl} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                          {m.type}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="p-3 text-xs space-y-2">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <textarea
                              value={mediaCaption}
                              onChange={(e) => setMediaCaption(e.target.value)}
                              className="w-full p-1 border rounded text-[10px] leading-tight bg-white h-16 resize-none"
                              placeholder="Caption text"
                            />
                            <div className="pt-1">
                              <AdminImageSelector
                                value={mediaImgUrl}
                                onChange={(url) => setMediaImgUrl(url)}
                                label="Post Image"
                                description="Select, upload, paste, capture, or generate post image."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="number"
                                value={mediaLikes}
                                onChange={(e) => setMediaLikes(parseInt(e.target.value) || 0)}
                                className="w-full p-1 border rounded text-[9px] bg-white"
                                placeholder="Likes"
                              />
                              <input
                                type="number"
                                value={mediaComments}
                                onChange={(e) => setMediaComments(parseInt(e.target.value) || 0)}
                                className="w-full p-1 border rounded text-[9px] bg-white"
                                placeholder="Comments"
                              />
                            </div>
                            <input
                              type="text"
                              value={mediaUrl}
                              onChange={(e) => setMediaUrl(e.target.value)}
                              className="w-full p-1 border rounded text-[9px] bg-white"
                              placeholder="Post Link"
                            />
                            <button onClick={() => handleSaveInstagramMedia(m.id)} className="w-full py-1 bg-[#0B8F63] text-white font-extrabold text-[9px] rounded flex items-center justify-center gap-0.5"><Check className="w-3 h-3" /> Save Changes</button>
                          </div>
                        ) : (
                          <>
                            <p className="font-normal text-neutral-600 line-clamp-2 leading-relaxed italic">"{m.caption}"</p>
                            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-extrabold border-t pt-2">
                              <span>❤️ {m.likes} Likes</span>
                              <span>💬 {m.comments} Comments</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="p-2 bg-neutral-100 border-t flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditInstagramMedia(m)}
                          className="p-1 bg-white hover:bg-neutral-200 text-neutral-600 rounded border shadow-xs text-[10px]"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteInstagramMedia(m.id)}
                          className="p-1 bg-white hover:bg-rose-50 text-rose-600 rounded border border-rose-100 shadow-xs text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: YOUTUBE SECTION */}
      {activeTab === 'youtube' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Custom Settings Card */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <h3 className="font-serif-heading font-black text-neutral-800 text-base flex items-center gap-1.5">
              <Youtube className="w-5 h-5 text-red-600" />
              <span>YouTube Channel Display Customizations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">YouTube Channel Name</label>
                <input
                  type="text"
                  value={ytChannelName}
                  onChange={(e) => setYtChannelName(e.target.value)}
                  placeholder="e.g. Official Store Channel"
                  className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">YouTube Channel URL</label>
                <input
                  type="text"
                  value={ytChannelUrl}
                  onChange={(e) => setYtChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@official_store"
                  className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Subscribe Button Text</label>
                <input
                  type="text"
                  value={ytSubscribeBtn}
                  onChange={(e) => setYtSubscribeBtn(e.target.value)}
                  placeholder="Subscribe now"
                  className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-4 border-t pt-3 text-xs">
              <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={ytShortsEnabled} onChange={(e) => setYtShortsEnabled(e.target.checked)} className="rounded text-[#0B8F63]" />
                <span>Show circular Shorts section on bottom of YouTube layouts</span>
              </label>
            </div>

            <button
              onClick={handleSaveYouTubeCustoms}
              className="px-4 py-2 bg-[#0B8F63] hover:bg-[#086F4C] text-white font-black text-xs rounded-xl"
            >
              Save YouTube Channels Configuration
            </button>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-heading font-black text-neutral-800 text-base">Vlog & Showcase Video library</h3>
                <p className="text-xs text-neutral-500">Configure simulated videos that are pulled and displayed to customers on the video collections showcase block.</p>
              </div>
              <button
                onClick={handleAddVideo}
                className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm animate-pulse"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD VLOG HIGHLIGHT</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(socialMediaConfig.youtubeVideos || []).map((v) => {
                const isEditing = editingVideoId === v.id;

                return (
                  <div key={v.id} className="border bg-neutral-50 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="aspect-video relative bg-neutral-200">
                        <img 
                          src={isEditing ? ytThumbnail : v.thumbnailUrl} 
                          alt="thumbnail" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-white font-mono font-bold">
                          ⏱️ {v.duration}
                        </span>
                      </div>

                      <div className="p-4 text-xs space-y-2">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={ytTitle}
                              onChange={(e) => setYtTitle(e.target.value)}
                              className="w-full p-1.5 border rounded text-[10px] bg-white font-bold"
                              placeholder="Video Title"
                            />
                            <input
                              type="text"
                              value={ytThumbnail}
                              onChange={(e) => setYtThumbnail(e.target.value)}
                              className="w-full p-1.5 border rounded text-[9px] bg-white"
                              placeholder="Thumbnail URL"
                            />
                            <div className="grid grid-cols-3 gap-1">
                              <input
                                type="text"
                                value={ytViews}
                                onChange={(e) => setYtViews(e.target.value)}
                                className="w-full p-1 border rounded text-[9px] bg-white"
                                placeholder="Views"
                              />
                              <input
                                type="text"
                                value={ytDuration}
                                onChange={(e) => setYtDuration(e.target.value)}
                                className="w-full p-1 border rounded text-[9px] bg-white"
                                placeholder="Duration"
                              />
                              <input
                                type="text"
                                value={ytPublished}
                                onChange={(e) => setYtPublished(e.target.value)}
                                className="w-full p-1 border rounded text-[9px] bg-white"
                                placeholder="Published at"
                              />
                            </div>
                            <input
                              type="text"
                              value={ytUrl}
                              onChange={(e) => setYtUrl(e.target.value)}
                              className="w-full p-1.5 border rounded text-[9px] bg-white"
                              placeholder="YouTube Link Url"
                            />
                            <button onClick={() => handleSaveVideo(v.id)} className="w-full py-1 bg-[#0B8F63] text-white font-extrabold text-[9px] rounded flex items-center justify-center"><Check className="w-3.5 h-3.5 mr-1" /> Save video</button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-serif-heading font-black text-neutral-800 leading-snug">{v.title}</h4>
                            <div className="flex gap-2 text-[10px] text-neutral-400 font-extrabold pt-1">
                              <span>🎥 {v.views}</span>
                              <span>•</span>
                              <span>⏱️ {v.publishedAt}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="p-2 bg-neutral-100 border-t flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditVideo(v)}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-neutral-600 rounded-lg border text-[10px] font-bold"
                        >
                          Edit video details
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(v.id)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MESSAGING & FACEBOOK PAGE */}
      {activeTab === 'whatsapp_fb' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-serif-heading font-black text-neutral-800 text-base flex items-center gap-1.5">
                  <MessageCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
                  <span>WhatsApp Sizing Agent & Template Configs</span>
                </h3>
                <p className="text-xs text-neutral-500">Enable live sizing consults on WhatsApp and predefined message templates.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">WhatsApp Phone (Numbers Only)</label>
                    <input
                      type="text"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      placeholder="919876543210"
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Country Dial Code (e.g. 91)</label>
                    <input
                      type="text"
                      value={whatsappCountry}
                      onChange={(e) => setWhatsappCountry(e.target.value)}
                      placeholder="91"
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Support Sizing Consultant Name</label>
                  <input
                    type="text"
                    value={whatsappName}
                    onChange={(e) => setWhatsappName(e.target.value)}
                    placeholder="Viju Bhai (Founder)"
                    className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Support Sizing Role Label</label>
                    <input
                      type="text"
                      value={whatsappRole}
                      onChange={(e) => setWhatsappRole(e.target.value)}
                      placeholder="Senior Sizing Consultant"
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl"
                    />
                  </div>
                  <div className="pt-1">
                    <AdminImageSelector
                      value={whatsappAvatar}
                      onChange={(url) => setWhatsappAvatar(url)}
                      label="Support Avatar"
                      description="Upload a photo, paste a valid URL, capture, or generate a custom profile picture."
                    />
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3.5">
                  <span className="text-[10px] font-black text-neutral-400 block uppercase tracking-wider">Configure Predefined Chat Templates</span>
                  
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">General Inquiry Predefined Message</label>
                    <input
                      type="text"
                      value={whatsappMsg}
                      onChange={(e) => setWhatsappMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">WhatsApp Default Message</label>
                    <input
                      type="text"
                      value={whatsappDefaultMsg}
                      onChange={(e) => setWhatsappDefaultMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Product Sizing Inquiry Template</label>
                    <textarea
                      value={whatsappInquiryMsg}
                      onChange={(e) => setWhatsappInquiryMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2 rounded-xl text-[11px] h-14"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Instant Order Placement Template</label>
                    <input
                      type="text"
                      value={whatsappOrderMsg}
                      onChange={(e) => setWhatsappOrderMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Support Message Sizing template</label>
                    <input
                      type="text"
                      value={whatsappSupportMsg}
                      onChange={(e) => setWhatsappSupportMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Bulk / Wedding Order Template</label>
                    <input
                      type="text"
                      value={whatsappBulkMsg}
                      onChange={(e) => setWhatsappBulkMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Festival Sizing Greeting Text</label>
                    <input
                      type="text"
                      value={whatsappFestivalMsg}
                      onChange={(e) => setWhatsappFestivalMsg(e.target.value)}
                      className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Business Hours</label>
                      <input
                        type="text"
                        value={whatsappHours}
                        onChange={(e) => setWhatsappHours(e.target.value)}
                        placeholder="10:00 AM - 9:00 PM IST"
                        className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Auto Reply Text</label>
                      <input
                        type="text"
                        value={whatsappAutoReply}
                        onChange={(e) => setWhatsappAutoReply(e.target.value)}
                        className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook Custom fields */}
                <div className="border-t pt-4 mt-2 space-y-3">
                  <h4 className="text-xs font-black text-neutral-800 flex items-center gap-1">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>Facebook Pages Custom Integrations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Facebook Page Name</label>
                      <input
                        type="text"
                        value={fbPageName}
                        onChange={(e) => setFbPageName(e.target.value)}
                        placeholder="Official Store"
                        className="w-full bg-neutral-50 border p-2.5 rounded-xl text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Facebook Page URL</label>
                      <input
                        type="text"
                        value={fbPageUrl}
                        onChange={(e) => setFbPageUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-neutral-50 border p-2.5 rounded-xl font-mono text-[10px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Facebook Page Like URL</label>
                      <input
                        type="text"
                        value={fbFeedEmbed}
                        onChange={(e) => setFbFeedEmbed(e.target.value)}
                        placeholder="https://facebook.com/plugins/..."
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
                  <div className="flex gap-4 text-xs pt-1">
                    <label className="flex items-center gap-1.5 font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={fbLikeEnabled} onChange={(e) => setFbLikeEnabled(e.target.checked)} className="rounded text-[#0B8F63]" />
                      <span>Enable Facebook Like Button</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={fbShareEnabled} onChange={(e) => setFbShareEnabled(e.target.checked)} className="rounded text-[#0B8F63]" />
                      <span>Enable Facebook Share Button</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveSupportAndFB}
                  className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-colors block text-center uppercase tracking-wider"
                >
                  Save Messaging & FB Configs Live
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
                  "Namaste! {whatsappDefaultMsg || 'We can customize any leather Jutis or shoe size for your perfect wedding fit.'} Business hours: {whatsappHours || '10:00 AM - 9:00 PM IST'}."
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

      {/* TAB CONTENT: GEMINI AI BRANDING ASSISTANT */}
      {activeTab === 'ai_assistant' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-6">
            <div className="border-b pb-4 flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="font-serif-heading font-black text-neutral-800 text-base">Gemini AI Social Brand Copilot</h3>
                <p className="text-xs text-neutral-500">Accelerate growth and optimize placements using advanced regional Indian footwear branding insights.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">1. Select AI Marketing Action</label>
                  <select
                    value={aiAction}
                    onChange={(e) => setAiAction(e.target.value as any)}
                    className="w-full bg-neutral-50 border p-3 rounded-xl font-bold text-neutral-800 focus:ring-1 focus:ring-[#0B8F63] outline-none"
                  >
                    <option value="suggest_placement">Suggest Placements for High-CTR</option>
                    <option value="suggest_cta">Suggest Urgency Call-to-Actions (CTAs)</option>
                    <option value="suggest_button_color">Suggest Modern Brand Colors & BG</option>
                    <option value="generate_caption">Generate Engaging Shoe Showcase Caption</option>
                    <option value="generate_promotional">Generate Promo/Discount Post Text</option>
                    <option value="generate_festival">Generate Festive Season Greeting Copy</option>
                    <option value="generate_product_launch">Generate High-Hype Shoe Launch Alert</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">2. Target Platform channel</label>
                  <select
                    value={aiPlatform}
                    onChange={(e) => setAiPlatform(e.target.value)}
                    className="w-full bg-neutral-50 border p-3 rounded-xl focus:ring-1 focus:ring-[#0B8F63] outline-none"
                  >
                    <option value="All">All Platforms (Unified Context)</option>
                    {socialMediaConfig.platforms.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">3. Custom Sizing / Product context (Optional)</label>
                  <textarea
                    value={aiContextInput}
                    onChange={(e) => setAiContextInput(e.target.value)}
                    placeholder="e.g. Traditional leather Mojari, 10% discount coupon JODHPUR10, festival season Jodhpur style..."
                    className="w-full bg-neutral-50 border p-3 rounded-xl h-24 focus:ring-1 focus:ring-[#0B8F63] outline-none resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAskAIAssistant}
                  disabled={aiLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Thinking with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ask AI Copilot</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI response panel */}
              <div className="md:col-span-2 bg-neutral-900 text-neutral-100 p-6 rounded-3xl border border-neutral-800 space-y-4 min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">GEMINI AI REVIEWS OUTCOMES</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[9px] font-bold">MODEL: gemini-3.6-flash</span>
                  </div>

                  {aiResponse ? (
                    <div className="space-y-4 pt-3 text-xs leading-relaxed animate-in fade-in duration-300">
                      <div>
                        <h4 className="font-serif-heading font-black text-amber-100 text-base leading-snug">{aiResponse.title}</h4>
                        <p className="text-neutral-400 text-[11px] mt-1 italic font-medium">"{aiResponse.reasoning}"</p>
                      </div>

                      {aiResponse.caption && (
                        <div className="bg-neutral-800/80 p-4 rounded-2xl border border-neutral-700/50 relative">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiResponse.caption);
                              showToast('Copy to Clipboard success!');
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300 transition-colors"
                            title="Copy Copywriting Copy to Clipboard"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <p className="whitespace-pre-wrap text-neutral-200 leading-relaxed max-h-48 overflow-y-auto pr-6 font-mono text-[11px]">
                            {aiResponse.caption}
                          </p>
                        </div>
                      )}

                      {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider">Strategic Sizing Recommendations:</span>
                          <ul className="space-y-1.5">
                            {aiResponse.suggestions.map((sug: string, idx: number) => (
                              <li key={idx} className="flex gap-2 items-start text-neutral-300">
                                <span className="text-amber-500">✦</span>
                                <div className="flex-1 flex justify-between items-center">
                                  <span>{sug}</span>
                                  {(aiAction === 'suggest_cta') && (
                                    <button
                                      onClick={() => handleApplyAICopyToFields(sug)}
                                      className="ml-2 px-2 py-0.5 bg-neutral-700 hover:bg-[#0B8F63] text-neutral-200 rounded text-[9px] shrink-0 font-bold transition-all"
                                    >
                                      Apply CTA
                                    </button>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiResponse.hexColors && aiResponse.hexColors.length > 0 && (
                        <div className="space-y-2 border-t border-neutral-800 pt-3">
                          <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider">Suggested Colors Palette Swatches:</span>
                          <div className="flex flex-wrap gap-4">
                            {aiResponse.hexColors.map((color: string, cIdx: number) => {
                              const bg = aiResponse.bgColors?.[cIdx] || '#ffffff';
                              return (
                                <div key={cIdx} className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-700">
                                  <div className="w-5 h-5 rounded border border-neutral-600 shadow-xs" style={{ backgroundColor: color }} />
                                  <div className="w-5 h-5 rounded border border-neutral-600 shadow-xs" style={{ backgroundColor: bg }} />
                                  <div className="text-[10px]">
                                    <span className="block font-mono text-neutral-200">{color}</span>
                                    <span className="block font-mono text-neutral-400">{bg}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setEditIconColor(color);
                                      setEditBgColor(bg);
                                      showToast(`Colors copied into platform edit fields: Icon(${color}) / Bg(${bg})`);
                                    }}
                                    className="ml-2 p-1 bg-neutral-700 hover:bg-[#0B8F63] rounded text-neutral-300 transition-colors"
                                    title="Load Colors to Editor"
                                  >
                                    <ColorIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {aiResponse.hashtags && aiResponse.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {aiResponse.hashtags.map((h: string, hIdx: number) => (
                            <span key={hIdx} className="text-amber-500 text-[10px] font-semibold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                      <Sparkles className="w-8 h-8 text-neutral-700 animate-pulse mb-3" />
                      <p className="font-bold">Footwear Strategy Engine Idle</p>
                      <p className="text-[11px] text-neutral-600 max-w-xs mt-1">Select an action and click Ask AI Copilot to generate real-time brand-growth advice.</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-800 pt-3 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="text-amber-500 font-bold">💡 ADVICE:</span>
                  <span>Suggestions include traditional motifs tailored specifically for Pipar City wedding footwear!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
