/**
 * Remove Pause functionality - extracted from opustimeline.js
 * This file documents the logic only. opustimeline.js is unchanged.
 * Original references: opustimeline.js (bundled chunk)
 */

// =============================================================================
// 1. IDENTIFYING PAUSE/SILENCE WORDS
// Source: ~70275-70291 (selector eg - silenceWords)
// =============================================================================

/**
 * Collects all caption text elements that represent silence/pause.
 * A word is a "silence word" if isPauseText(text) returns true
 * (in bundle: c.NZ(e.text) from an imported module).
 *
 * @param {Object} captionTrack - Track with sections[].segments[].content.textElements[]
 * @param {Function} isPauseText - (text) => boolean, e.g. NZ in bundle
 * @returns {Array} Array of text element objects { id, text, timeline: { in, out }, ... }
 */
function getSilenceWords(captionTrack, isPauseText) {
  const words = [];
  if (!captionTrack || !captionTrack.sections) return words;
  for (const section of captionTrack.sections) {
    for (const segment of section.segments || []) {
      const elements = segment.content?.textElements || [];
      for (const el of elements) {
        if (isPauseText(el.text)) words.push(el);
      }
    }
  }
  return words;
}

/**
 * Builds a map: wordId -> true if that word's duration meets the remove threshold.
 * Source: ~70297-70302 (selector ex - matchPauseDurationWordsMap)
 *
 * @param {Array} silenceWords - From getSilenceWords()
 * @param {number} pauseRemoveDurationSeconds - Minimum duration (seconds) to count as removable pause
 * @returns {Object} { [wordId]: boolean }
 */
function getMatchPauseDurationWordsMap(silenceWords, pauseRemoveDurationSeconds) {
  const t = pauseRemoveDurationSeconds;
  return silenceWords.reduce((acc, word) => {
    if (word.id) {
      const durationMs = (word.timeline?.out ?? 0) - (word.timeline?.in ?? 0);
      acc[word.id] = durationMs >= 1000 * t;
    }
    return acc;
  }, {});
}

// =============================================================================
// 2. CLEAN ALL PAUSES (Remove all pauses)
// Source: ~50049-50066 (thunk ev - cleanPauses)
// =============================================================================

/**
 * Gets IDs of all silence words that meet the duration threshold, then
 * removes each one via dropContinuousWords (one word per batch).
 *
 * @param {Object} getState - () => state
 * @param {Function} getSilenceWordsFromState - (state) => silenceWords array
 * @param {number} pauseRemoveDurationSeconds - Optional threshold in seconds
 * @param {Function} dropContinuousWords - (getState, dispatch, batches) => void
 * @param {Object} sideEffects - { analytics, closePanel, toast, nps, takeSnapshot, warning }
 */
function cleanPauses(getState, getSilenceWordsFromState, pauseRemoveDurationSeconds, dropContinuousWords, sideEffects) {
  const silenceWords = getSilenceWordsFromState(getState());
  const thresholdSec = pauseRemoveDurationSeconds;
  const ids = silenceWords
    .filter((w) => !thresholdSec || ((w.timeline?.out ?? 0) - (w.timeline?.in ?? 0) >= 1000 * thresholdSec))
    .map((w) => w.id);

  if (ids.length === 0) {
    if (sideEffects.warning) sideEffects.warning("no_silences_or_pauses_found");
    return;
  }

  // One batch per word, reverse order (original: o.reverse().map(e => [e]))
  const batches = ids.reverse().map((id) => [id]);
  dropContinuousWords(getState, sideEffects.dispatch, batches);

  if (sideEffects.analytics) sideEffects.analytics("editor.pause.remove", {});
  if (sideEffects.closePanel) sideEffects.closePanel();
  if (sideEffects.toast) sideEffects.toast("silence_frames_removed", { count: ids.length });
  if (sideEffects.nps) sideEffects.nps("RemovePauses");
  if (sideEffects.takeSnapshot) sideEffects.takeSnapshot();
}

// =============================================================================
// 3. SINGLE-WORD REMOVE PAUSE (Remove pause button on word)
// Source: ~46916-46933 (handler tU) - same as "Remove caption & video"
// =============================================================================

/**
 * Removes the selected word(s) from caption/keyframe/voice (used for both
 * "Remove pause" and "Remove caption & video"). Filters to words that
 * pass the filter (e.g. l.s in bundle - only certain word ids).
 *
 * @param {Object} getState - () => state
 * @param {Array} wordsToRemove - Array of word objects { id, ... }
 * @param {Function} wordIdFilter - (id) => boolean - which word ids are allowed to remove
 * @param {Function} dropContinuousWords - (getState, dispatch, batches) => void
 * @param {Object} sideEffects - { takeSnapshot, analytics }
 */
function removeSelectedWordsAsPause(getState, wordsToRemove, wordIdFilter, dropContinuousWords, sideEffects) {
  const ids = wordsToRemove.map((w) => w.id).filter(wordIdFilter);
  if (ids.length === 0) return;

  const batches = [ids];
  dropContinuousWords(getState, sideEffects.dispatch, batches);

  if (sideEffects.analytics) sideEffects.analytics("editor.caption.operation", { firstOperation: "Remove caption & video" });
  if (sideEffects.takeSnapshot) sideEffects.takeSnapshot();
}

