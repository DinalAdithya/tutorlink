/**
 * External Linking Service
 * Handles safe external URL opening (Google Meet, Zoom) with clipboard copy fallback
 * Compatible with React Native (Linking.canOpenURL / Linking.openURL) and Web (window.open)
 */

export interface OpenLinkResult {
  success: boolean;
  copied?: boolean;
  error?: string;
}

/**
 * Copies text to user's clipboard safely across web and mobile
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Web fallback for environments without clipboard API
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
    return false;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Validates that an external meeting URL is secure https
 */
export function isValidMeetingUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Opens an external meeting link safely (e.g. Google Meet or Zoom)
 * Uses Linking.canOpenURL and Linking.openURL in React Native / Expo,
 * or window.open in Web. If opening fails, automatically copies link to clipboard
 * and alerts or notifies the user.
 */
export async function openExternalMeetingLink(
  url: string,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<OpenLinkResult> {
  if (!url) {
    onFeedback?.('No meeting link available.', true);
    return { success: false, error: 'No meeting link provided' };
  }

  const cleanUrl = url.trim();

  if (!isValidMeetingUrl(cleanUrl)) {
    onFeedback?.('Invalid meeting URL. Link must start with https://', true);
    return { success: false, error: 'Invalid URL scheme' };
  }

  // Check if React Native Linking is available in current environment
  const rnLinking = (globalThis as any).ReactNative?.Linking || (globalThis as any).Linking;
  if (rnLinking && typeof rnLinking.canOpenURL === 'function') {
    try {
      const supported = await rnLinking.canOpenURL(cleanUrl);
      if (supported) {
        await rnLinking.openURL(cleanUrl);
        onFeedback?.('Opening meeting room...');
        return { success: true };
      }
    } catch (rnErr) {
      console.warn('React Native Linking failed, trying fallback:', rnErr);
    }
  }

  try {
    // Web environment: open external tab safely
    if (typeof window !== 'undefined') {
      const win = window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Popup was blocked or restricted by browser iframe sandbox
        const copied = await copyToClipboard(cleanUrl);
        const msg = copied
          ? "Couldn't open link automatically. Meeting link copied to clipboard!"
          : "Couldn't open link. Please copy and paste: " + cleanUrl;
        onFeedback?.(msg, true);
        return { success: false, copied, error: 'Popup blocked' };
      }
    }

    onFeedback?.('Opening meeting room...');
    return { success: true };
  } catch (err) {
    console.warn('Failed to open external URL, falling back to copy:', err);
    const copied = await copyToClipboard(cleanUrl);
    const msg = copied
      ? "Couldn't open link. Meeting link copied to clipboard!"
      : "Couldn't open link: " + cleanUrl;
    onFeedback?.(msg, true);
    return { success: false, copied, error: String(err) };
  }
}

