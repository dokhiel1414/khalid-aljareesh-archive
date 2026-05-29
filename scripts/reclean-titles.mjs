// DEPRECATED — DO NOT RUN.
//
// This script used to read the manifests and overwrite every item's title
// in the DB from the original Drive filename. It was a one-shot fix for a
// regex bug that ate spaces. Re-running it now would WIPE every title edit
// the admin made in the dashboard, which is exactly the bug we just fixed.
//
// If you really need to regenerate a single item's title, do it from the
// dashboard's Edit modal. The bulk-import scripts (import-audio.mjs,
// import-video.mjs) are safe — they only create NEW items and respect
// admin deletions via the DeletedDriveItem tombstone table.

console.error(
  "reclean-titles.mjs is disabled — admin edits in the dashboard " +
  "are the source of truth. Edit individual items via the dashboard instead.",
);
process.exit(1);
