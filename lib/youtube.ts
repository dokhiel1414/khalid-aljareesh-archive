// Helpers for YouTube video links (watch / youtu.be / embed / shorts).

const YT_RE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/** Extract the 11-char YouTube video id from a URL (or null). */
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const m = input.match(YT_RE);
  return m?.[1] ?? null;
}

export const isYouTube = (input?: string | null) => !!extractYouTubeId(input);

export function youtubeEmbedUrl(idOrUrl?: string | null): string | null {
  const id = extractYouTubeId(idOrUrl) ?? (idOrUrl && /^[A-Za-z0-9_-]{11}$/.test(idOrUrl) ? idOrUrl : null);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function youtubeThumb(idOrUrl?: string | null): string | null {
  const id = extractYouTubeId(idOrUrl) ?? (idOrUrl && /^[A-Za-z0-9_-]{11}$/.test(idOrUrl) ? idOrUrl : null);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