// =============================================================================
// 4. DROP CONTINUOUS WORDS (core removal logic)
// Source: ~49620-49667 (thunk Y - dropContinuousWords)
// =============================================================================

/**
 * Removes batches of word ids from caption track, keyframe track, and voice
 * enhancement track. Each batch is an array of consecutive word ids [firstId, ..., lastId].
 *
 * Expects from state/store:
 *   - captionTrackInstance (with textMap, sections, split(), findSectionByTime(), reCompactTimeline())
 *   - keyFrameTrackInstance (sections, split(), findSectionByTime(), reCompactTimeline())
 *   - voiceEnhancementTrackInstance (optional; findSectionByTime(), split(), delete(), reCompactTimeline())
 *   - captionWordIds (array of { textIds } per section index)
 *
 * Expects injected:
 *   - deleteSegmentsAndReturn(midpointMs, captionTrackInstance)
 *   - onDeleteCallback(midpointMs) - e.g. for voice section cleanup
 *
 * @param {Function} getState - () => state
 * @param {Function} dispatch - Redux dispatch
 * @param {Array<Array<string>>} batches - Array of arrays of word ids, e.g. [["id1"], ["id2","id3"]]
 */
function dropContinuousWords(getState, dispatch, batches) {
  const state = getState();
  const captionTrackInstance = state.captionTrackInstance;
  const keyFrameTrackInstance = state.keyFrameTrackInstance;
  const voiceEnhancementTrackInstance = state.voiceEnhancementTrackInstance;
  const captionWordIds = state.captionWordIds || [];

  if (!captionTrackInstance || !keyFrameTrackInstance) return;

  const r = captionTrackInstance;
  const a = keyFrameTrackInstance;
  const l = voiceEnhancementTrackInstance;
  const s = captionWordIds;

  for (const batch of batches) {
    const firstId = batch[0];
    const lastId = batch[batch.length - 1];
    if (!firstId || !lastId) continue;

    const p = r.textMap.get(firstId);
    const f = r.textMap.get(lastId);
    if (!p || !f) continue;

    const m0 = p.timeRange.timelineIn;
    const m1 = f.timeRange.timelineOut;
    const h = (m0 + m1) / 2;
    const sectionFirst = p.parent.parent.parent;
    const sectionLast = f.parent.parent.parent;

    if (sectionFirst.id === sectionLast.id && s[sectionFirst.index].textIds.length === batch.length) {
      // Whole section is being removed
      // t.deleteSegmentsAndReturn(h, r), o(h), and delete voice section at h
      if (typeof state.deleteSegmentsAndReturn === "function") state.deleteSegmentsAndReturn(h, r);
      if (typeof state.onDeleteSegment === "function") state.onDeleteSegment(h);
      if (l) {
        const voiceSection = l.findSectionByTime(h);
        if (voiceSection) voiceSection.delete();
      }
    } else {
      // Partial section: split at boundaries, delete segment at midpoint
      const idxFirst = s[sectionFirst.index].textIds.indexOf(firstId);
      const idxLast = s[sectionFirst.index].textIds.indexOf(lastId);
      let o = m0;
      let c = m1;
      const keyframeSection = a.sections.find(
        (sec) => sec.timeRange.timelineIn <= o && sec.timeRange.timelineOut >= c
      );
      if (keyframeSection) {
        if (idxFirst === 0) o = keyframeSection.timeRange.timelineIn;
        if (idxLast === s[sectionFirst.index].textIds.length - 1) c = keyframeSection.timeRange.timelineOut;
      }
      const mid = (o + c) / 2;

      r.split(o);
      r.split(c);
      const captionSeg = r.findSectionByTime(mid);
      if (captionSeg) captionSeg.delete();

      a.split(o);
      a.split(c);
      const keyframeSeg = a.findSectionByTime(mid);
      if (keyframeSeg) keyframeSeg.delete();

      if (l) {
        l.split(o);
        l.split(c);
        const voiceSeg = l.findSectionByTime(mid);
        if (voiceSeg) voiceSeg.delete();
      }
    }
  }

  if (r.reCompactTimeline) r.reCompactTimeline();
  if (a.reCompactTimeline) a.reCompactTimeline();
  if (l && l.reCompactTimeline) l.reCompactTimeline();
}

// =============================================================================
// 5. UI: WORD STYLING WHEN IN "REMOVE PAUSES" MODE
// Source: ~45344-45355 (component ed - word display)
// =============================================================================

/**
 * Determines if a word should be shown as a "pause" (e.g. dark bg #525255)
 * when the AI enhance menu is "RemovePauses".
 *
 * @param {string} wordId
 * @param {Object} matchPauseDurationWordsMap - From getMatchPauseDurationWordsMap()
 * @param {string} secondaryMenuTypeForAiEnhance - e.g. "RemovePauses"
 * @returns {boolean}
 */
function isWordHighlightedAsPause(wordId, matchPauseDurationWordsMap, secondaryMenuTypeForAiEnhance) {
  return !!(
    wordId &&
    matchPauseDurationWordsMap[wordId] &&
    secondaryMenuTypeForAiEnhance === "RemovePauses"
  );
}

// =============================================================================
// EXPORTS (for reference; adjust for your module system)
// =============================================================================

module.exports = {
  getSilenceWords,
  getMatchPauseDurationWordsMap,
  cleanPauses,
  removeSelectedWordsAsPause,
  dropContinuousWords,
  isWordHighlightedAsPause,
};
