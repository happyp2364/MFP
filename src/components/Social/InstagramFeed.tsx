import React from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: string;
  comments: string;
  caption: string;
  category: string;
}

export const InstagramFeed: React.FC = () => {
  const { storeInfo } = useStore();

  const posts: InstagramPost[] = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
      likes: '1.2K',
      comments: '84',
      caption: 'Step into royal elegance with our latest Marudhar Sports Edition! 👟✨ #MarudharFashionPoint #Piparcity',
      category: 'Sneakers',
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
      likes: '950',
      comments: '62',
      caption: 'Men\'s Genuine Leather Casual Loafers. Designed for extreme comfort and longevity. 👞🔥',
      category: 'Leather',
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
      likes: '1.8K',
      comments: '112',
      caption: 'Women\'s High-Performance Sports & Running Shoes! Cloud-foam soles for extreme comfort. 👟💖',
      category: 'Sports',
    },
    {
      id: '4',
      imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
      likes: '820',
      comments: '45',
      caption: 'Light-up LED Sports Shoes for Kids! Durable, flexible & fun. 🧒⚡',
      category: 'Kids Wear',
    },
    {
      id: '5',
      imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80',
      likes: '2.1K',
      comments: '150',
      caption: 'Rajasthani Handcrafted Juttis for Wedding Season. Pure royal vibes! 👑✨',
      category: 'Ethnic',
    },
    {
      id: '6',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      likes: '1.4K',
      comments: '98',
      caption: 'Fresh Batch of Breathable Mesh Running Shoes arrived in Pipar City store! 🏃‍♂️⚡',
      category: 'New Drop',
    },
  ];

  return (
    <section id="instagram-feed" className="py-16 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 text-white relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0B8F63]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Instagram Profile Header Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 mb-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Profile Picture with Gradient Ring */}
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-lg">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-neutral-900 bg-neutral-800 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=200&q=80"
                  alt="Marudhar Fashion Point Instagram"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-0 right-0 p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-full text-white shadow-md">
                <Instagram className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-2xl font-bold font-serif-heading text-white">
                  @marudhar_fashion_point
                </h3>
                <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Marudhar Fashion Point • Official Footwear & Fashion Hub
              </p>
              
              {/* Profile Stats */}
              <div className="flex items-center gap-4 sm:gap-6 mt-3 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-white">1,240+</span>{' '}
                  <span className="text-neutral-400">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-white">18.5K</span>{' '}
                  <span className="text-neutral-400">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-white">Pipar City</span>{' '}
                  <span className="text-neutral-400">Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <a
            href={storeInfo.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Instagram className="w-5 h-5" />
            <span>Follow on Instagram</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0B8F63] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real Customer Stories & Style Drops</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif-heading mt-1">
              Follow Us On Instagram
            </h2>
          </div>
          <a
            href={storeInfo.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>View All Posts</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Instagram Posts Grid & Horizontal Slider */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={storeInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden bg-neutral-800 aspect-square border border-white/10 shadow-md hover:shadow-2xl hover:border-rose-500/50 transition-all duration-300"
            >
              {/* Post Image */}
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Top Tag Badge */}
              <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 z-10">
                {post.category}
              </span>

              {/* Hover Dark Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end text-white">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-sky-400">
                    <MessageCircle className="w-4 h-4 fill-sky-400 text-sky-400" />
                    {post.comments}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-neutral-200 line-clamp-2 leading-tight">
                  {post.caption}
                </p>
                <div className="mt-2 text-[10px] text-rose-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>View Post</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
