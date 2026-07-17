import { useState, useEffect } from 'react';
import { Plus, Loader2, X as XIcon } from 'lucide-react';
import VideoCard from '../../components/VideoCard';
import VideoPlayerModal from '../../components/VideoPlayerModal';
import { extractYoutubeId, fetchYoutubeTitle, getThumbnailUrl } from '../../lib/youtube';
import { supabase } from '../../supabase';

type Video = {
  id: string;
  youtube_id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
};

type ProgressItem = {
  video_id: string;
  watched: boolean;
};

type PendingVideo = {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  status: 'loading' | 'ready' | 'duplicate';
  titleFailed: boolean;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [watchedSet, setWatchedSet] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState<{
    youtubeId: string;
    videoId: string;
    title: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);
  const [invalidLines, setInvalidLines] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        setLoading(false);
        setError('Cliente Supabase não disponível.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const isAdminUser = user?.app_metadata?.role === 'admin';
      setIsAdmin(isAdminUser);

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .order('order', { ascending: true });

      setVideos(videosData || []);

      if (user) {
        const { data: progressData } = await supabase
          .from('video_progress')
          .select('video_id, watched')
          .eq('user_id', user.id);

        const watched = new Set<string>(
          (progressData || [])
            .filter((p: ProgressItem) => p.watched)
            .map((p: ProgressItem) => p.video_id)
        );
        setWatchedSet(watched);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  function handlePlay(youtubeId: string, videoId: string) {
    const video = videos.find((v) => v.id === videoId);
    setPlaying({ youtubeId, videoId, title: video?.title || '' });
  }

  async function handleEnded() {
    if (!playing) return;
    if (watchedSet.has(playing.videoId)) return;
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: upsertError } = await supabase
      .from('video_progress')
      .upsert(
        {
          user_id: user.id,
          video_id: playing.videoId,
          watched: true,
          watched_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,video_id' }
      );

    if (!upsertError) {
      setWatchedSet((prev) => new Set(prev).add(playing.videoId));
    }
  }

  // Processa o texto colado: uma URL por linha, extrai o ID de cada uma,
  // busca o título automaticamente e monta a lista de revisão antes de salvar.
  async function handleProcessLinks() {
    setError('');
    setInvalidLines([]);
    setProcessing(true);

    const lines = bulkInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const existingIds = new Set(videos.map((v) => v.youtube_id));
    const seenInBatch = new Set<string>();
    const invalids: string[] = [];
    const toResolve: { line: string; id: string }[] = [];

    for (const line of lines) {
      const id = extractYoutubeId(line);
      if (!id) {
        invalids.push(line);
        continue;
      }
      if (existingIds.has(id) || seenInBatch.has(id)) {
        continue; // duplicado — ignora silenciosamente, não é erro
      }
      seenInBatch.add(id);
      toResolve.push({ line, id });
    }

    setInvalidLines(invalids);

    if (toResolve.length === 0) {
      setProcessing(false);
      if (invalids.length === 0) {
        setError('Nenhum link novo encontrado (todos já estão na lista ou o campo estava vazio).');
      }
      return;
    }

    // Mostra a lista já com status "loading" enquanto busca os títulos
    setPendingVideos(
      toResolve.map(({ id }) => ({
        youtubeId: id,
        title: '',
        thumbnailUrl: getThumbnailUrl(id, 'hqdefault'),
        status: 'loading',
        titleFailed: false,
      }))
    );

    const resolved = await Promise.all(
      toResolve.map(async ({ id }) => {
        const title = await fetchYoutubeTitle(id);
        return {
          youtubeId: id,
          title: title || '',
          titleFailed: !title,
          thumbnailUrl: getThumbnailUrl(id, 'hqdefault'),
          status: 'ready' as const,
        };
      })
    );

    setPendingVideos(resolved);
    setProcessing(false);
  }

  function updatePendingTitle(youtubeId: string, newTitle: string) {
    setPendingVideos((prev) =>
      prev.map((v) => (v.youtubeId === youtubeId ? { ...v, title: newTitle } : v))
    );
  }

  function removePending(youtubeId: string) {
    setPendingVideos((prev) => prev.filter((v) => v.youtubeId !== youtubeId));
  }

  async function handleSaveAll() {
    if (!supabase || pendingVideos.length === 0) return;

    const missingTitles = pendingVideos.filter((v) => !v.title.trim());
    if (missingTitles.length > 0) {
      setError(
        `${missingTitles.length} vídeo(s) sem título preenchido — corrija os campos destacados em vermelho antes de salvar.`
      );
      return;
    }

    setSaving(true);
    setError('');

    const rows = pendingVideos.map((v) => ({
      youtube_id: v.youtubeId,
      title: v.title.trim(),
    }));

    const { data, error: insertError } = await supabase
      .from('videos')
      .insert(rows)
      .select();

    setSaving(false);

    if (insertError) {
      setError('Não foi possível salvar os vídeos. Verifique se você tem permissão de admin.');
      return;
    }

    setVideos((prev) => [...prev, ...(data || [])]);
    setPendingVideos([]);
    setBulkInput('');
    setInvalidLines([]);
    setShowAddForm(false);
  }

  if (loading) {
    return <div className="p-8 text-foreground">Carregando...</div>;
  }

  return (
    <div className="p-3 md:p-5 xl:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vídeos</h1>
          <p className="text-muted-foreground text-sm">
            Assista e acompanhe seu progresso em vídeo-aulas.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2 rounded-lg"
            type="button"
          >
            <Plus className="w-4 h-4" /> Adicionar vídeos
          </button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-card space-y-3">
          <p className="text-sm text-muted-foreground">
            Cole um ou vários links do YouTube, um por linha. O título de cada vídeo é buscado automaticamente.
          </p>
          <textarea
            placeholder={'https://www.youtube.com/watch?v=...\nhttps://youtu.be/...\nhttps://www.youtube.com/live/...'}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            rows={5}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground font-mono"
          />

          {invalidLines.length > 0 && (
            <div className="text-xs text-red-500">
              {invalidLines.length} linha(s) não reconhecida(s) como link do YouTube:
              <ul className="list-disc list-inside mt-1">
                {invalidLines.map((line, i) => (
                  <li key={i} className="truncate">{line}</li>
                ))}
              </ul>
            </div>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleProcessLinks}
            disabled={processing || !bulkInput.trim()}
            type="button"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm px-4 py-2 rounded-lg"
          >
            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
            Buscar títulos
          </button>

          {pendingVideos.length > 0 && (
            <div className="mt-4 border-2 border-dashed border-primary/40 rounded-lg p-3 space-y-3 bg-primary/5">
              <p className="text-sm text-foreground font-medium flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide bg-primary/20 text-primary px-2 py-0.5 rounded">
                  Rascunho — ainda não salvo
                </span>
                Revise antes de salvar ({pendingVideos.length} vídeo{pendingVideos.length === 1 ? '' : 's'}):
              </p>
              {pendingVideos.map((v) => {
                const needsAttention = v.status === 'ready' && !v.title.trim();
                return (
                  <div key={v.youtubeId} className="flex items-start gap-3 bg-muted rounded-lg p-2">
                    <img src={v.thumbnailUrl} alt="" className="w-20 aspect-video object-cover rounded shrink-0" />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={v.status === 'loading' ? 'Buscando título...' : v.title}
                        disabled={v.status === 'loading'}
                        onChange={(e) => updatePendingTitle(v.youtubeId, e.target.value)}
                        placeholder={needsAttention ? 'Título não encontrado — digite manualmente' : ''}
                        className={`w-full bg-background border rounded px-2 py-1 text-sm text-foreground ${
                          needsAttention
                            ? 'border-red-500 focus:outline-red-500'
                            : 'border-border'
                        }`}
                      />
                      {needsAttention && (
                        <p className="text-xs text-red-500 mt-1">
                          Não foi possível buscar o título automaticamente — preencha antes de salvar.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removePending(v.youtubeId)}
                      type="button"
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={handleSaveAll}
                disabled={saving || pendingVideos.some((v) => v.status === 'loading')}
                type="button"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm px-4 py-2 rounded-lg"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar {pendingVideos.length} vídeo{pendingVideos.length === 1 ? '' : 's'}
              </button>
            </div>
          )}
        </div>
      )}

      {videos.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum vídeo adicionado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              watched={watchedSet.has(video.id)}
              onPlay={handlePlay}
            />
          ))}
        </div>
      )}

      {playing && (
        <VideoPlayerModal
          youtubeId={playing.youtubeId}
          title={playing.title}
          onClose={() => setPlaying(null)}
          onEnded={handleEnded}
        />
      )}
    </div>
  );
}
