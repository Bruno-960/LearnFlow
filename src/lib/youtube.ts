// Extrai o ID de 11 caracteres de qualquer variação de URL do YouTube,
// usando parsing de URL de verdade em vez de uma lista crescente de regex.
export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();

  // Usuário colou só o ID puro
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    const segments = url.pathname.split('/').filter(Boolean);
    if (['embed', 'shorts', 'live'].includes(segments[0]) && segments[1]) {
      const id = segments[1];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
  }

  return null;
}

export function getThumbnailUrl(
  youtubeId: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' = 'maxresdefault'
): string {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}

export function getWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function getEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
}

// Busca o título real do vídeo via oEmbed público do YouTube — sem precisar de API key.
// Retorna null se o vídeo for privado, removido, ou a busca falhar.
export async function fetchYoutubeTitle(youtubeId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(getWatchUrl(youtubeId))}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.title === 'string' ? data.title : null;
  } catch {
    return null;
  }
}
