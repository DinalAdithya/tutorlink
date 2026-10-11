/**
 * ProfileScreen
 * Comprehensive Profile screen with editable personal details,
 * multi-role management (tutee, tutor, parent), tutor credentials,
 * verification badges, role switcher, and account security.
 */
import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  ShieldAlert,
  Edit2,
  Trash2,
  Lock,
  LogOut,
  Plus,
  Repeat,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, theme } from '../../theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { getAnimeAvatar } from '../../utils/avatars';
import {
  getProfile,
  updateProfile,
  enableRole,
  disableRole,
  setActiveRole,
  getTutorProfileData,
  updateTutorProfileData,
  changeUserPassword,
  deleteAccount,
} from '../../services/profile';
import { TutorProfile } from '../../types';

interface ProfileScreenProps {
  onLogout?: () => void;
  onRoleSwitched?: (role: UserRole) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onRoleSwitched,
}) => {
  const { user, role, switchRole, logout, updateUserState } = useAuth();
  const currentRole: UserRole = user?.activeRole || role || 'tutee';

  // Personal details state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    university: user?.university || '',
    degree: user?.degree || '',
    yearOfStudy: user?.yearOfStudy || '',
  });

  // Tutor profile state
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isEditingTutor, setIsEditingTutor] = useState(false);
  const [tutorForm, setTutorForm] = useState({
    subjects: '' as string,
    qualifications: '',
    experience: '',
    hourlyRate: '' as string,
  });

  // Modals
  const [showAddTuteeConfirm, setShowAddTuteeConfirm] = useState(false);
  const [showAddTutorModal, setShowAddTutorModal] = useState(false);
  const [newTutorSubjects, setNewTutorSubjects] = useState<string>('Combined Maths, Physics');
  const [newTutorQuals, setNewTutorQuals] = useState<string>('Undergraduate Peer Tutor');
  const [newTutorExp, setNewTutorExp] = useState<string>('1+ years tutoring experience');
  const [newTutorRate, setNewTutorRate] = useState<string>('20');

  const [showLinkChildModal, setShowLinkChildModal] = useState(false);
  const [linkCodeInput, setLinkCodeInput] = useState('SENURI-2026');

  const [roleToDisable, setRoleToDisable] = useState<UserRole | null>(null);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  // Status notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Sync personal form when user changes
  useEffect(() => {
    if (user) {
      setPersonalForm({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        university: user.university || '',
        degree: user.degree || '',
        yearOfStudy: user.yearOfStudy || '',
      });
    }
  }, [user]);

  // Load tutor details if user has tutor role
  const hasTutorRole = Boolean(user?.roles.includes('tutor'));
  useEffect(() => {
    if (user?.uid && hasTutorRole) {
      getTutorProfileData(user.uid).then((tp) => {
        if (tp) {
          setTutorProfile(tp);
          setTutorForm({
            subjects: tp.subjects.join(', '),
            qualifications: tp.qualifications || '',
            experience: tp.experience || '',
            hourlyRate: tp.hourlyRate ? String(tp.hourlyRate) : '',
          });
        }
      });
    }
  }, [user?.uid, hasTutorRole]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Switch role handler
  const handleSwitchRole = async (targetRole: UserRole) => {
    if (!user || user.activeRole === targetRole) return;
    setLoadingAction(true);
    try {
      const updated = await setActiveRole(user.uid, targetRole);
      updateUserState(updated);
      await switchRole(targetRole);
      onRoleSwitched?.(targetRole);
      showFeedback('success', `Switched active mode to ${theme.roles[targetRole].name}`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to switch role');
    } finally {
      setLoadingAction(false);
    }
  };

  // Personal details save
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!personalForm.name.trim()) {
      showFeedback('error', 'Full name is required');
      return;
    }

    if (personalForm.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
      if (!phoneRegex.test(personalForm.phone.trim())) {
        showFeedback('error', 'Please enter a valid phone number (e.g. +94 77 123 4567)');
        return;
      }
    }

    setLoadingAction(true);
    try {
      const updated = await updateProfile(user.uid, {
        name: personalForm.name.trim(),
        bio: personalForm.bio.trim(),
        phone: personalForm.phone.trim(),
        university: personalForm.university.trim(),
        degree: personalForm.degree.trim(),
        yearOfStudy: personalForm.yearOfStudy.trim(),
      });
      updateUserState(updated);
      setIsEditingPersonal(false);
      showFeedback('success', 'Personal profile updated successfully');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Could not update personal details');
    } finally {
      setLoadingAction(false);
    }
  };

  // Tutor details save
  const handleSaveTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsedSubjects = tutorForm.subjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsedSubjects.length === 0) {
      showFeedback('error', 'Please specify at least one tutoring subject');
      return;
    }

    setLoadingAction(true);
    try {
      const updated = await updateTutorProfileData(user.uid, {
        subjects: parsedSubjects,
        qualifications: tutorForm.qualifications.trim(),
        experience: tutorForm.experience.trim(),
        hourlyRate: tutorForm.hourlyRate ? Number(tutorForm.hourlyRate) : undefined,
      });
      setTutorProfile(updated);
      setIsEditingTutor(false);
      showFeedback('success', 'Tutor credentials updated and synchronized');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to update tutor details');
    } finally {
      setLoadingAction(false);
    }
  };

  // Add Tutee role
  const handleConfirmAddTutee = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      const updated = await enableRole(user.uid, 'tutee');
      updateUserState(updated);
      setShowAddTuteeConfirm(false);
      await switchRole('tutee');
      onRoleSwitched?.('tutee');
      showFeedback('success', 'Student mode enabled! You can now search tutors and book sessions.');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to enable student role');
    } finally {
      setLoadingAction(false);
    }
  };

  // Add Tutor role
  const handleConfirmAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const subjects = newTutorSubjects
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (subjects.length === 0) {
      showFeedback('error', 'Please enter at least one subject');
      return;
    }

    setLoadingAction(true);
    try {
      const updated = await enableRole(user.uid, 'tutor', {
        subjects,
        qualifications: newTutorQuals.trim(),
        experience: newTutorExp.trim(),
        hourlyRate: newTutorRate ? Number(newTutorRate) : 20,
      });
      updateUserState(updated);
      setShowAddTutorModal(false);

      // Fetch fresh tutor profile doc
      const tp = await getTutorProfileData(user.uid);
      setTutorProfile(tp);

      await switchRole('tutor');
      onRoleSwitched?.('tutor');
      showFeedback('success', 'Peer Tutor mode enabled! Your profile has a "Verification pending" badge.');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to enable tutor role');
    } finally {
      setLoadingAction(false);
    }
  };

  // Add Parent role
  const handleConfirmAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!linkCodeInput.trim()) {
      showFeedback('error', 'Please enter a valid student link code');
      return;
    }

    setLoadingAction(true);
    try {
      const updated = await enableRole(user.uid, 'parent', {
        linkCode: linkCodeInput.trim(),
        childName: 'Senuri Dias',
        childUid: 'user_senuri',
      });
      updateUserState(updated);
      setShowLinkChildModal(false);
      await switchRole('parent');
      onRoleSwitched?.('parent');
      showFeedback('success', 'Parent mode enabled and linked with student profile Senuri Dias.');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to link child');
    } finally {
      setLoadingAction(false);
    }
  };

  // Disable role
  const handleConfirmDisableRole = async () => {
    if (!user || !roleToDisable) return;

    setLoadingAction(true);
    try {
      const updated = await disableRole(user.uid, roleToDisable);
      updateUserState(updated);
      const disabledRoleName = theme.roles[roleToDisable].name;
      setRoleToDisable(null);
      await switchRole(updated.activeRole);
      onRoleSwitched?.(updated.activeRole);
      showFeedback('success', `${disabledRoleName} mode disabled. Switched to ${theme.roles[updated.activeRole].name}.`);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Could not disable role');
    } finally {
      setLoadingAction(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showFeedback('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('error', 'New passwords do not match');
      return;
    }

    setLoadingAction(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showFeedback('success', 'Password updated successfully');
    } catch (err: any) {
      showFeedback('error', err?.message || 'Could not change password');
    } finally {
      setLoadingAction(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoadingAction(true);
    try {
      await deleteAccount(user.uid, deleteConfirmPassword);
      setShowDeleteAccountModal(false);
      await logout();
      onLogout?.();
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to delete account');
      setLoadingAction(false);
    }
  };

  const displayName = user?.name || 'TutorLink User';
  const displayEmail = user?.email || 'user@tutorlink.lk';
  const animeAvatar = user?.avatarUrl || getAnimeAvatar(displayName);

  const roleLabels: Record<UserRole, { title: string; subtitle: string; icon: any }> = {
    tutee: { title: 'Student', subtitle: 'Find & book peer tutors', icon: GraduationCap },
    tutor: { title: 'Peer Tutor', subtitle: 'Offer tutoring & share expertise', icon: BookOpen },
    parent: { title: 'Parent', subtitle: 'Supervise sessions & progress', icon: Shield },
  };

  return (
    <div className="flex-1 flex flex-col pb-8 overflow-y-auto bg-[#F8FAFC]">
      <ScreenHeader
        title="Profile & Settings"
        subtitle="Multi-role account settings"
        role={currentRole}
      />

      {/* Floating feedback toast */}
      {feedback && (
        <div className="mx-4 mt-3 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md transition animate-in fade-in slide-in-from-top-2"
          style={{
            backgroundColor: feedback.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            color: feedback.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${feedback.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          }}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2 text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Header Hero Card with Avatar & Active Role Badge */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="relative">
            <img
              src={animeAvatar}
              alt={displayName}
              className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 object-cover shadow-sm"
            />
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs"
              style={{ backgroundColor: theme.colors[currentRole] }}
              title={`Active role: ${currentRole}`}
            >
              {user?.avatarInitials || 'TL'}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-900 truncate">{displayName}</h2>
            </div>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{displayEmail}</span>
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.roles[currentRole].badgeBg}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors[currentRole] }} />
                <span>{theme.roles[currentRole].name}</span>
              </span>

              {user && user.roles.length > 1 && (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {user.roles.length} roles active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: "My roles" & Role Switcher */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">My Roles & Switcher</h3>
              <p className="text-xs text-slate-500">
                Hold multiple personas with one unified account
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
              <Repeat className="w-4 h-4" />
            </div>
          </div>

          {/* Role Switcher: Visible ONLY when user.roles.length > 1 */}
          {user && user.roles.length > 1 ? (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Switch Active Persona
              </label>
              <div
                className="grid gap-2 p-1.5 bg-slate-100 rounded-2xl"
                style={{ gridTemplateColumns: `repeat(${user.roles.length}, 1fr)` }}
              >
                {user.roles.map((r) => {
                  const isActive = r === currentRole;
                  const roleConfig = theme.roles[r];
                  return (
                    <button
                      key={r}
                      onClick={() => handleSwitchRole(r)}
                      disabled={loadingAction}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: roleConfig.primary }}
                      />
                      <span className="truncate">{roleConfig.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Single Role Account: </span>
                <span>You currently have the {theme.roles[currentRole].name} role enabled. Enable additional roles below to search tutors, teach students, or link children with this account.</span>
              </div>
            </div>
          )}

          {/* Role List & Enable/Disable Actions */}
          <div className="space-y-2.5 pt-1">
            {/* Tutee Role */}
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">Student / Tutee</h4>
                    {user?.roles.includes('tutee') && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Search tutors & request 1-on-1 sessions</p>
                </div>
              </div>

              {user?.roles.includes('tutee') ? (
                user.roles.length > 1 && (
                  <button
                    onClick={() => setRoleToDisable('tutee')}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                  >
                    Disable
                  </button>
                )
              ) : (
                <button
                  onClick={() => setShowAddTuteeConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Also find a tutor</span>
                </button>
              )}
            </div>

            {/* Tutor Role */}
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">Peer Tutor</h4>
                    {user?.roles.includes('tutor') && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Offer tutoring and accept session requests</p>
                </div>
              </div>

              {user?.roles.includes('tutor') ? (
                user.roles.length > 1 && (
                  <button
                    onClick={() => setRoleToDisable('tutor')}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                  >
                    Disable
                  </button>
                )
              ) : (
                <button
                  onClick={() => setShowAddTutorModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs hover:bg-teal-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Also offer tutoring</span>
                </button>
              )}
            </div>

            {/* Parent Role */}
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">Parent / Guardian</h4>
                    {user?.roles.includes('parent') && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        Enabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {user?.linkedChildName ? `Linked to ${user.linkedChildName}` : 'Monitor child tutoring & links'}
                  </p>
                </div>
              </div>

              {user?.roles.includes('parent') ? (
                user.roles.length > 1 && (
                  <button
                    onClick={() => setRoleToDisable('parent')}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 p-1.5 cursor-pointer"
                  >
                    Disable
                  </button>
                )
              ) : (
                <button
                  onClick={() => setShowLinkChildModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link a child</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: "Personal details" card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Personal Details</h3>
              <p className="text-xs text-slate-500">Your profile information and contact data</p>
            </div>
            {!isEditingPersonal && (
              <button
                onClick={() => setIsEditingPersonal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditingPersonal ? (
            <form onSubmit={handleSavePersonal} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  placeholder="e.g. Senuri Dias"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  placeholder="Tell students and tutors a little about yourself..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Phone (Format validation)
                  </label>
                  <input
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    University / School
                  </label>
                  <input
                    type="text"
                    value={personalForm.university}
                    onChange={(e) => setPersonalForm({ ...personalForm, university: e.target.value })}
                    placeholder="e.g. Univ of Moratuwa"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Degree / Stream</label>
                  <input
                    type="text"
                    value={personalForm.degree}
                    onChange={(e) => setPersonalForm({ ...personalForm, degree: e.target.value })}
                    placeholder="e.g. Engineering / A/L Science"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Year of Study</label>
                  <input
                    type="text"
                    value={personalForm.yearOfStudy}
                    onChange={(e) => setPersonalForm({ ...personalForm, yearOfStudy: e.target.value })}
                    placeholder="e.g. 2nd Year / Grade 12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                >
                  {loadingAction ? 'Saving...' : 'Save details'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Full Name</span>
                <span className="font-bold text-slate-900">{user?.name || 'Not provided'}</span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Bio</span>
                <span className="font-medium text-slate-700 text-right max-w-[65%]">
                  {user?.bio || 'No bio written yet'}
                </span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Phone</span>
                <span className="font-semibold text-slate-800">{user?.phone || 'Not linked'}</span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">University / School</span>
                <span className="font-semibold text-slate-800">{user?.university || 'Not specified'}</span>
              </div>

              <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Degree / Stream</span>
                <span className="font-semibold text-slate-800">{user?.degree || 'Not specified'}</span>
              </div>

              <div className="flex items-start justify-between py-1.5">
                <span className="text-slate-400 font-medium">Year of Study</span>
                <span className="font-semibold text-slate-800">{user?.yearOfStudy || 'Not specified'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: "Tutor details" card (Only if user holds the tutor role) */}
        {hasTutorRole && (
          <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Tutor Credentials</h3>
                  {/* Verification Status Badge */}
                  {tutorProfile?.verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Verification pending</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Displayed publicly in Student Search & tutor directory
                </p>
              </div>

              {!isEditingTutor && (
                <button
                  onClick={() => setIsEditingTutor(true)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingTutor ? (
              <form onSubmit={handleSaveTutor} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={tutorForm.subjects}
                    onChange={(e) => setTutorForm({ ...tutorForm, subjects: e.target.value })}
                    placeholder="e.g. Combined Maths, Physics, Chemistry"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={tutorForm.qualifications}
                    onChange={(e) => setTutorForm({ ...tutorForm, qualifications: e.target.value })}
                    placeholder="e.g. Moratuwa Engineering Undergraduate, District Rank"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Teaching Experience</label>
                  <input
                    type="text"
                    value={tutorForm.experience}
                    onChange={(e) => setTutorForm({ ...tutorForm, experience: e.target.value })}
                    placeholder="e.g. 2 years peer mentoring, 50+ sessions"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Hourly Rate (Optional)</label>
                  <input
                    type="number"
                    value={tutorForm.hourlyRate}
                    onChange={(e) => setTutorForm({ ...tutorForm, hourlyRate: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTutor(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
                  >
                    {loadingAction ? 'Saving...' : 'Save credentials'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2.5 pt-1 text-xs">
                <div className="py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium block mb-1.5">Subjects Taught</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(tutorProfile?.subjects || ['Combined Maths']).map((sub, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[11px]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Qualifications</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[65%]">
                    {tutorProfile?.qualifications || 'Undergraduate Peer Mentor'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Experience</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[65%]">
                    {tutorProfile?.experience || '1+ years tutoring experience'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-1.5">
                  <span className="text-slate-400 font-medium">Hourly Rate</span>
                  <span className="font-semibold text-slate-800">
                    {tutorProfile?.hourlyRate ? `$${tutorProfile.hourlyRate}/hr` : 'Free Peer Tutoring'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Account security & settings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Account & Security</h3>

          <div className="space-y-2 pt-1">
            {/* Change Password */}
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Sign Out */}
            <button
              onClick={async () => {
                await logout();
                onLogout?.();
              }}
              className="w-full p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="w-full p-3 rounded-2xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 font-semibold text-xs flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete Account</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Confirm Also Find a Tutor (Tutee) */}
      {showAddTuteeConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">Enable Student Mode</h4>
              <p className="text-xs text-slate-500 mt-1">
                This adds the "Student / Tutee" role to your account so you can search for peer mentors, view availability, and book sessions.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTuteeConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingAction}
                onClick={handleConfirmAddTutee}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
              >
                {loadingAction ? 'Enabling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Also Offer Tutoring Form (Tutor) */}
      {showAddTutorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <button onClick={() => setShowAddTutorModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div>
              <h4 className="font-bold text-base text-slate-900">Also Offer Tutoring</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your teaching subjects and background. Your profile will be created with a <span className="font-bold text-amber-600">Verification pending</span> badge.
              </p>
            </div>

            <form onSubmit={handleConfirmAddTutor} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Subjects Taught <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTutorSubjects}
                  onChange={(e) => setNewTutorSubjects(e.target.value)}
                  placeholder="e.g. Combined Maths, Chemistry"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Qualifications</label>
                <input
                  type="text"
                  required
                  value={newTutorQuals}
                  onChange={(e) => setNewTutorQuals(e.target.value)}
                  placeholder="e.g. University Undergraduate, Island Top 50"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Experience</label>
                <input
                  type="text"
                  required
                  value={newTutorExp}
                  onChange={(e) => setNewTutorExp(e.target.value)}
                  placeholder="e.g. 1+ years peer mentoring & group study"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Hourly Rate (Optional)</label>
                <input
                  type="number"
                  value={newTutorRate}
                  onChange={(e) => setNewTutorRate(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTutorModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
                >
                  {loadingAction ? 'Creating...' : 'Enable Tutor Mode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Link a Child (Parent) */}
      {showLinkChildModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-slate-900">Link a Student Account</h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your student's unique link code to supervise active tutoring sessions and academic schedules.
              </p>
            </div>

            <form onSubmit={handleConfirmAddParent} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Student Link Code</label>
                <input
                  type="text"
                  required
                  value={linkCodeInput}
                  onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SENURI-2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                Demo code: <span className="font-bold text-rose-600 font-mono">SENURI-2026</span> (Links student Senuri Dias)
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkChildModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs"
                >
                  {loadingAction ? 'Linking...' : 'Link Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Disable Role Confirmation */}
      {roleToDisable && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-slate-900">
                Disable {theme.roles[roleToDisable].name} Mode?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {roleToDisable === 'tutor'
                  ? 'Disabling peer tutor mode will hide your profile from student search while preserving all your existing bookings and history.'
                  : `Are you sure you want to disable ${theme.roles[roleToDisable].name} mode? You can re-enable it anytime.`}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDisable(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Keep Role
              </button>
              <button
                type="button"
                disabled={loadingAction}
                onClick={handleConfirmDisableRole}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs"
              >
                {loadingAction ? 'Disabling...' : 'Confirm Disable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Password */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900">Change Password</h4>
              <button onClick={() => setShowChangePasswordModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                >
                  {loadingAction ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Account */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-bold text-base text-slate-900">Delete Account?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete your user profile, tutor credentials, and authentication account. This action cannot be undone.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Confirm Password</label>
              <input
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                placeholder="Enter password to verify"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingAction}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs"
              >
                {loadingAction ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
