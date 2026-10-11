/**
 * Tutee Screens (Foundation & Navigation Skeleton)
 * Styled with Sinhala names and modern anime illustration avatars
 * Includes external meeting link joining support (Google Meet / Zoom)
 */
import React, { useState, useEffect } from 'react';
import {
  Video,
  Flame,
  Award,
  Search as SearchIcon,
  Star,
  LogOut,
  Sparkles,
  ExternalLink,
  Copy,
  Clock,
  CheckCircle2,
  X,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { ANIME_AVATARS, getAnimeAvatar } from '../../utils/avatars';
import { TutorProfile } from '../../components/TutorProfile';
import { SAMPLE_TUTORS, getTutors } from '../../services/tutors';
import { EditTutorProfileModal } from '../../components/EditTutorProfileModal';
import { TutorProfile as ITutorProfile, Booking } from '../../types';
import { getBookingsForUser, createBooking } from '../../services/bookings';
import { openExternalMeetingLink, copyToClipboard } from '../../services/linking';

export const TuteeSessionDetailModal: React.FC<{
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (b: Booking) => void;
}> = ({ booking, isOpen, onClose, onJoin }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const handleCopy = async () => {
    if (booking.meetingLink) {
      await copyToClipboard(booking.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isAccepted = booking.status === 'accepted';
  const hasMeetingLink = Boolean(booking.meetingLink);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Session details</h3>
            <p className="text-[11px] text-slate-400">ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tutor info */}
        <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/60">
          <img
            src={booking.tutorAvatar || ANIME_AVATARS.kavindu}
            alt={booking.tutorName}
            className="w-12 h-12 rounded-full border border-indigo-200 object-cover bg-white shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-slate-900 truncate">{booking.tutorName}</h4>
            <p className="text-xs font-semibold text-indigo-600 truncate">{booking.subject}</p>
            <p className="text-[11px] text-slate-500">
              {booking.date} • {booking.time} ({booking.durationMins} min)
            </p>
          </div>
        </div>

        {/* Status & Price */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Status</span>
            <span
              className={`font-bold capitalize ${
                isAccepted
                  ? 'text-emerald-700'
                  : booking.status === 'pending'
                  ? 'text-amber-600'
                  : 'text-slate-700'
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Session type</span>
            <span className="font-bold text-slate-800">Peer Tutoring</span>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Session goals & notes
            </span>
            <p className="text-slate-700 leading-snug">{booking.notes}</p>
          </div>
        )}

        {/* Live Meeting Room Section */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Video className="w-4 h-4 text-indigo-600" />
              <span>Live Video Calling</span>
            </div>
            {hasMeetingLink && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Ready
              </span>
            )}
          </div>

          {isAccepted ? (
            hasMeetingLink ? (
              <div className="space-y-2.5">
                <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-medium text-indigo-900 truncate">
                    {booking.meetingLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[11px] font-semibold shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Copy meeting link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  onClick={() => onJoin(booking)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join session</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  Opens Google Meet or Zoom in an external window. No in-app calling required.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-800 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Waiting for tutor to add a meeting link</span>
                </div>
                <p className="text-[10px] text-amber-700">
                  Your tutor will create and provide a Google Meet or Zoom link before session time.
                </p>
              </div>
            )
          ) : (
            <p className="text-xs text-slate-500 italic text-center">
              Meeting room will be available once the tutor accepts this request.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const TuteeHomeScreen: React.FC<{ onNavigateToSearch: () => void; onSelectTutor?: (tutor: ITutorProfile) => void }> = ({
  onNavigateToSearch,
  onSelectTutor,
}) => {
  const { user } = useAuth();
  const studentName = user?.name?.split(' ')[0] || 'Senuri';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [recommendedTutors, setRecommendedTutors] = useState<ITutorProfile[]>([]);

  const fetchBookings = async () => {
    try {
      const data = await getBookingsForUser(user?.uid || 'user_senuri', 'tutee');
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    getTutors().then((list) => {
      const eligible = user ? list.filter((t) => t.uid !== user.uid) : list;
      setRecommendedTutors(eligible.slice(0, 4));
    });
  }, [user]);

  // Find next accepted booking, or fallback to first
  const nextSession = bookings.find((b) => b.status === 'accepted') || bookings[0];

  const handleJoin = async (b: Booking) => {
    if (!b.meetingLink) {
      setSelectedBookingForDetail(b);
      return;
    }
    await openExternalMeetingLink(b.meetingLink, (msg, isErr) => {
      setFeedback({ msg, isError: isErr });
      setTimeout(() => setFeedback(null), 3500);
    });
  };

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto">
      <ScreenHeader
        title="Your learning hub"
        subtitle={`Welcome back, ${studentName}`}
        showWordmark={true}
        role="tutee"
      />

      {feedback && (
        <div
          className={`mx-4 mt-2 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-800'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* UP NEXT Session Card with Live Meeting link integration */}
        {nextSession && (
          <div
            className="rounded-3xl p-5 text-white shadow-lg relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-200">
                UP NEXT • {nextSession.date.toUpperCase()}
              </span>
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full">
                {nextSession.time}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div
                onClick={() => setSelectedBookingForDetail(nextSession)}
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 pr-2"
              >
                <img
                  src={nextSession.tutorAvatar || ANIME_AVATARS.kavindu}
                  alt={nextSession.tutorName}
                  className="w-13 h-13 rounded-full border-2 border-white/60 bg-white object-cover shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-base leading-tight truncate">
                    {nextSession.subject} with {nextSession.tutorName.split(' ')[0]}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5 truncate">
                    {nextSession.notes || 'Tutoring session'} • {nextSession.durationMins} min
                  </p>
                </div>
              </div>

              {/* Join session or Waiting status */}
              {nextSession.status === 'accepted' ? (
                nextSession.meetingLink ? (
                  <button
                    onClick={() => handleJoin(nextSession)}
                    className="px-3.5 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
                  >
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>Join session</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-2xl bg-white/20 text-indigo-100 text-[11px] font-semibold flex items-center gap-1.5 shrink-0 max-w-[140px] text-right">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Waiting for tutor link</span>
                  </div>
                )
              ) : (
                <div className="px-3 py-1.5 rounded-2xl bg-white/20 text-white text-[11px] font-semibold">
                  Pending
                </div>
              )}
            </div>

            {/* If meeting link exists, show clickable quick preview banner */}
            {nextSession.meetingLink && (
              <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-indigo-100 truncate max-w-[200px]">
                  Room: {nextSession.meetingLink}
                </span>
                <button
                  onClick={() => setSelectedBookingForDetail(nextSession)}
                  className="text-[11px] font-bold text-white underline underline-offset-2 hover:opacity-90 cursor-pointer"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        )}

        {/* Weekly Learning Goal */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-sm">Weekly learning goal</h3>
            <span className="text-xs font-bold text-indigo-600">3 of 4 hours</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-400 to-indigo-500 h-2.5 rounded-full w-3/4" />
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>One more focused hour to hit your streak</span>
          </p>
        </div>

        {/* Stat Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FFFBEB] rounded-3xl p-4 border border-amber-100/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Study streak</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">6 days</p>
          </div>

          <div className="bg-[#F0FDF4] rounded-3xl p-4 border border-emerald-100/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Topics mastered</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">12</p>
          </div>
        </div>

        {/* Recommended Tutors Preview with Sinhala names and Anime Avatars */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-900 text-sm">Recommended peer tutors</h3>
            <button
              onClick={onNavigateToSearch}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(recommendedTutors.length > 0 ? recommendedTutors.slice(0, 2) : SAMPLE_TUTORS.slice(0, 2)).map((tutor) => (
              <div
                key={tutor.uid}
                onClick={() => onSelectTutor?.(tutor)}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 cursor-pointer hover:shadow-sm transition"
              >
                <img
                  src={tutor.avatarUrl || getAnimeAvatar(tutor.name)}
                  alt={tutor.name}
                  className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{tutor.name}</p>
                  <p className="text-[10px] text-teal-600 font-medium truncate">{tutor.subjects[0] || 'Peer Mentor'}</p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{tutor.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 1 Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold">Peer Marketplace Ready</span>
          </div>
          <span className="text-[11px] font-medium text-indigo-600">Live External Calls</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBookingForDetail && (
        <TuteeSessionDetailModal
          isOpen={Boolean(selectedBookingForDetail)}
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
};


export const TuteeSearchScreen: React.FC<{
  initialSelectedTutor?: ITutorProfile | null;
  onBookingCreated?: () => void;
}> = ({
  initialSelectedTutor = null,
  onBookingCreated,
}) => {
  const { user } = useAuth();
  const [activeTutor, setActiveTutor] = useState<ITutorProfile | null>(initialSelectedTutor);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [allTutors, setAllTutors] = useState<ITutorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTutors = async () => {
    try {
      const list = await getTutors();
      setAllTutors(list);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTutors();
  }, []);

  React.useEffect(() => {
    if (initialSelectedTutor) {
      setActiveTutor(initialSelectedTutor);
    }
  }, [initialSelectedTutor]);

  // If a tutor profile is actively selected, display the TutorProfile view component
  if (activeTutor) {
    return (
      <div className="flex-1 flex flex-col relative h-full">
        {bookingNotice && (
          <div className="absolute top-14 left-4 right-4 z-50 bg-emerald-600 text-white p-3 rounded-2xl shadow-lg text-xs font-semibold flex items-center justify-between">
            <span>{bookingNotice}</span>
            <button onClick={() => setBookingNotice(null)} className="text-white font-bold ml-2">✕</button>
          </div>
        )}
        <TutorProfile
          tutor={activeTutor}
          onBack={() => {
            setActiveTutor(null);
            setBookingNotice(null);
          }}
          onBookSession={async (t) => {
            if (user && user.uid === t.uid) {
              setBookingNotice('Integrity rule: You cannot book your own tutor profile.');
              return;
            }
            try {
              await createBooking({
                tuteeUid: user?.uid || 'user_senuri',
                tuteeName: user?.name || 'Senuri Dias',
                tutorUid: t.uid,
                tutorName: t.name,
                tutorAvatar: t.avatarUrl,
                subject: t.subjects[0] || 'Combined Maths',
                price: t.hourlyRate || 20,
              });
              setBookingNotice(`Booking request submitted for ${t.name}! Next available slot held.`);
              setTimeout(() => {
                onBookingCreated?.();
              }, 1200);
            } catch (err: any) {
              setBookingNotice(err?.message || 'Failed to submit booking');
            }
          }}
        />
      </div>
    );
  }

  const filteredTutors = allTutors.filter((t) => {
    // Integrity rule: Exclude user's own uid from Tutee Search results
    if (user && t.uid === user.uid) {
      return false;
    }
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.headline && t.headline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || t.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto">
      <ScreenHeader
        title="Find a tutor"
        showWordmark={true}
        role="tutee"
      />

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject, tutor, or topic..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {['All', 'Combined Maths', 'Chemistry', 'English Lit', 'Physics'].map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-3.5 py-1.5 rounded-xl shrink-0 cursor-pointer transition ${
                selectedSubject === subject
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Tutor Cards List */}
        <div className="space-y-3">
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.uid}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={tutor.avatarUrl || getAnimeAvatar(tutor.name)}
                  alt={tutor.name}
                  className="w-13 h-13 rounded-full bg-indigo-50 border border-indigo-100 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{tutor.name}</h4>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full shrink-0">
                      Peer Tutor
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{tutor.subjects.join(' • ')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {tutor.rating} ({tutor.reviewCount})
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      Today
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTutor(tutor)}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer shrink-0 ml-2"
              >
                View
              </button>
            </div>
          ))}

          {filteredTutors.length === 0 && (
            <div className="text-center py-8 bg-white rounded-3xl p-6 border border-slate-100">
              <p className="font-bold text-sm text-slate-800">No tutors found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different subject or keyword search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TuteeSessionsScreen: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending'>('all');
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await getBookingsForUser(user?.uid || 'user_senuri', 'tutee');
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleJoin = async (b: Booking) => {
    if (!b.meetingLink) {
      setSelectedBookingForDetail(b);
      return;
    }
    await openExternalMeetingLink(b.meetingLink, (msg, isErr) => {
      setFeedback({ msg, isError: isErr });
      setTimeout(() => setFeedback(null), 3500);
    });
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto relative">
      <ScreenHeader
        title="My sessions"
        subtitle="Upcoming & active tutoring"
        role="tutee"
      />

      {feedback && (
        <div
          className={`mx-4 mt-2 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-800'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Filter chips */}
        <div className="flex gap-2 text-xs font-semibold">
          {(['all', 'accepted', 'pending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition cursor-pointer ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'all' ? 'All Sessions' : tab}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-xs space-y-3"
            >
              <div
                onClick={() => setSelectedBookingForDetail(b)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.tutorAvatar || ANIME_AVATARS.kavindu}
                    alt={b.tutorName}
                    className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600">{b.subject}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          b.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-bold mt-0.5">
                      {b.date} • {b.time} ({b.durationMins} min)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Tutor: {b.tutorName} • Peer Tutoring
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons based on status & meeting link */}
              {b.status === 'accepted' ? (
                <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-50">
                  {b.meetingLink ? (
                    <>
                      <span className="text-[11px] font-mono text-slate-500 truncate max-w-[170px]">
                        Room: {b.meetingLink}
                      </span>
                      <button
                        onClick={() => handleJoin(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join session</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Waiting for tutor to add a meeting link</span>
                    </div>
                  )}
                </div>
              ) : b.status === 'pending' ? (
                <div className="pt-1 text-[11px] text-amber-700 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting tutor response</span>
                </div>
              ) : null}
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 bg-white rounded-3xl p-6 border border-slate-100">
              <p className="font-bold text-sm text-slate-800">No sessions found</p>
              <p className="text-xs text-slate-400 mt-1">Bookings will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBookingForDetail && (
        <TuteeSessionDetailModal
          isOpen={Boolean(selectedBookingForDetail)}
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onJoin={handleJoin}
        />
      )}
    </div>
  );
};

import { ProfileScreen } from '../Profile/ProfileScreen';
export { ProfileScreen as UserProfileScreen };
