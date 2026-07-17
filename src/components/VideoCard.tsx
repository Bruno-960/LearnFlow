import { useState } from 'react';
import { PlayCircle, ExternalLink } from 'lucide-react';
import { getThumbnailUrl, getWatchUrl } from '../lib/youtube';

type VideoCardProps = {
  video: {
    id: string;
    youtube_id: string;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
  };
  watched?: boolean;
  onPlay: (youtubeId: string, videoId: string) => void;
};

// Ordem de fallback: maxres (16:9 real, alta resolução) -> hq (4:3, sempre existe) -> mq (16:9, sempre existe)
const FALLBACK_ORDER: Array<'maxresdefault' | 'hqdefault' | 'mqdefault'> = [
  'maxresdefault',
  'hqdefault',
  'mqdefault',
];

export default function VideoCard({ video, watched, onPlay }: VideoCardProps) {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const thumb =
    video.thumbnail_url || getThumbnailUrl(video.youtube_id, FALLBACK_ORDER[fallbackIndex]);

  function handleImageError() {
    setFallbackIndex((prev) => Math.min(prev + 1, FALLBACK_ORDER.length - 1));
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => onPlay(video.youtube_id, video.id)}
        className="relative w-full aspect-video group bg-muted"
        type="button"
      >
        <img
          src={thumb}
          alt={video.title}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <PlayCircle className="w-12 h-12 text-white/90" />
        </div>
        {watched && (
          <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Assistido
          </span>
        )}
      </button>

      <div className="p-4">
        <h3 className="text-foreground font-medium text-sm mb-1 line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{video.description}</p>
        )}
        <a
          href={getWatchUrl(video.youtube_id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
          onClick={(e) => e.stopPropagation()}
        >
          Assistir no YouTube
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
