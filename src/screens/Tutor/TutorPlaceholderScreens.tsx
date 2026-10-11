/**
 * Tutor Screens
 * Includes external meeting link support (Google Meet / Zoom) for requests and sessions
 */
import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Star,
  Clock,
  CheckCircle,
  Plus,
  Folder,
  XCircle,
  Video,
  ExternalLink,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ANIME_AVATARS } from '../../utils/avatars';
import { Booking } from '../../types';
import {
  getBookingsForUser,
  acceptBooking,
  declineBooking,
  updateMeetingLink,
} from '../../services/bookings';
import { openExternalMeetingLink } from '../../services/linking';
import { MeetingLinkModal } from '../../components/MeetingLinkModal';
import { EditTutorProfileModal } from '../../components/EditTutorProfileModal';

export const TutorDashboardScreen: React.FC<{
  onNavigateToRequests: () => void;
  onNavigateToAvailability: () => void;
}> = ({ onNavigateToRequests, onNavigateToAvailability }) => {
  const { user } = useAuth();
  const tutorName = user?.name?.split(' ')[0] || 'Kavindu';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  const fetchBookings = async () => {
    try {
      const data = await getBookingsForUser(user?.uid || 'tutor_kavindu', 'tutor');
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Next accepted session
  const nextSession = bookings.find((b) => b.status === 'accepted') || bookings[0];
  const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;

  const handleStartSession = async (b: Booking) => {
    if (!b.meetingLink) {
      setEditingBooking(b);
      return;
    }
    await openExternalMeetingLink(b.meetingLink, (msg, isErr) => {
      setFeedback({ msg, isError: isErr });
      setTimeout(() => setFeedback(null), 3500);
    });
  };

  const handleUpdateLink = async (newLink: string) => {
    if (!editingBooking) return;
    try {
      await updateMeetingLink(editingBooking.id, newLink);
      await fetchBookings();
      setFeedback({ msg: newLink ? 'Meeting link updated!' : 'Meeting link cleared.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ msg: err?.message || 'Failed to update link', isError: true });
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto relative">
      <ScreenHeader
        title="Tutor studio"
        subtitle={`Ready to make an impact, ${tutorName}?`}
        showWordmark={true}
        role="tutor"
      />

      {feedback && (
        <div
          className={`mx-4 mt-2 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-800'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Top Cards: Pending requests & Avg rating */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={onNavigateToRequests}
            className="bg-[#FFF1F2] rounded-3xl p-4 border border-rose-100/60 cursor-pointer hover:shadow-xs transition"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
              <Inbox className="w-4 h-4 text-rose-500" />
              <span>Pending requests</span>
            </div>
            <p className="text-xl font-extrabold text-rose-600 mt-1">
              {pendingRequestsCount} new
            </p>
          </div>

          <div className="bg-[#FFFBEB] rounded-3xl p-4 border border-amber-100/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Avg. rating</span>
            </div>
            <p className="text-xl font-extrabold text-amber-600 mt-1 flex items-center gap-1">
              4.9 <span>★</span>
            </p>
          </div>
        </div>

        {/* Public Search Profile Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Public tutor profile</h3>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
              Live in Search
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-teal-500 h-2 rounded-full w-[95%]" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">
              Students can find and book sessions with you.
            </p>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 underline underline-offset-2 cursor-pointer"
            >
              Edit profile
            </button>
          </div>
        </div>

        {/* Next Session Card with Meeting Link action */}
        {nextSession && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">
                NEXT SESSION • {nextSession.time}
              </span>
              <span className="text-xs text-slate-400">{nextSession.date}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={ANIME_AVATARS.senuri}
                  alt={nextSession.tuteeName}
                  className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {nextSession.tuteeName} • {nextSession.subject}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {nextSession.durationMins} min • Peer Session
                  </p>
                </div>
              </div>

              {/* Start Session / Add Meeting Link Button */}
              {nextSession.meetingLink ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartSession(nextSession)}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start session</span>
                  </button>
                  <button
                    onClick={() => setEditingBooking(nextSession)}
                    title="Edit meeting link"
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingBooking(nextSession)}
                  className="px-3 py-2 rounded-xl border border-teal-300 bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add meeting link</span>
                </button>
              )}
            </div>

            {/* Display active meeting link status */}
            {nextSession.meetingLink && (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="truncate max-w-[220px]">
                  Room: {nextSession.meetingLink}
                </span>
                <span className="text-[10px] font-bold text-teal-600 shrink-0">Live Room</span>
              </div>
            )}
          </div>
        )}

        {/* This Week Availability Preview */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold text-slate-900 text-sm">This week</h3>
            <button
              onClick={onNavigateToAvailability}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
            >
              Edit availability
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {[
              { d: 'M', count: 2 },
              { d: 'T', count: 3, active: true },
              { d: 'W', count: 1 },
              { d: 'T', count: 4 },
              { d: 'F', count: 1 },
              { d: 'S', count: 0 },
              { d: 'S', count: 0 },
            ].map((col, idx) => (
              <div
                key={idx}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center ${
                  col.active ? 'bg-teal-500 text-white shadow-xs' : 'bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold opacity-80">{col.d}</span>
                <span className="text-sm font-extrabold mt-0.5">{col.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onNavigateToRequests}
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Inbox className="w-3.5 h-3.5 text-rose-500" />
            <span>Requests</span>
          </button>
          <button
            onClick={onNavigateToAvailability}
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>Availability</span>
          </button>
          <button
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-500" />
            <span>Resources</span>
          </button>
        </div>
      </div>

      {/* Edit Meeting Link Modal */}
      {editingBooking && (
        <MeetingLinkModal
          isOpen={Boolean(editingBooking)}
          title="Meeting Room Link"
          subtitle={`Set live room for ${editingBooking.tuteeName}`}
          initialLink={editingBooking.meetingLink || ''}
          confirmLabel={editingBooking.meetingLink ? 'Update Link' : 'Save Link'}
          allowDelete={Boolean(editingBooking.meetingLink)}
          onClose={() => setEditingBooking(null)}
          onConfirm={handleUpdateLink}
          onDeleteLink={() => handleUpdateLink('')}
        />
      )}

      {/* Edit Tutor Profile Modal */}
      {isEditingProfile && user && (
        <EditTutorProfileModal
          isOpen={isEditingProfile}
          userUid={user.uid}
          userName={user.name}
          userAvatar={user.avatarUrl}
          onClose={() => setIsEditingProfile(false)}
          onSaved={() => {
            setFeedback({ msg: 'Profile updated and published to student search!' });
            setTimeout(() => setFeedback(null), 3000);
          }}
        />
      )}
    </div>
  );
};

export const TutorRequestsScreen: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'pending' | 'accepted' | 'past'>('pending');
  const [acceptingBooking, setAcceptingBooking] = useState<Booking | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await getBookingsForUser(user?.uid || 'tutor_kavindu', 'tutor');
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const pendingList = bookings.filter((b) => b.status === 'pending');
  const acceptedList = bookings.filter((b) => b.status === 'accepted');
  const pastList = bookings.filter((b) => b.status === 'completed' || b.status === 'declined');

  const displayedList =
    filterTab === 'pending'
      ? pendingList
      : filterTab === 'accepted'
      ? acceptedList
      : pastList;

  const handleDecline = async (b: Booking) => {
    try {
      await declineBooking(b.id);
      await fetchBookings();
      setFeedback({ msg: `Declined request from ${b.tuteeName}` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ msg: err?.message || 'Failed to decline', isError: true });
    }
  };

  const handleConfirmAccept = async (meetingLink: string) => {
    if (!acceptingBooking) return;
    try {
      await acceptBooking(acceptingBooking.id, meetingLink);
      await fetchBookings();
      setFeedback({
        msg: meetingLink
          ? `Accepted session with ${acceptingBooking.tuteeName} with meeting link!`
          : `Accepted session with ${acceptingBooking.tuteeName}!`,
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ msg: err?.message || 'Failed to accept', isError: true });
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto relative">
      <ScreenHeader
        title="Session requests"
        subtitle={`${pendingList.length} students are waiting`}
        showWordmark={true}
        role="tutor"
        rightAction="filter"
      />

      {feedback && (
        <div
          className={`mx-4 mt-2 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-800'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Filter Pills matching Figma */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              filterTab === 'pending'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            New <span className="bg-white/20 text-current text-[10px] px-1.5 rounded-full">{pendingList.length}</span>
          </button>
          <button
            onClick={() => setFilterTab('accepted')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              filterTab === 'accepted'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Accepted <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 rounded-full">{acceptedList.length}</span>
          </button>
          <button
            onClick={() => setFilterTab('past')}
            className={`px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              filterTab === 'past'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Past <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 rounded-full">{pastList.length}</span>
          </button>
        </div>

        {/* Request Cards */}
        <div className="space-y-3">
          {displayedList.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={ANIME_AVATARS.senuri}
                  alt={req.tuteeName}
                  className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{req.tuteeName}</h4>
                  <p className="text-xs font-semibold text-teal-600">{req.subject}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100/50 text-xs">
                <p className="font-bold text-slate-800">{req.notes || 'Tutoring session'}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {req.date} • {req.time} • {req.durationMins} min
                </p>
                {req.meetingLink && (
                  <p className="text-[11px] font-semibold text-teal-700 mt-1 truncate">
                    Room: {req.meetingLink}
                  </p>
                )}
              </div>

              {/* Action Buttons for Pending Requests */}
              {req.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleDecline(req)}
                    className="py-2.5 rounded-2xl border-2 border-rose-300 text-rose-600 font-bold text-xs hover:bg-rose-50 transition cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => setAcceptingBooking(req)}
                    className="py-2.5 rounded-2xl bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm hover:bg-teal-600 transition cursor-pointer active:scale-98"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept
                  </button>
                </div>
              )}

              {/* Actions for Accepted Requests */}
              {req.status === 'accepted' && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Accepted
                  </span>
                  {req.meetingLink ? (
                    <button
                      onClick={() => openExternalMeetingLink(req.meetingLink!)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-teal-700"
                    >
                      <Video className="w-3 h-3" /> Start Room
                    </button>
                  ) : (
                    <button
                      onClick={() => setAcceptingBooking(req)}
                      className="px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 text-teal-800 text-xs font-bold"
                    >
                      + Add Link
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {displayedList.length === 0 && (
            <div className="text-center py-8 bg-white rounded-3xl p-6 border border-slate-100">
              <p className="font-bold text-sm text-slate-800">No requests in this tab</p>
              <p className="text-xs text-slate-400 mt-1">Pending and updated student requests appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Accept Booking & Meeting Link Modal */}
      {acceptingBooking && (
        <MeetingLinkModal
          isOpen={Boolean(acceptingBooking)}
          title="Accept Session Request"
          subtitle={`Accept ${acceptingBooking.tuteeName} for ${acceptingBooking.subject}`}
          initialLink={acceptingBooking.meetingLink || ''}
          confirmLabel="Accept Request"
          onClose={() => setAcceptingBooking(null)}
          onConfirm={handleConfirmAccept}
        />
      )}
    </div>
  );
};

export const TutorAvailabilityScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col pb-6 overflow-y-auto">
      <ScreenHeader
        title="Availability"
        subtitle="Set when students can book"
        role="tutor"
      />

      <div className="p-4 space-y-4">
        {/* Week Selector */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 px-1">
          <span>Mar 23–29</span>
        </div>

        {/* Day Pills */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {[
            { d: 'M', n: '23' },
            { d: 'T', n: '24', active: true },
            { d: 'W', n: '25' },
            { d: 'T', n: '26' },
            { d: 'F', n: '27' },
            { d: 'S', n: '28' },
            { d: 'S', n: '29' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`py-2 px-1 rounded-2xl flex flex-col items-center ${
                item.active ? 'bg-teal-500 text-white font-bold' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-[10px] opacity-75">{item.d}</span>
              <span className="text-sm font-extrabold">{item.n}</span>
            </div>
          ))}
        </div>

        {/* Windows Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tuesday, March 24</h3>
              <p className="text-xs text-slate-400">3 available windows • 5.5 hours</p>
            </div>
            <div className="w-11 h-6 bg-teal-500 rounded-full flex items-center justify-end px-0.5">
              <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
            </div>
          </div>

          {/* Time Slots */}
          {[
            { start: '9:00 AM', end: '11:30 AM' },
            { start: '2:00 PM', end: '4:00 PM' },
            { start: '5:30 PM', end: '6:30 PM' },
          ].map((slot, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 bg-teal-50/70 border border-teal-100 rounded-2xl text-xs font-bold text-teal-800 text-center">
                {slot.start}
              </div>
              <span className="text-xs text-slate-400">to</span>
              <div className="flex-1 py-2 px-3 bg-teal-50/70 border border-teal-100 rounded-2xl text-xs font-bold text-teal-800 text-center">
                {slot.end}
              </div>
              <button className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button className="w-full py-2.5 rounded-2xl bg-teal-50 border border-dashed border-teal-300 text-teal-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Add time window</span>
          </button>
        </div>

        {/* Booking settings */}
        <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm text-xs space-y-2">
          <h4 className="font-bold text-slate-900">Booking settings</h4>
          <div className="flex items-center justify-between text-slate-600">
            <span>Session buffer</span>
            <span className="font-bold text-slate-900">15 minutes</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Minimum notice</span>
            <span className="font-bold text-slate-900">2 hours</span>
          </div>
        </div>

        <PrimaryButton role="tutor">Save availability</PrimaryButton>
      </div>
    </div>
  );
};
