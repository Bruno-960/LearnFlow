import { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getWatchUrl } from '../lib/youtube';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYoutubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return apiPromise;
}

type VideoPlayerModalProps = {
  youtubeId: string;
  title: string;
  onClose: () => void;
  onEnded: () => void;
};

export default function VideoPlayerModal({ youtubeId, title, onClose, onEnded }: VideoPlayerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const elementId = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);

  // Guarda sempre a versão mais recente de onEnded, sem forçar o player a recriar
  // toda vez que o componente pai renderiza de novo.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;
    loadYoutubeApi().then(() => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new window.YT.Player(elementId.current, {
        videoId: youtubeId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event: any) => {
            if (event.data === 0) onEndedRef.current();
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
    // Só recria o player se o vídeo mudar de verdade — não a cada re-render do pai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-4xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-foreground font-medium truncate pr-4">{title}</h2>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={getWatchUrl(youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Abrir no YouTube <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground" type="button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="aspect-video bg-black">
          <div ref={containerRef} id={elementId.current} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
