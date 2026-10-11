/**
 * TutorProfile Component
 * Matches Figma prototype 'TUTEE-tutor-profile.png'
 * Displays tutor details (name, anime avatar, subjects, experience, rating, availability, reviews)
 */
import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Flag,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { TutorProfile as ITutorProfile } from '../types';
import { SAMPLE_TUTORS } from '../services/tutors';
import { SAMPLE_REVIEWS } from '../services/availability';
import { getAnimeAvatar } from '../utils/avatars';
import { AvatarImage } from './AvatarImage';
import { VerifiedBadge } from './VerifiedBadge';
import { StarRating } from './StarRating';
import { PrimaryButton } from './PrimaryButton';
import { theme } from '../theme';

interface TutorProfileProps {
  tutor?: ITutorProfile;
  onBack?: () => void;
  onBookSession?: (tutor: ITutorProfile) => void;
  onToggleFavorite?: (tutorId: string, isFav: boolean) => void;
  initialIsFavorite?: boolean;
}

export const TutorProfile: React.FC<TutorProfileProps> = ({
  tutor = SAMPLE_TUTORS[0], // Defaults to Kavindu Perera
  onBack,
  onBookSession,
  onToggleFavorite,
  initialIsFavorite = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [selectedSlot, setSelectedSlot] = useState<string>('Today • 5:30');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  const animeAvatar = tutor.avatarUrl || getAnimeAvatar(tutor.name);
  const tutorReview = SAMPLE_REVIEWS[0];

  const handleFavoriteClick = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    onToggleFavorite?.(tutor.uid, nextState);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] pb-6 relative overflow-y-auto">
      {/* Top Header */}
      <header className="px-5 pt-3 pb-3 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-30">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-slate-900">Tutor profile</h1>

        <button
          onClick={handleFavoriteClick}
          className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 border-rose-200 text-rose-500'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
          }`}
          aria-label="Save tutor"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Tutor Hero Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            {/* Anime Avatar Placeholder */}
            <div className="relative">
              <AvatarImage
                src={animeAvatar}
                alt={tutor.name}
                className="w-18 h-18 rounded-2xl bg-indigo-50 border-2 border-indigo-100 object-cover shadow-sm"
              />
              {tutor.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                  <VerifiedBadge size={18} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {tutor.name}
                </h2>
                {tutor.verified && <VerifiedBadge size={18} />}
              </div>

              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                {tutor.headline}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                <StarRating rating={tutor.rating} reviewCount={tutor.reviewCount} />
                <span className="text-slate-300">•</span>
                <span className="text-teal-600 font-bold">
                  {tutor.completedSessions}+ sessions
                </span>
              </div>
            </div>
          </div>

          {/* Subject Badges */}
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 items-center">
            {tutor.subjects.map((sub, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold"
              >
                {sub}
              </span>
            ))}
            <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-700 text-xs font-semibold ml-auto">
              Peer Tutor
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900">
            About {tutor.name.split(' ')[0]}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            {tutor.bio}
          </p>

          {/* Tags */}
          {tutor.tags && tutor.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tutor.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full border border-slate-200 text-slate-700 text-[11px] font-medium bg-slate-50/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Qualifications & Experience */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <Award className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Qualifications: </span>
                <span>{tutor.qualifications}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <BookOpen className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Experience: </span>
                <span>{tutor.experience}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Availability */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Next availability</h3>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              View calendar
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Today • 5:30', 'Tue • 4:00', 'Wed • 6:15'].map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 px-1 text-center rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  selectedSlot === slot
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted Review Card */}
        {tutorReview && (
          <div className="bg-[#FEFCE8] rounded-3xl p-4.5 border border-amber-200/60 relative">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
                <span>★ 5.0</span>
              </div>
              <span className="text-[11px] text-amber-700/80 font-medium">
                {tutorReview.tuteeName}, {tutorReview.createdAt}
              </span>
            </div>

            <p className="text-xs text-slate-700 italic leading-relaxed">
              “{tutorReview.text}”
            </p>

            <div className="mt-2.5 pt-2 border-t border-amber-200/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition"
              >
                <Flag className="w-3 h-3" />
                <span>Report unfair review</span>
              </button>
            </div>
          </div>
        )}

        {/* Fast Responder Badge & Progress Bar */}
        <div className="px-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{tutor.responseTime || 'Usually responds in 12 min'}</span>
            <span className="font-bold text-teal-600">Fast responder</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full w-4/5" />
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <PrimaryButton
            role="tutee"
            onClick={() => onBookSession?.(tutor)}
            icon={<Calendar className="w-4 h-4" />}
          >
            Book a session
          </PrimaryButton>
        </div>
      </div>

      {/* Report Review Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Report Review</h4>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-4 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Report Submitted</p>
                <p className="text-[11px] text-slate-500">Our academic moderation team will review this report.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Please let us know why you are flagging this review for peer tutor {tutor.name}.
                </p>
                <textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Inaccurate information, abusive language..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
