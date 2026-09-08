const UNDO_KEY = 'kuliahplanner_undo_stack';
const MAX_UNDO = 10;

/**
 * pushSnapshot(label, currentData)
 * Pushes a snapshot of current data before destructive actions into localStorage.
 * Gracefully handles storage quota limits by dropping older snapshots.
 */
export const pushSnapshot = (label, currentData) => {
  try {
    if (!currentData) return;

    const raw = localStorage.getItem(UNDO_KEY);
    const stack = raw ? JSON.parse(raw) : [];

    const snapshot = {
      id: Date.now(),
      timestamp: Date.now(),
      label: label || 'Perubahan data',
      data: {
        config: currentData.config,
        courses: currentData.courses,
        stashes: currentData.stashes,
        reschedules: currentData.reschedules,
        tasks: currentData.tasks,
      },
    };

    stack.unshift(snapshot);

    while (stack.length > MAX_UNDO) {
      stack.pop();
    }

    // Try saving, drop oldest items if quota exceeded
    let saved = false;
    while (!saved && stack.length > 0) {
      try {
        localStorage.setItem(UNDO_KEY, JSON.stringify(stack));
        saved = true;
      } catch (err) {
        const isQuota = err instanceof DOMException && (err.code === 22 || err.name === 'QuotaExceededError');
        if (isQuota && stack.length > 1) {
          stack.pop(); // drop oldest snapshot
        } else {
          console.warn('Unable to persist undo snapshot to localStorage:', err);
          break;
        }
      }
    }
  } catch (err) {
    console.error('Failed to push undo snapshot:', err);
  }
};

/**
 * popSnapshot()
 * Retrieves the most recent snapshot and removes it from the undo stack.
 * Returns the snapshot object or null if stack is empty.
 */
export const popSnapshot = () => {
  try {
    const raw = localStorage.getItem(UNDO_KEY);
    if (!raw) return null;
    const stack = JSON.parse(raw);
    if (!Array.isArray(stack) || stack.length === 0) return null;

    const snapshot = stack.shift();
    localStorage.setItem(UNDO_KEY, JSON.stringify(stack));
    return snapshot;
  } catch (err) {
    console.error('Failed to pop undo snapshot:', err);
    return null;
  }
};

/**
 * peekSnapshot()
 * Views the most recent snapshot without removing it.
 */
export const peekSnapshot = () => {
  try {
    const raw = localStorage.getItem(UNDO_KEY);
    if (!raw) return null;
    const stack = JSON.parse(raw);
    return Array.isArray(stack) && stack.length > 0 ? stack[0] : null;
  } catch {
    return null;
  }
};

/**
 * getUndoCount()
 * Returns the number of snapshots available to undo.
 */
export const getUndoCount = () => {
  try {
    const raw = localStorage.getItem(UNDO_KEY);
    if (!raw) return 0;
    const stack = JSON.parse(raw);
    return Array.isArray(stack) ? stack.length : 0;
  } catch {
    return 0;
  }
};

/**
 * getUndoHistory()
 * Returns lightweight metadata of current undo stack for UI display.
 */
export const getUndoHistory = () => {
  try {
    const raw = localStorage.getItem(UNDO_KEY);
    if (!raw) return [];
    const stack = JSON.parse(raw);
    if (!Array.isArray(stack)) return [];
    return stack.map(({ id, timestamp, label }) => ({ id, timestamp, label }));
  } catch {
    return [];
  }
};

/**
 * clearUndoHistory()
 * Clears the undo stack completely.
 */
export const clearUndoHistory = () => {
  try {
    localStorage.removeItem(UNDO_KEY);
  } catch (err) {
    console.error('Failed to clear undo history:', err);
  }
};
