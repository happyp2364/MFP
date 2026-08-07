import React, { useEffect, useState } from 'react';
import {
  Instagram,
  Heart,
  MessageCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Play,
  RefreshCw,
  Video,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { InstagramProfile, InstagramMediaItem } from '../../types';

export const InstagramFeed: React.FC = () => {
  const { storeInfo, instagramConfig } = useStore();

  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [posts, setPosts] = useState<InstagramMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const instagramUrl = `https://www.instagram.com/${instagramConfig?.username || 'official_store'}/`;

  const fetchFeedData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const limit = instagramConfig?.postLimit || 8;
      const res = await fetch(`/api/instagram/feed?limit=${limit}`);
      const data = await res.json();

      if (data.success) {
        if (data.profile) setProfile(data.profile);
        if (data.posts && Array.isArray(data.posts)) setPosts(data.posts);
      }
    } catch (err) {
      console.warn('Failed to fetch live Instagram feed, using fallback profile:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (instagramConfig?.enabled !== false) {
      fetchFeedData();
    }
  }, [instagramConfig?.enabled, instagramConfig?.postLimit, instagramConfig?.username]);

  if (instagramConfig?.enabled === false) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <section id="instagram-feed" className="py-16 sm:py-20 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 text-white relative overflow-hidden">
      {/* Ambient Radial Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0B8F63]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Instagram Live Profile Header Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 mb-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Profile Picture with Gradient Ring */}
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center">
                {profile?.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt={`${profile.displayName || 'Store'} Instagram`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                ) : (
                  <Instagram className="w-10 h-10 text-rose-400" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full text-white shadow-md">
                <Instagram className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-bold font-serif-heading text-white">
                  @{profile?.username || instagramConfig?.username || 'official_store'}
                </h3>
                <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                {profile?.isLiveApiConnected && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Meta Feed
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-amber-400/90 mt-0.5">
                {profile?.displayName || instagramConfig?.displayName || 'Official Store'} • Official Footwear & Fashion Hub
              </p>

              {/* Bio Section */}
              {instagramConfig?.showBio !== false && (profile?.biography || true) && (
                <p className="text-xs text-neutral-300 mt-2 max-w-2xl leading-relaxed">
                  {profile?.biography ||
                    'Step into Royalty & Comfort 👞 Exclusive Footwear & Fashion Hub • Handcrafted Juttis, Sports Sneakers & Leather Wear • Worldwide Shipping 📦'}
                </p>
              )}

              {/* Profile Stats */}
              {instagramConfig?.showStats !== false && (
                <div className="flex items-center justify-center sm:justify-start gap-5 sm:gap-8 mt-3 text-xs sm:text-sm pt-2 border-t border-white/5">
                  <div>
                    <span className="font-extrabold text-white">{profile?.postsCount || '1,240+'}</span>{' '}
                    <span className="text-neutral-400">Posts</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-white">{profile?.followersCount || '18.5K'}</span>{' '}
                    <span className="text-neutral-400">Followers</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-white">Official</span>{' '}
                    <span className="text-neutral-400">Main Store</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Official Follow Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => fetchFeedData(true)}
              disabled={isRefreshing}
              title="Refresh Instagram Feed"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-180 duration-500 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-sm font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow @{profile?.username || 'official_store'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Section Heading Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0B8F63] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Live Customer Wear & Latest Drops</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-heading mt-1">
              Follow Us On Instagram
            </h2>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>View All Live Content</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Posts Rendering Grid / Carousel / Masonry */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, instagramConfig?.postLimit || 8).map((i) => (
              <div key={i} className="bg-neutral-800 rounded-2xl aspect-square border border-white/10" />
            ))}
          </div>
        ) : (
          <div
            className={
              instagramConfig?.layout === 'carousel'
                ? 'flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-700'
                : instagramConfig?.layout === 'masonry'
                ? 'columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4'
                : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
            }
          >
            {posts.slice(0, instagramConfig?.postLimit || 8).map((post) => (
              <a
                key={post.id}
                href={post.permalink || instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative rounded-2xl overflow-hidden bg-neutral-800 border border-white/10 shadow-md hover:shadow-2xl hover:border-rose-500/50 transition-all duration-300 block ${
                  instagramConfig?.layout === 'carousel' ? 'w-64 sm:w-72 shrink-0 aspect-square' : ''
                } ${instagramConfig?.layout === 'masonry' ? 'break-inside-avoid' : 'aspect-square'}`}
              >
                {/* Media Image or Video Thumbnail */}
                <img
                  src={post.mediaUrl || post.thumbnailUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Video / Reel Indicator */}
                {post.mediaType === 'VIDEO' && (
                  <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white p-1.5 rounded-full border border-white/20 z-10">
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </span>
                )}

                {/* Top Category Badge */}
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-white/10 z-10">
                  {post.category || (post.mediaType === 'VIDEO' ? 'Reel' : 'New Drop')}
                </span>

                {/* Hover Dark Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-center gap-5 mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      {formatNumber(post.likeCount)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                      <MessageCircle className="w-4 h-4 fill-sky-400 text-sky-400" />
                      {formatNumber(post.commentsCount)}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-neutral-200 line-clamp-2 leading-snug text-center">
                    {post.caption}
                  </p>

                  <div className="mt-3 text-[11px] text-rose-300 font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <span>View Post On Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
