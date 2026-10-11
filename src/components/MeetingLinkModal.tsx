/**
 * MeetingLinkModal Component
 * Allows tutors to accept requests with an optional Zoom/Google Meet link,
 * create a new Google Meet with 1 click, or update/clear an existing meeting link.
 */
import React, { useState } from 'react';
import { Video, ExternalLink, AlertCircle, CheckCircle, Trash2, X } from 'lucide-react';
import { isValidMeetingUrl, openExternalMeetingLink } from '../services/linking';
import { PrimaryButton } from './PrimaryButton';

interface MeetingLinkModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  initialLink?: string;
  confirmLabel?: string;
  allowDelete?: boolean;
  onClose: () => void;
  onConfirm: (meetingLink: string) => Promise<void>;
  onDeleteLink?: () => Promise<void>;
}

export const MeetingLinkModal: React.FC<MeetingLinkModalProps> = ({
  isOpen,
  title = 'Accept Session & Add Meeting Link',
  subtitle = 'Provide a Google Meet or Zoom link for the live session.',
  initialLink = '',
  confirmLabel = 'Confirm & Accept',
  allowDelete = false,
  onClose,
  onConfirm,
  onDeleteLink,
}) => {
  const [link, setLink] = useState(initialLink);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenGoogleMeetNew = async () => {
    setError(null);
    await openExternalMeetingLink('https://meet.google.com/new', (msg, isErr) => {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = link.trim();
    if (trimmed && !isValidMeetingUrl(trimmed)) {
      setError('Meeting link must be a valid secure URL starting with https://');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(trimmed);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save meeting link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteLink) return;
    setLoading(true);
    try {
      await onDeleteLink();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove meeting link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback / status banner */}
        {feedback && (
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meeting link (Zoom / Google Meet)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Optional: you can also add or change the link later.
            </p>
          </div>

          {/* Helper Button: Create Google Meet Room */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleOpenGoogleMeetNew}
              className="w-full py-2 px-3 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              <span>Open Google Meet (Create Room)</span>
            </button>
            <span className="block text-[10px] text-center text-slate-400 mt-1">
              Creates a new room in a new tab so you can copy the link here
            </span>
          </div>

          {/* Inline Validation Error */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {allowDelete && initialLink && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                title="Clear meeting link"
                className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <PrimaryButton
              role="tutor"
              type="submit"
              loading={loading}
              className="flex-1 text-xs py-2.5!"
            >
              {confirmLabel}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};
