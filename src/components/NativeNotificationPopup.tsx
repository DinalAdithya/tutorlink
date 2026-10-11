/**
 * NativeNotificationPopup
 * React Native Modal Pop-up Window for real-time notification alerts
 * Displays when:
 * 1. Student sends a session request -> Tutor receives pop-up window
 * 2. Tutor accepts the session request -> Student receives pop-up window
 *
 * Fully compatible with Expo / React Native on Android APK (EAS Build)
 * and React Native Web in AI Studio preview.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { AppNotification } from '../types';

interface NativeNotificationPopupProps {
  onAction?: (notification: AppNotification, actionType: 'view' | 'accept' | 'dismiss') => void;
}

export const NativeNotificationPopup: React.FC<NativeNotificationPopupProps> = ({ onAction }) => {
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  useEffect(() => {
    const handleNotification = (e: any) => {
      const notif: AppNotification = e.detail;
      if (notif) {
        setActiveNotification(notif);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tutorlink_notification_created', handleNotification);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tutorlink_notification_created', handleNotification);
      }
    };
  }, []);

  if (!activeNotification) {
    return null;
  }

  const isAccepted = activeNotification.type === 'session_accepted';
  const isRequest = activeNotification.type === 'session_request';

  const handleDismiss = () => {
    onAction?.(activeNotification, 'dismiss');
    setActiveNotification(null);
  };

  const handlePrimaryAction = () => {
    if (isRequest) {
      onAction?.(activeNotification, 'view');
    } else {
      onAction?.(activeNotification, 'view');
    }
    setActiveNotification(null);
  };

  return (
    <Modal
      transparent
      visible={Boolean(activeNotification)}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.popupWindow}>
          {/* Header Accent Bar */}
          <View
            style={[
              styles.accentBar,
              { backgroundColor: isAccepted ? '#10B981' : '#4F46E5' },
            ]}
          />

          <View style={styles.contentContainer}>
            {/* Badge Icon & Type */}
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isAccepted ? '#ECFDF5' : '#EEF2FF' },
                ]}
              >
                <Text style={styles.badgeEmoji}>
                  {isAccepted ? '✅' : '🔔'}
                </Text>
              </View>

              <View style={styles.headerTitles}>
                <Text style={styles.popupLabel}>
                  {isAccepted ? 'SESSION ACCEPTED' : 'NEW SESSION REQUEST'}
                </Text>
                <Text style={styles.popupTime}>Just now</Text>
              </View>

              <TouchableOpacity
                onPress={handleDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Title & Description */}
            <Text style={styles.popupTitle}>{activeNotification.title}</Text>
            <Text style={styles.popupMessage}>{activeNotification.message}</Text>

            {/* Notification Meta Box */}
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>From:</Text>
                <Text style={styles.metaValue}>{activeNotification.senderName}</Text>
              </View>
              {activeNotification.subject && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Subject:</Text>
                  <Text style={styles.metaValue}>{activeNotification.subject}</Text>
                </View>
              )}
              {activeNotification.meetingLink && (
                <View style={[styles.metaRow, { marginTop: 4 }]}>
                  <Text style={styles.metaLabel}>Meeting:</Text>
                  <Text style={[styles.metaValue, { color: '#059669', fontWeight: '700' }]}>
                    Google Meet / Zoom Ready
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.dismissButton}
                activeOpacity={0.7}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePrimaryAction}
                style={[
                  styles.primaryButton,
                  { backgroundColor: isAccepted ? '#10B981' : '#4F46E5' },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {isAccepted ? 'View Session' : 'Review Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  popupWindow: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accentBar: {
    height: 5,
    width: '100%',
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeEmoji: {
    fontSize: 18,
  },
  headerTitles: {
    flex: 1,
  },
  popupLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  popupTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  popupMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  metaCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  primaryButton: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
