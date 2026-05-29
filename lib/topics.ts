/** Shared helpers for item↔topic assignment (used by API route handlers). */

export type TopicAssignment = { topicId: string; episodeOrder: number | null };

/**
 * Normalise a topics payload coming from the client. Accepts either a plain
 * array of topic-id strings, or an array of { topicId, episodeOrder } objects.
 * De-duplicates by topicId and drops invalid entries.
 */
export function parseTopics(raw: unknown): TopicAssignment[] {
  if (!Array.isArray(raw)) return [];
  const out: TopicAssignment[] = [];
  const seen = new Set<string>();
  for (const entry of raw) {
    let topicId = "";
    let episodeOrder: number | null = null;
    if (typeof entry === "string") {
      topicId = entry;
    } else if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      topicId = typeof e.topicId === "string" ? e.topicId : "";
      if (e.episodeOrder != null && Number.isFinite(Number(e.episodeOrder))) {
        episodeOrder = Number(e.episodeOrder);
      }
    }
    if (!topicId || seen.has(topicId)) continue;
    seen.add(topicId);
    out.push({ topicId, episodeOrder });
  }
  return out;
}
