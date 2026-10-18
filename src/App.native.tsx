import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronDown,
  Clock3,
  Flame,
  CalendarDays,
  GraduationCap,
  House,
  Medal,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
} from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import { Booking, TutorProfile, User } from './types';
import { UserRole, theme } from './theme';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  subscribeToAuth,
  switchUserRole,
  takeAuthNotice,
} from './services/auth';
import { getTutors } from './services/tutors';
import {
  acceptBooking,
  cancelBooking,
  createBooking,
  declineBooking,
  getBookingsForUser,
} from './services/bookings';
import { getNotificationsForUser, markNotificationAsRead } from './services/notifications';
import { AppNotification } from './types/notifications';
import { updateProfile } from './services/profile';
import { SAMPLE_AVAILABILITY } from './services/availability';
import { getAnimeAvatarSvg } from './utils/avatars';

type Tab = 'Home' | 'Search' | 'Sessions' | 'Requests' | 'Availability' | 'Progress' | 'Profile' | 'Alerts';

function getAuthErrorMessage(error: unknown, mode: 'login' | 'register'): string {
  const authError =
    error !== null && typeof error === 'object'
      ? error as { code?: unknown; message?: unknown }
      : {};
  const code = typeof authError.code === 'string' ? authError.code : '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email. Switch to Sign in and use the password you created.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect. Check your details, or use a demo account.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your internet connection and try again.';
    default: {
      const message =
        typeof authError.message === 'string'
          ? authError.message
          : mode === 'login'
            ? 'Could not sign in. Please try again.'
            : 'Could not create your account. Please try again.';
      try {
        const parsed = JSON.parse(message) as { error?: string };
        return parsed.error || 'Firebase could not complete the request. Check your connection and try again.';
      } catch {
        return message;
      }
    }
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  tutee: 'Student',
  tutor: 'Tutor',
  parent: 'Parent',
};

const ROLE_COLORS: Record<UserRole, string> = {
  tutee: theme.colors.tutee,
  tutor: theme.colors.tutor,
  parent: theme.colors.parent,
};

