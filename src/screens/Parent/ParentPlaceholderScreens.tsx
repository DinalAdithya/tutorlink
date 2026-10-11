/**
 * Parent Screens (Foundation & Navigation Skeleton)
 * Styled with Sinhala family names and modern anime illustration avatars
 * Includes read-only external meeting link display for session monitoring
 */
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Video,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ANIME_AVATARS } from '../../utils/avatars';
import { Booking } from '../../types';
import { getBookingsForUser } from '../../services/bookings';
import { copyToClipboard } from '../../services/linking';

export const ParentDashboardScreen: React.FC<{ onNavigateToProgress: () => void; onNavigateToSessionDetail: () => void }> = ({
  onNavigateToProgress,
  onNavigateToSessionDetail,
}) => {
  const { user } = useAuth();
  const parentName = user?.name?.split(' ')[0] || 'Malani';

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    getBookingsForUser(user?.uid || 'user_senuri', 'parent').then(setBookings);
  }, [user]);

  const nextSession = bookings.find((b) => b.status === 'accepted') || bookings[0];

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto">
      <ScreenHeader
        title="Family learning"
        subtitle={`Welcome back, ${parentName}`}
        showWordmark={true}
        role="parent"
      />

      <div className="p-4 space-y-4">
        {/* Linked Child Selector Card: Senuri Dias */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={ANIME_AVATARS.senuri}
              alt="Senuri Dias"
              className="w-13 h-13 rounded-full bg-rose-50 border border-rose-100 object-cover"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Senuri Dias</h3>
              <p className="text-xs text-slate-500">Grade 12 (A/L) • 3 active subjects</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Next Session Banner with dynamic data */}
        {nextSession && (
          <div
            onClick={onNavigateToSessionDetail}
            className="rounded-3xl p-5 text-white shadow-lg cursor-pointer active:scale-[0.99] transition"
            style={{ background: 'linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-rose-100">
                NEXT SESSION • {nextSession.date.toUpperCase()}
              </span>
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full">
                {nextSession.time}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <img
                  src={nextSession.tutorAvatar || ANIME_AVATARS.kavindu}
                  alt={nextSession.tutorName}
                  className="w-12 h-12 rounded-full border-2 border-white/60 bg-white object-cover shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-base leading-tight">
                    {nextSession.subject} with {nextSession.tutorName.split(' ')[0]}
                  </h4>
                  <p className="text-xs text-rose-100 mt-0.5">
                    {nextSession.notes || 'Tutoring session'} • {nextSession.durationMins} min
                  </p>
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Room status */}
            <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-rose-100 truncate max-w-[200px]">
                {nextSession.meetingLink ? `Room ready: ${nextSession.meetingLink}` : 'Awaiting tutor meeting link'}
              </span>
              <span className="text-[11px] font-bold text-white underline underline-offset-2">
                Session details
              </span>
            </div>
          </div>
        )}


        {/* This Week At A Glance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900 text-sm">This week at a glance</h3>
            <button
              onClick={onNavigateToProgress}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              View report
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#EEF2FF] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-indigo-700 block">Hours learned</span>
              <span className="text-lg font-extrabold text-indigo-700 mt-0.5 block">3.5h</span>
            </div>
            <div className="bg-[#CCFBF1] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-teal-800 block">Sessions</span>
              <span className="text-lg font-extrabold text-teal-800 mt-0.5 block">4 done</span>
            </div>
            <div className="bg-[#FEF3C7] rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-amber-800 block">Learning streak</span>
              <span className="text-lg font-extrabold text-amber-800 mt-0.5 block">6 days</span>
            </div>
          </div>
        </div>

        {/* Progress By Subject */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Progress by subject</h3>
            <span className="text-xs font-bold text-indigo-600">Details</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-800">Combined Maths</span>
              <span className="text-indigo-600">72%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[72%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-800">Chemistry</span>
              <span className="text-teal-600">58%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full w-[58%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-800">English Literature</span>
              <span className="text-rose-500">84%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[84%]" />
            </div>
          </div>
        </div>

        {/* New Tutor Note Card */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900">New tutor note from Kavindu</h4>
            <p className="text-xs text-slate-500 italic mt-0.5">
              “Strong focus and problem solving on integration questions today.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ParentProgressScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto">
      <ScreenHeader
        title="Senuri’s progress"
        subtitle="March learning report"
        role="parent"
        rightAction="none"
      />

      <div className="p-4 space-y-4">
        {/* March Achievement Banner */}
        <div className="bg-[#FFF1F2] rounded-3xl p-5 border border-rose-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
              MARCH ACHIEVEMENT
            </span>
            <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-0.5">
              Most improved in Combined Maths!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Confidence score grew 18% this month.
            </p>
          </div>
        </div>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#EEF2FF] rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-indigo-700 block">Hours learned</span>
            <span className="text-base font-extrabold text-indigo-800 mt-0.5 block">12.5h</span>
          </div>
          <div className="bg-[#FFFBEB] rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-amber-800 block">Session streak</span>
            <span className="text-base font-extrabold text-amber-700 mt-0.5 block">6 weeks</span>
          </div>
          <div className="bg-[#CCFBF1] rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-teal-800 block">Sessions</span>
            <span className="text-base font-extrabold text-teal-800 mt-0.5 block">14</span>
          </div>
        </div>

        {/* Tutor feedback notes */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-xs px-1">Tutor feedback</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <img
                  src={ANIME_AVATARS.kavindu}
                  alt="Kavindu"
                  className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Kavindu Perera</p>
                  <p className="text-[10px] text-indigo-600">Combined Maths</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Senuri is asking sharper questions and checking work independently.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <img
                  src={ANIME_AVATARS.thisal}
                  alt="Thisal"
                  className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900 text-[11px]">Thisal Jayawardena</p>
                  <p className="text-[10px] text-teal-600">Chemistry</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Great persistence on balancing complex redox equations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ParentSessionDetailScreen: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getBookingsForUser(user?.uid || 'user_senuri', 'parent').then(setBookings);
  }, [user]);

  const currentSession = bookings.find((b) => b.status === 'accepted') || bookings[0];

  const handleCopyLink = async () => {
    if (currentSession?.meetingLink) {
      await copyToClipboard(currentSession.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto">
      <ScreenHeader
        title="Session details"
        subtitle={`Booking ${currentSession?.id ? currentSession.id.toUpperCase() : 'TL-29481'}`}
        role="parent"
        rightAction="more"
      />

      <div className="p-4 space-y-4">
        {/* Banner with Connected Avatars: Senuri <--> Tutor */}
        <div className="bg-[#FFF1F2]/60 rounded-3xl p-5 border border-rose-100/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {currentSession?.subject || 'Combined Maths'}
            </h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 capitalize ${
                currentSession?.status === 'accepted'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-amber-700 bg-amber-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" /> {currentSession?.status || 'Confirmed'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <img
                src={ANIME_AVATARS.senuri}
                alt="Senuri"
                className="w-13 h-13 rounded-full border-2 border-white bg-indigo-50 object-cover shadow-sm"
              />
              <span className="text-xs font-bold text-slate-800 mt-1">
                {currentSession?.tuteeName?.split(' ')[0] || 'Senuri'}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-rose-200" />
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center absolute shadow-sm">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <img
                src={currentSession?.tutorAvatar || ANIME_AVATARS.kavindu}
                alt={currentSession?.tutorName || 'Kavindu'}
                className="w-13 h-13 rounded-full border-2 border-white bg-indigo-50 object-cover shadow-sm"
              />
              <span className="text-xs font-bold text-slate-800 mt-1">
                {currentSession?.tutorName?.split(' ')[0] || 'Kavindu'}
              </span>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-900">Session information</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">Date & time</span>
              <span className="font-bold text-slate-800">
                {currentSession ? `${currentSession.date} • ${currentSession.time}` : 'Tue, Mar 24 • 5:30 PM'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">Duration</span>
              <span className="font-bold text-slate-800">
                {currentSession?.durationMins || 60} minutes
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">Session type</span>
              <span className="font-bold text-slate-800">
                Peer Mentoring • Confirmed
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block text-[10px]">Format</span>
              <span className="font-bold text-slate-800">External Live Call</span>
            </div>

            {/* Read-Only Meeting Link Display for Parent */}
            <div className="p-3 bg-slate-50 rounded-2xl col-span-2 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  Live Meeting Link (Read-only)
                </span>
                <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">
                  Parent Monitoring
                </span>
              </div>

              {currentSession?.meetingLink ? (
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="font-mono text-xs font-semibold text-slate-800 break-all select-all">
                    {currentSession.meetingLink}
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shrink-0 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Copy meeting link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic pt-0.5">
                  Waiting for tutor to add a meeting link
                </p>
              )}

              <p className="text-[10px] text-slate-400 pt-0.5">
                Note: Read-only view for parent verification and reassurance. The student joins directly from their student account.
              </p>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2.5 text-xs">
          <h4 className="font-bold text-sm text-slate-900">Learning objectives</h4>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Master integration by parts and definite integrals</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Practice graph sketching and tangent derivatives</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-4 h-4 rounded-full border-2 border-indigo-400 inline-block" />
            <span>Review 2023 A/L Model Paper Question 12</span>
          </div>
        </div>

        {/* Tutor Notes */}
        <div className="bg-[#FEFCE8] rounded-3xl p-4.5 border border-amber-200/50 text-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            TUTOR NOTES • SHARED WITH PARENT
          </span>
          <p className="text-slate-700 mt-1 leading-relaxed">
            {currentSession?.notes
              ? `Session focus: ${currentSession.notes}. Senuri is making steady progress.`
              : 'Senuri understands the integration rules well. We’ll focus on explaining each step aloud to build exam confidence.'}
          </p>
        </div>

        <PrimaryButton role="parent">
          Contact tutor support
        </PrimaryButton>
      </div>
    </div>
  );
};