function NativeButton({
  label,
  onPress,
  color = theme.colors.tutee,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary ? styles.secondaryButton : { backgroundColor: color },
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

function AppHeader({
  title,
  subtitle,
  role,
  unreadCount,
  onAlerts,
  onRoleChange,
}: {
  title: string;
  subtitle: string;
  role: UserRole;
  unreadCount: number;
  onAlerts: () => void;
  onRoleChange: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerBrandMark}><GraduationCap color="#FFFFFF" size={15} /></View>
          <Text style={styles.brand}>Tutor<Text style={styles.brandAccent}>Link</Text></Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <Text numberOfLines={1} style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.headerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Switch role, current role ${ROLE_LABELS[role]}`} onPress={onRoleChange} style={styles.roleSelector}>
          <Text style={[styles.roleSelectorText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
          <ChevronDown color={theme.colors.textSecondary} size={13} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onAlerts} style={styles.alertButton}>
        <Bell color={ROLE_COLORS[role]} size={20} strokeWidth={1.8} />
        {unreadCount > 0 && <View style={styles.notificationDot} />}
        </Pressable>
      </View>
    </View>
  );
}

function Avatar({
  name,
  uri,
  size = 44,
  borderColor = theme.colors.surface,
}: {
  name: string;
  uri?: string;
  size?: number;
  borderColor?: string;
}) {
  const avatarSvg = getAnimeAvatarSvg(name);
  const showNativeSvg = !uri || uri.startsWith('data:image/svg+xml');
  return (
    <View style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2, borderColor }]}>
      {showNativeSvg && avatarSvg ? (
        <SvgXml xml={avatarSvg} width={size} height={size} />
      ) : uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text style={styles.avatarImageFallback}>{name.slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
  );
}

function AuthGate({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [role, setRole] = useState<UserRole>('tutee');
  const [mode, setMode] = useState<'choose' | 'login' | 'register'>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (mode === 'choose') return;
    const submitMode = mode;
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email or demo username and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Enter your name to create an account.');
      return;
    }
    setBusy(true);
    try {
      const user =
        submitMode === 'register'
          ? await registerUser(email.trim(), password, name.trim(), role)
          : await loginUser(email.trim(), password, role);
      const notice = takeAuthNotice();
      if (notice) Alert.alert('Signed in with limited cloud access', notice);
      onAuthenticated(user);
    } catch (cause) {
      const errorCode =
        cause !== null && typeof cause === 'object' && 'code' in cause
          ? cause.code
          : undefined;
      setError(getAuthErrorMessage(cause, submitMode));
      if (errorCode === 'auth/email-already-in-use') setMode('login');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'choose') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <View style={styles.brandMark}><GraduationCap color="#FFFFFF" size={30} strokeWidth={1.8} /></View>
          <Text style={styles.authTitle}>Learn together.{'\n'}Grow together.</Text>
          <Text style={styles.authSubtitle}>Find trusted peer tutors and make every study session count.</Text>
          <Heading>Choose how you’ll use TutorLink</Heading>
          {(['tutee', 'tutor', 'parent'] as UserRole[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setRole(item);
                setMode('login');
              }}
              style={styles.roleCard}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: item === 'tutee' ? theme.colors.tuteeLight : item === 'tutor' ? theme.colors.tutorLight : theme.colors.parentLight }]}>
                {item === 'tutee' ? <BookOpen color={ROLE_COLORS[item]} size={22} /> : item === 'tutor' ? <GraduationCap color={ROLE_COLORS[item]} size={22} /> : <UsersRound color={ROLE_COLORS[item]} size={22} />}
              </View>
              <View style={styles.roleCardCopy}>
                <Text style={styles.roleCardTitle}>{ROLE_LABELS[item]}</Text>
                <Text style={styles.muted}>
                  {item === 'tutee' ? 'Find help with your studies' : item === 'tutor' ? 'Teach and share your skills' : 'Follow your child’s progress'}
                </Text>
              </View>
              <View style={[styles.roleArrow, { backgroundColor: ROLE_COLORS[item] }]}><ArrowRight color="#FFFFFF" size={17} /></View>
            </Pressable>
          ))}
          <Text style={styles.demoHint}>Demo sign-in: student, tutor, or parent · any password</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.authContent}>
        <Pressable onPress={() => { setError(''); setMode('choose'); }} style={styles.backLink}>
          <Text style={styles.linkText}>‹  Choose another role</Text>
        </Pressable>
        <View style={styles.authBrandRow}>
          <View style={styles.authBrandMark}><GraduationCap color="#FFFFFF" size={20} /></View>
          <Text style={styles.authBrand}>Tutor<Text style={styles.brandAccent}>Link</Text></Text>
        </View>
        <Text style={styles.authTitle}>{mode === 'register' ? 'Join the TutorLink community' : 'Welcome back to TutorLink'}</Text>
        <Text style={styles.authSubtitle}>
          {mode === 'register' ? 'Get started by creating your peer learning account.' : 'Sign in to access your sessions, schedules, and reviews.'}
        </Text>
        <Text style={styles.fieldLabel}>Your account role</Text>
        <View style={styles.authRoleRow}>
          {(['tutee', 'tutor', 'parent'] as UserRole[]).map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: role === item }}
              onPress={() => setRole(item)}
              style={[styles.authRoleChip, role === item && { backgroundColor: ROLE_COLORS[item], borderColor: ROLE_COLORS[item] }]}
            >
              <Text style={[styles.authRoleChipText, role === item && styles.authRoleChipTextSelected]}>{ROLE_LABELS[item]}</Text>
            </Pressable>
          ))}
        </View>
        {mode === 'register' && <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" />}
        <Field
          label="Email or demo username"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com or student"
          keyboardType="email-address"
        />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry />
        {!!error && <View accessibilityRole="alert" style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
        <NativeButton
          label={busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          onPress={submit}
          color={ROLE_COLORS[role]}
          disabled={busy}
        />
        {mode === 'login' && (
          <View style={styles.demoButtons}>
            <View style={styles.demoTitleRow}>
              <Sparkles color={theme.colors.amber} size={15} />
              <Text style={styles.fieldLabel}>Or try a demo account</Text>
            </View>
            {[
              { label: 'Student: Senuri Dias', subtitle: 'A/L Student · Combined Maths', name: 'Senuri Dias', value: 'student', role: 'tutee' as UserRole },
              { label: 'Tutor: Kavindu Perera', subtitle: 'Peer tutor · Moratuwa Engineering', name: 'Kavindu Perera', value: 'tutor', role: 'tutor' as UserRole },
              { label: 'Parent: Malani Jayawardena', subtitle: 'Follow a student’s progress', name: 'Malani Jayawardena', value: 'parent', role: 'parent' as UserRole },
            ].map((demo) => (
              <Pressable
                key={demo.value}
                accessibilityRole="button"
                disabled={busy}
                onPress={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    const user = await loginUser(demo.value, 'demo', demo.role);
                    const notice = takeAuthNotice();
                    if (notice) Alert.alert('Signed in with limited cloud access', notice);
                    onAuthenticated(user);
                  } catch (cause) {
                    setError(getAuthErrorMessage(cause, 'login'));
                  } finally {
                    setBusy(false);
                  }
                }}
                style={styles.demoAccountCard}
              >
                <Avatar name={demo.name} size={36} />
                <View style={styles.demoAccountCopy}>
                  <Text style={styles.demoAccountTitle}>{demo.label}</Text>
                  <Text style={styles.demoAccountSubtitle}>{demo.subtitle}</Text>
                </View>
                <ArrowRight color={ROLE_COLORS[demo.role]} size={16} />
              </Pressable>
            ))}
          </View>
        )}
        <Pressable onPress={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          <Text style={styles.switchAuth}>
            {mode === 'login' ? 'New to TutorLink? Create an account' : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function TutorCard({
  tutor,
  accent,
  onBook,
}: {
  tutor: TutorProfile;
  accent: string;
  onBook?: (tutor: TutorProfile) => void;
}) {
  return (
    <Card>
      <View style={styles.tutorRow}>
      <Avatar name={tutor.name} uri={tutor.avatarUrl} size={42} />
        <View style={styles.tutorCopy}>
          <Text style={styles.cardTitle}>{tutor.name}</Text>
          <Text style={styles.muted}>{tutor.headline || tutor.qualifications}</Text>
          <Text style={styles.rating}>★ {tutor.rating.toFixed(1)}  ·  {tutor.completedSessions} sessions</Text>
        </View>
      </View>
      <Text style={styles.subjectText}>{tutor.subjects.join('  ·  ')}</Text>
      {onBook && <NativeButton label="Request a session" color={accent} onPress={() => onBook(tutor)} />}
    </Card>
  );
}

function BookingCard({
  booking,
  role,
  onAction,
}: {
  booking: Booking;
  role: UserRole;
  onAction: (booking: Booking, action: 'accept' | 'decline' | 'join' | 'cancel') => void;
}) {
  const person = role === 'tutor' ? booking.tuteeName : booking.tutorName;
  const statusColor = booking.status === 'accepted' ? theme.colors.success : booking.status === 'pending' ? theme.colors.warning : theme.colors.textMuted;
  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{booking.subject}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{booking.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.cardBody}>{person}  ·  {booking.date} at {booking.time}</Text>
      {!!booking.notes && <Text style={styles.muted}>{booking.notes}</Text>}
      {role === 'tutor' && booking.status === 'pending' && (
        <View style={styles.buttonRow}>
          <View style={styles.buttonFlex}><NativeButton label="Accept" color={theme.colors.success} onPress={() => onAction(booking, 'accept')} /></View>
          <View style={styles.buttonFlex}><NativeButton label="Decline" secondary onPress={() => onAction(booking, 'decline')} /></View>
        </View>
      )}
      {role !== 'tutor' && booking.status === 'accepted' && !!booking.meetingLink && (
        <NativeButton label="Open meeting link" onPress={() => onAction(booking, 'join')} />
      )}
      {role === 'tutee' && booking.status === 'pending' && (
        <NativeButton label="Cancel request" secondary onPress={() => onAction(booking, 'cancel')} />
      )}
    </Card>
  );
}

function ProfileScreen({
  user,
  onChange,
  onSwitchRole,
  onLogout,
}: {
  user: User;
  onChange: (user: User) => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone || '');
    setBio(user.bio || '');
  }, [user]);

  return (
    <>
      <Card>
        <View style={styles.profileIdentity}>
          <Avatar name={user.name} uri={user.avatarUrl} size={48} />
          <View><Text style={styles.cardTitle}>{user.name}</Text><Text style={styles.muted}>{user.email}</Text></View>
        </View>
      </Card>
      <Heading>Personal details</Heading>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="About you" value={bio} onChangeText={setBio} multiline />
      <NativeButton
        label={saving ? 'Saving…' : 'Save profile'}
        onPress={async () => {
          setSaving(true);
          try {
            onChange(await updateProfile(user.uid, { name, phone, bio }));
            Alert.alert('Profile saved', 'Your profile details have been updated.');
          } catch (cause) {
            Alert.alert('Could not save profile', cause instanceof Error ? cause.message : 'Please try again.');
          } finally {
            setSaving(false);
          }
        }}
        color={ROLE_COLORS[user.activeRole]}
        disabled={saving}
      />
      <Heading>Switch your role</Heading>
      <View style={styles.roleSwitchRow}>
        {(['tutee', 'tutor', 'parent'] as UserRole[]).map((role) => (
          <Pressable key={role} onPress={() => onSwitchRole(role)} style={[styles.rolePill, user.activeRole === role && { backgroundColor: ROLE_COLORS[role] }]}>
            <Text style={[styles.rolePillText, user.activeRole === role && styles.activeRolePillText]}>{ROLE_LABELS[role]}</Text>
          </Pressable>
        ))}
      </View>
      <NativeButton label="Sign out" secondary onPress={onLogout} />
    </>
  );
}

function StudentDashboard({
  user,
  bookings,
  tutors,
  onSeeTutors,
  onBook,
  onJoin,
  onViewSessions,
}: {
  user: User;
  bookings: Booking[];
  tutors: TutorProfile[];
  onSeeTutors: () => void;
  onBook: (tutor: TutorProfile) => void;
  onJoin: (booking: Booking) => void;
  onViewSessions: () => void;
}) {
  const nextSession = bookings.find((booking) => booking.status === 'accepted') || bookings[0];
  const recommended = tutors.filter((tutor) => tutor.uid !== user.uid).slice(0, 4);

  return (
    <>
      {nextSession && (
        <View style={styles.upNextCard}>
          <View style={styles.upNextTopRow}>
            <Text style={styles.upNextEyebrow}>UP NEXT · {nextSession.date.toUpperCase()}</Text>
            <Text style={styles.upNextTime}>{nextSession.time}</Text>
          </View>
          <View style={styles.upNextMainRow}>
            <Pressable style={styles.upNextTutor} onPress={onViewSessions}>
              <Avatar name={nextSession.tutorName} uri={nextSession.tutorAvatar} size={46} borderColor="#FFFFFF" />
              <View style={styles.upNextCopy}>
                <Text numberOfLines={1} style={styles.upNextTitle}>{nextSession.subject} with {nextSession.tutorName.split(' ')[0]}</Text>
                <Text numberOfLines={1} style={styles.upNextDescription}>{nextSession.notes || 'Tutoring session'} · {nextSession.durationMins} min</Text>
              </View>
            </Pressable>
            {nextSession.status === 'accepted' && nextSession.meetingLink ? (
              <Pressable accessibilityRole="button" onPress={() => onJoin(nextSession)} style={styles.joinButton}>
                <Video color={theme.colors.tutee} size={14} />
                <Text style={styles.joinButtonText}>Join</Text>
              </Pressable>
            ) : (
              <Text style={styles.pendingBadge}>{nextSession.status === 'pending' ? 'Pending' : 'Link soon'}</Text>
            )}
          </View>
          {!!nextSession.meetingLink && (
            <View style={styles.upNextFooter}>
              <Text numberOfLines={1} style={styles.meetingPreview}>Room: {nextSession.meetingLink}</Text>
              <Pressable onPress={onViewSessions}><Text style={styles.detailsLink}>View Details</Text></Pressable>
            </View>
          )}
        </View>
      )}

      <View style={styles.goalCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.dashboardSectionTitle}>Weekly learning goal</Text>
          <Text style={styles.goalCount}>3 of 4 hours</Text>
        </View>
        <View style={styles.goalTrack}><View style={styles.goalProgress} /></View>
        <Text style={styles.goalNote}>One more focused hour to hit your streak</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.dashboardMetricAmber}>
          <View style={styles.metricLabelRow}><Flame color="#F59E0B" size={14} /><Text style={styles.metricLabelAmber}>Study streak</Text></View>
          <Text style={styles.metricValueAmber}>6 days</Text>
        </View>
        <View style={styles.dashboardMetricGreen}>
          <View style={styles.metricLabelRow}><Medal color="#059669" size={14} /><Text style={styles.metricLabelGreen}>Topics mastered</Text></View>
          <Text style={styles.metricValueGreen}>12</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.dashboardSectionTitle}>Recommended peer tutors</Text>
        <Pressable onPress={onSeeTutors}><Text style={styles.seeAllLink}>See all</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendations}>
        {recommended.map((tutor) => (
          <Pressable key={tutor.uid} onPress={() => onBook(tutor)} style={styles.recommendedCard}>
            <Avatar name={tutor.name} uri={tutor.avatarUrl} size={38} />
            <View style={styles.recommendedCopy}>
              <Text numberOfLines={1} style={styles.recommendedName}>{tutor.name}</Text>
              <Text numberOfLines={1} style={styles.recommendedSubject}>{tutor.subjects[0] || 'Peer tutor'}</Text>
              <View style={styles.recommendedRating}><Text style={styles.star}>★</Text><Text style={styles.recommendedRatingText}>{tutor.rating}</Text></View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.marketplaceBanner}>
        <View style={styles.metricLabelRow}>
          <Sparkles color={theme.colors.tutee} size={15} />
          <Text style={styles.marketplaceTitle}>Peer Marketplace Ready</Text>
        </View>
        <Text style={styles.marketplaceCaption}>Live External Calls</Text>
      </View>
    </>
  );
}

function AppShell({ initialUser, onLogout }: { initialUser: User; onLogout: () => void }) {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState<Tab>('Home');
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const role = user.activeRole || user.role || 'tutee';
  const accent = ROLE_COLORS[role];

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const reload = async () => {
    setLoading(true);
    try {
      const [tutorList, bookingList, notificationList] = await Promise.all([
        getTutors(),
        getBookingsForUser(user.uid, role),
        getNotificationsForUser(user.uid),
      ]);
      setTutors(tutorList);
      setBookings(bookingList);
      setNotifications(notificationList);
    } catch (cause) {
      Alert.alert('Could not load TutorLink', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [user.uid, role]);

  const visibleBookings = useMemo(() => {
    if (role === 'tutor') return bookings.filter((booking) => booking.tutorUid === user.uid || user.uid === 'tutor_kavindu');
    if (role === 'parent') return bookings.filter((booking) => booking.tuteeUid === (user.linkedChildUid || 'user_senuri'));
    return bookings.filter((booking) => booking.tuteeUid === user.uid || user.uid === 'user_senuri');
  }, [bookings, role, user.uid, user.linkedChildUid]);

  const onBookingAction = async (booking: Booking, action: 'accept' | 'decline' | 'join' | 'cancel') => {
    if (action === 'join') {
      if (!booking.meetingLink) return;
      try {
        await Linking.openURL(booking.meetingLink);
      } catch (cause) {
        Alert.alert('Could not open meeting', cause instanceof Error ? cause.message : 'Check that a browser is installed.');
      }
      return;
    }
    if (action === 'cancel') {
      Alert.alert(
        'Cancel session request?',
        `Remove your pending request to ${booking.tutorName}?`,
        [
          { text: 'Keep request', style: 'cancel' },
          {
            text: 'Cancel request',
            style: 'destructive',
            onPress: () => {
              void cancelBooking(booking.id, user.uid)
                .then(reload)
                .catch((cause: unknown) => {
                  Alert.alert('Could not cancel request', cause instanceof Error ? cause.message : 'Please try again.');
                });
            },
          },
        ],
      );
      return;
    }
    try {
      if (action === 'accept') await acceptBooking(booking.id);
      else await declineBooking(booking.id);
      await reload();
    } catch (cause) {
      Alert.alert('Could not update session', cause instanceof Error ? cause.message : 'Please try again.');
    }
  };

  const bookTutor = (tutor: TutorProfile) => {
    Alert.alert(
      'Request a session',
      `Send ${tutor.name} a request for ${tutor.subjects[0]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send request',
          onPress: () => {
            void createBooking({
              tuteeUid: user.uid,
              tuteeName: user.name,
              tutorUid: tutor.uid,
              tutorName: tutor.name,
              tutorAvatar: tutor.avatarUrl,
              subject: tutor.subjects[0] || 'General tutoring',
            }).then(async () => {
              Alert.alert('Request sent', 'Your session request has been sent to the tutor.');
              setTab('Sessions');
              await reload();
            }).catch((cause: unknown) => {
              Alert.alert('Could not send request', cause instanceof Error ? cause.message : 'Please try again.');
            });
          },
        },
      ],
    );
  };

  const switchRole = async (newRole: UserRole) => {
    try {
      const updated = await switchUserRole(user.uid, newRole);
      setUser(updated);
      setTab('Home');
    } catch (cause) {
      Alert.alert('Could not switch role', cause instanceof Error ? cause.message : 'Please try again.');
    }
  };

  const tabs: { id: Tab; label: string; Icon: typeof House }[] = [
    { id: 'Home', label: 'Home', Icon: House },
    { id: 'Search', label: 'Search', Icon: Search },
    { id: 'Sessions', label: 'Sessions', Icon: CalendarDays },
    { id: 'Profile', label: 'Profile', Icon: UserRound },
  ];
  const selectedTab = tab === 'Requests' || tab === 'Progress' ? 'Sessions' : tab === 'Alerts' || tab === 'Availability' ? '' : tab;

  const title = tab === 'Home' ? (role === 'tutor' ? 'Tutor studio' : role === 'parent' ? 'Family learning' : 'Your learning hub') : tab;

  const renderScreen = () => {
    if (loading && !tutors.length && !bookings.length) {
      return <Text style={styles.muted}>Loading your TutorLink data…</Text>;
    }
    if (tab === 'Search') {
      const availableTutors = tutors.filter((tutor) => tutor.uid !== user.uid);
      return (
        <>
          <Text style={styles.muted}>Browse peer tutors and request a study session.</Text>
          {availableTutors.map((tutor) => (
            <TutorCard
              key={tutor.uid}
              tutor={tutor}
              accent={accent}
              onBook={role === 'tutee' ? bookTutor : undefined}
            />
          ))}
          {!availableTutors.length && (
            <Card><Text style={styles.cardBody}>No other tutors are available right now.</Text></Card>
          )}
        </>
      );
    }
    if (tab === 'Sessions' || tab === 'Requests' || (tab === 'Progress' && role === 'parent')) {
      const list = tab === 'Requests' ? visibleBookings.filter((booking) => booking.status === 'pending') : visibleBookings;
      return (
        <>
          <Heading>{tab === 'Requests' ? 'Requests waiting for you' : tab === 'Progress' ? 'Your child’s sessions' : 'Upcoming and past sessions'}</Heading>
          {list.length ? list.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role={role} onAction={(item, action) => void onBookingAction(item, action)} />
          )) : <Card><Text style={styles.cardBody}>No sessions yet. New sessions will appear here.</Text></Card>}
        </>
      );
    }
    if (tab === 'Availability' && role === 'tutor') {
      return (
        <>
          <Heading>Your availability</Heading>
          <Card><Text style={styles.cardBody}>Your weekly schedule is shown below.</Text></Card>
          {SAMPLE_AVAILABILITY.filter((slot) => slot.tutorUid === 'tutor_kavindu').map((slot) => (
            <Card key={slot.id}><Text style={styles.cardTitle}>{slot.day}</Text><Text style={styles.cardBody}>{slot.start} – {slot.end}</Text></Card>
          ))}
          <Text style={styles.muted}>Availability editing will be enabled when tutor schedules are connected to your account.</Text>
        </>
      );
    }
    if (tab === 'Alerts') {
      return (
        <>
          <Heading>Notifications</Heading>
          {notifications.length ? notifications.map((notification) => (
            <Pressable key={notification.id} onPress={() => {
              void markNotificationAsRead(notification.id).then(reload).catch((cause: unknown) => {
                Alert.alert('Could not update notification', cause instanceof Error ? cause.message : 'Please try again.');
              });
            }}>
              <Card>
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{notification.title}</Text>{!notification.read && <Text style={[styles.unreadDot, { color: accent }]}>●</Text>}</View>
                <Text style={styles.cardBody}>{notification.message}</Text>
              </Card>
            </Pressable>
          )) : <Card><Text style={styles.cardBody}>You’re all caught up.</Text></Card>}
        </>
      );
    }
    if (tab === 'Profile') {
      return (
        <ProfileScreen
          user={user}
          onChange={setUser}
          onSwitchRole={(selectedRole) => void switchRole(selectedRole)}
          onLogout={onLogout}
        />
      );
    }

    if (role === 'tutor') {
      const pending = visibleBookings.filter((booking) => booking.status === 'pending');
      return (
        <>
          <Card><Text style={styles.eyebrow}>WELCOME BACK</Text><Text style={styles.heroTitle}>{user.name}</Text><Text style={styles.cardBody}>Your knowledge can make someone’s next breakthrough.</Text></Card>
          <View style={styles.metricRow}>
            <Metric value={String(pending.length)} label="New requests" accent={accent} />
            <Metric value={String(visibleBookings.filter((item) => item.status === 'accepted').length)} label="Upcoming" accent={accent} />
          </View>
          <NativeButton label="Review requests" color={accent} onPress={() => setTab('Requests')} />
          <NativeButton label="View availability" secondary onPress={() => setTab('Availability')} />
          <Heading>Your next sessions</Heading>
          {visibleBookings.slice(0, 3).map((booking) => <BookingCard key={booking.id} booking={booking} role={role} onAction={(item, action) => void onBookingAction(item, action)} />)}
        </>
      );
    }
    if (role === 'parent') {
      const childSessions = visibleBookings.filter((booking) => booking.status === 'accepted').length;
      return (
        <>
          <Card><Text style={styles.eyebrow}>FAMILY OVERVIEW</Text><Text style={styles.heroTitle}>Welcome, {user.name}</Text><Text style={styles.cardBody}>Keep up with {user.linkedChildName || 'your child'}’s tutoring progress.</Text></Card>
          <View style={styles.metricRow}>
            <Metric value={String(childSessions)} label="Active sessions" accent={accent} />
            <Metric value={String(visibleBookings.filter((item) => item.status === 'pending').length)} label="Pending" accent={accent} />
          </View>
          <NativeButton label="View session progress" color={accent} onPress={() => setTab('Progress')} />
          <Heading>Recent sessions</Heading>
          {visibleBookings.slice(0, 3).map((booking) => <BookingCard key={booking.id} booking={booking} role={role} onAction={(item, action) => void onBookingAction(item, action)} />)}
        </>
      );
    }
    return (
      <StudentDashboard
        user={user}
        bookings={visibleBookings}
        tutors={tutors}
        onSeeTutors={() => setTab('Search')}
        onBook={bookTutor}
        onJoin={(booking) => void onBookingAction(booking, 'join')}
        onViewSessions={() => setTab('Sessions')}
      />
    );
  };

  if (!user) return null;
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={title}
        subtitle={`Welcome back, ${user.name.split(' ')[0]}`}
        role={role}
        unreadCount={notifications.filter((notification) => !notification.read).length}
        onAlerts={() => setTab('Alerts')}
        onRoleChange={() => {
          Alert.alert('Switch role', 'Choose the TutorLink experience you want to use.', [
            ...(['tutee', 'tutor', 'parent'] as UserRole[]).map((nextRole) => ({
              text: ROLE_LABELS[nextRole],
              onPress: () => void switchRole(nextRole),
            })),
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
      />
      <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
        {renderScreen()}
        <Pressable onPress={() => void reload()} style={styles.refreshLink}><Text style={styles.linkText}>Refresh</Text></Pressable>
      </ScrollView>
      <View style={styles.tabBar}>
        {tabs.map(({ id, label, Icon }) => (
          <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: id === selectedTab }} onPress={() => setTab(id)} style={styles.tabItem}>
            <Icon color={id === selectedTab ? accent : theme.colors.textMuted} size={19} strokeWidth={1.7} />
            <Text style={[styles.tabLabel, id === selectedTab && { color: accent, fontWeight: '700' }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function Metric({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <View style={[styles.metric, { borderTopColor: accent }]}>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    return subscribeToAuth(setUser);
  }, []);

  return user ? (
    <AppShell
      initialUser={user}
      onLogout={() => {
        void logoutUser().then(() => setUser(null)).catch((cause: unknown) => {
          Alert.alert('Could not sign out', cause instanceof Error ? cause.message : 'Please try again.');
        });
      }}
    />
  ) : <AuthGate onAuthenticated={setUser} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  authContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40, paddingTop: 16 },
  brandMark: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: theme.colors.tutee, borderRadius: 18, height: 58, justifyContent: 'center', marginBottom: 26, width: 58 },
  authTitle: { color: theme.colors.text, fontSize: 31, fontWeight: '800', lineHeight: 38, marginBottom: 10, marginTop: 12 },
  authSubtitle: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 23, marginBottom: 30 },
  authBrandRow: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 14 },
  authBrandMark: { alignItems: 'center', backgroundColor: theme.colors.tutee, borderRadius: 11, height: 38, justifyContent: 'center', width: 38 },
  authBrand: { color: theme.colors.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },
  authRoleRow: { flexDirection: 'row', gap: 8, marginBottom: 18, marginTop: 8 },
  authRoleChip: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: theme.colors.border, borderRadius: 12, borderWidth: 1, flex: 1, minHeight: 40, justifyContent: 'center', paddingHorizontal: 6 },
  authRoleChipText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' },
  authRoleChipTextSelected: { color: '#FFFFFF' },
  sectionHeading: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 20 },
  roleCard: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 10, padding: 16 },
  roleIconWrap: { alignItems: 'center', borderRadius: 14, height: 52, justifyContent: 'center', marginRight: 14, width: 52 },
  roleCardCopy: { flex: 1 },
  roleCardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  chevron: { color: theme.colors.textMuted, fontSize: 26, marginLeft: 8 },
  roleArrow: { alignItems: 'center', borderRadius: 18, height: 34, justifyContent: 'center', width: 34 },
  demoHint: { color: theme.colors.textMuted, fontSize: 12, marginTop: 18, textAlign: 'center' },
  backLink: { marginBottom: 28, paddingVertical: 8 },
  linkText: { color: theme.colors.tutee, fontSize: 14, fontWeight: '600' },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '600', marginBottom: 7 },
  input: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: 12, borderWidth: 1, color: theme.colors.text, fontSize: 15, minHeight: 48, paddingHorizontal: 14, paddingVertical: 12 },
  multilineInput: { minHeight: 92, textAlignVertical: 'top' },
  button: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', marginBottom: 10, minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
  secondaryButtonText: { color: theme.colors.text },
  disabledButton: { opacity: 0.55 },
  demoButtons: { backgroundColor: '#F8FAFC', borderColor: theme.colors.borderLight, borderRadius: 16, borderWidth: 1, gap: 8, marginTop: 16, padding: 12 },
  demoTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: 2 },
  demoAccountCard: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 58, paddingHorizontal: 10, paddingVertical: 8 },
  demoAccountCopy: { flex: 1, minWidth: 0 },
  demoAccountTitle: { color: theme.colors.text, fontSize: 11, fontWeight: '700' },
  demoAccountSubtitle: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 3 },
  switchAuth: { color: theme.colors.tutee, fontSize: 14, fontWeight: '600', marginTop: 20, textAlign: 'center' },
  errorBox: { backgroundColor: theme.colors.dangerLight, borderColor: '#FECACA', borderRadius: 11, borderWidth: 1, marginBottom: 12, padding: 11 },
  errorText: { color: '#B91C1C', fontSize: 12, lineHeight: 18 },
  header: { alignItems: 'center', backgroundColor: theme.colors.surface, flexDirection: 'row', justifyContent: 'space-between', minHeight: 76, paddingHorizontal: 14, paddingVertical: 10 },
  headerText: { flex: 1, minWidth: 0 },
  headerTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  headerBrandMark: { alignItems: 'center', backgroundColor: theme.colors.tutee, borderRadius: 7, height: 26, justifyContent: 'center', width: 26 },
  brand: { color: theme.colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.4 },
  brandAccent: { color: theme.colors.tutee },
  headerTitle: { color: theme.colors.text, flexShrink: 1, fontSize: 14, fontWeight: '700', marginLeft: 'auto', textAlign: 'right' },
  headerSubtitle: { color: theme.colors.textSecondary, fontSize: 11, marginLeft: 31, marginTop: 2 },
  headerActions: { alignItems: 'center', flexDirection: 'row', gap: 7, marginLeft: 8 },
  roleSelector: { alignItems: 'center', backgroundColor: theme.colors.tuteeLight, borderColor: '#D9D6FE', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 4, minHeight: 32, paddingHorizontal: 8 },
  roleSelectorText: { fontSize: 10, fontWeight: '700' },
  alertButton: { alignItems: 'center', backgroundColor: theme.colors.cardBackground, borderRadius: 19, height: 38, justifyContent: 'center', width: 38 },
  notificationDot: { backgroundColor: theme.colors.danger, borderColor: theme.colors.surface, borderRadius: 5, borderWidth: 1.5, height: 10, position: 'absolute', right: 8, top: 8, width: 10 },
  screenContent: { padding: 14, paddingBottom: 24 },
  card: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16 },
  rowBetween: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  cardBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 6 },
  muted: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
  tutorRow: { alignItems: 'center', flexDirection: 'row' },
  tutorCopy: { flex: 1, marginLeft: 12 },
  avatarImage: { alignItems: 'center', backgroundColor: theme.colors.tuteeLight, borderWidth: 1.5, justifyContent: 'center', overflow: 'hidden' },
  avatarImageFallback: { color: theme.colors.tutee, fontSize: 16, fontWeight: '800' },
  avatar: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', width: 48 },
  avatarText: { fontSize: 16, fontWeight: '800' },
  rating: { color: theme.colors.amber, fontSize: 12, fontWeight: '700', marginTop: 5 },
  subjectText: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 14, marginTop: 14 },
  status: { fontSize: 11, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  buttonFlex: { flex: 1 },
  profileIdentity: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  roleSwitchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  rolePill: { backgroundColor: theme.colors.cardBackground, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 },
  rolePillText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  activeRolePillText: { color: '#FFFFFF' },
  tabBar: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 8, paddingHorizontal: 4, paddingTop: 10 },
  tabItem: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center', minHeight: 50, paddingHorizontal: 2 },
  tabLabel: { color: theme.colors.textSecondary, fontSize: 10, textAlign: 'center' },
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metric: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: 14, borderTopWidth: 3, flex: 1, padding: 14 },
  metricValue: { fontSize: 25, fontWeight: '800', marginBottom: 4 },
  eyebrow: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: theme.colors.text, fontSize: 23, fontWeight: '800', marginTop: 8 },
  refreshLink: { alignItems: 'center', paddingVertical: 14 },
  unreadDot: { fontSize: 12 },
  upNextCard: { backgroundColor: '#5950F5', borderRadius: 22, elevation: 4, marginBottom: 14, padding: 17, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 8 },
  upNextTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  upNextEyebrow: { color: '#DCD9FF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  upNextTime: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, color: '#FFFFFF', fontSize: 10, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4 },
  upNextMainRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  upNextTutor: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 10, minWidth: 0, paddingRight: 7 },
  upNextCopy: { flex: 1, minWidth: 0 },
  upNextTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  upNextDescription: { color: '#E5E7FF', fontSize: 10, marginTop: 3 },
  joinButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, flexDirection: 'row', gap: 5, minHeight: 36, paddingHorizontal: 10 },
  joinButtonText: { color: theme.colors.tuteeDark, fontSize: 11, fontWeight: '800' },
  pendingBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 13, color: '#FFFFFF', fontSize: 10, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 7 },
  upNextFooter: { alignItems: 'center', borderTopColor: 'rgba(255,255,255,0.22)', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 9 },
  meetingPreview: { color: '#E5E7FF', flex: 1, fontSize: 9, marginRight: 8 },
  detailsLink: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textDecorationLine: 'underline' },
  goalCard: { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: 20, borderWidth: 1, elevation: 2, marginBottom: 14, padding: 16, shadowColor: '#1F2937', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5 },
  dashboardSectionTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  goalCount: { color: theme.colors.tutee, fontSize: 10, fontWeight: '800' },
  goalTrack: { backgroundColor: '#EEF0F7', borderRadius: 8, height: 8, marginTop: 10, overflow: 'hidden' },
  goalProgress: { backgroundColor: '#7367F0', borderRadius: 8, height: '100%', width: '75%' },
  goalNote: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 7 },
  dashboardMetricAmber: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7', borderRadius: 20, borderWidth: 1, flex: 1, minHeight: 76, padding: 13 },
  dashboardMetricGreen: { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7', borderRadius: 20, borderWidth: 1, flex: 1, minHeight: 76, padding: 13 },
  metricLabelRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  metricLabelAmber: { color: '#A16207', fontSize: 10, fontWeight: '700' },
  metricLabelGreen: { color: '#047857', fontSize: 10, fontWeight: '700' },
  metricValueAmber: { color: '#D97706', fontSize: 22, fontWeight: '800', marginTop: 2 },
  metricValueGreen: { color: '#059669', fontSize: 22, fontWeight: '800', marginTop: 2 },
  sectionHeaderRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, marginTop: 1 },
  seeAllLink: { color: theme.colors.tutee, fontSize: 10, fontWeight: '700' },
  recommendations: { gap: 9, paddingBottom: 2 },
  recommendedCard: { alignItems: 'center', backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight, borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 65, paddingHorizontal: 10, width: 172 },
  recommendedCopy: { flex: 1, minWidth: 0 },
  recommendedName: { color: theme.colors.text, fontSize: 10, fontWeight: '800' },
  recommendedSubject: { color: '#0F9F82', fontSize: 9, marginTop: 2 },
  recommendedRating: { alignItems: 'center', flexDirection: 'row', gap: 3, marginTop: 2 },
  star: { color: '#F59E0B', fontSize: 11 },
  recommendedRatingText: { color: '#92400E', fontSize: 9, fontWeight: '700' },
  marketplaceBanner: { alignItems: 'center', backgroundColor: theme.colors.tuteeLight, borderColor: '#D9D6FE', borderRadius: 15, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingHorizontal: 12, paddingVertical: 11 },
  marketplaceTitle: { color: theme.colors.tuteeDark, fontSize: 10, fontWeight: '700' },
  marketplaceCaption: { color: theme.colors.tutee, fontSize: 9, fontWeight: '600' },
});
