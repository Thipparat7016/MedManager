import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppNotification } from '@/utils/types';
import { formatAppointmentNotificationMessage } from '@/utils/notificationBuilder';

interface NotificationCardProps {
  notif: AppNotification;
  isToday: boolean;
  medImage: string | null;
  onPreviewImage: (image: { uri: string; name: string }) => void;
  onConfirmTake: (notif: AppNotification) => void;
  onPostpone: (notif: AppNotification) => void;
}

export function NotificationCard({
  notif,
  isToday,
  medImage,
  onPreviewImage,
  onConfirmTake,
  onPostpone,
}: NotificationCardProps) {
  // 1. แจ้งเตือนรับประทานยา (med_reminder) -> เอารูปยามาใส่เลย
  if (notif.type === 'med_reminder') {
    const showActionButtons = isToday && notif.isActionable;

    return (
      <View style={styles.notifCardPurple}>
        <View style={[styles.notifCardTop, !showActionButtons && { marginBottom: 0 }]}>
          {medImage ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                onPreviewImage({
                  uri: medImage,
                  name: notif.medicationName || notif.title,
                })
              }
            >
              <Image
                source={{ uri: medImage }}
                style={styles.medThumbImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBoxPurple}>
              <MaterialCommunityIcons name="pill" size={22} color="#8B95F6" />
            </View>
          )}
          <View style={styles.notifTextCol}>
            <View style={styles.titleTimeRow}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
            <Text style={styles.notifMessage}>{notif.message}</Text>
          </View>
        </View>
        {showActionButtons && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={() => onConfirmTake(notif)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.btnConfirmText}>ยืนยันกิน</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnPostpone}
              onPress={() => onPostpone(notif)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnPostponeText}>เลื่อน 30 นาที</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // 2. ข้อควรระวังอาหาร (food_warning) -> ไอคอนอาหารเหมือนกันหมด
  if (notif.type === 'food_warning') {
    return (
      <View style={styles.notifCardBlue}>
        <View style={styles.iconBoxBlue}>
          <Ionicons name="restaurant-outline" size={22} color="#0284C7" />
        </View>
        <View style={styles.notifTextCol}>
          <View style={styles.titleTimeRow}>
            <Text style={styles.notifTitle}>{notif.title}</Text>
            <Text style={styles.notifTime}>{notif.time}</Text>
          </View>
          <Text style={styles.notifMessage}>{notif.message}</Text>
        </View>
      </View>
    );
  }

  // 3. นัดหมายแพทย์ (appointment) -> ไอคอนสอดคล้องกับนัดหมาย พร้อมธีมการ์ดสีเขียว
  if (notif.type === 'appointment') {
    const displayMessage = formatAppointmentNotificationMessage(notif.message);

    return (
      <View style={styles.notifCardGreen}>
        <View style={styles.iconBoxGreen}>
          <Ionicons name="calendar-outline" size={22} color="#10B981" />
        </View>
        <View style={styles.notifTextCol}>
          <View style={styles.titleTimeRow}>
            <Text style={styles.notifTitle}>{notif.title}</Text>
            <Text style={styles.notifTime}>{notif.time}</Text>
          </View>
          <Text style={styles.notifMessage}>{displayMessage}</Text>
        </View>
      </View>
    );
  }

  // 4. ยาใกล้หมด (low_stock)
  if (notif.type === 'low_stock') {
    return (
      <View style={styles.notifCardAmber}>
        {medImage ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              onPreviewImage({
                uri: medImage,
                name: notif.medicationName || notif.title,
              })
            }
          >
            <Image
              source={{ uri: medImage }}
              style={styles.medThumbImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBoxAmber}>
            <Ionicons name="alert-circle-outline" size={22} color="#D97706" />
          </View>
        )}
        <View style={styles.notifTextCol}>
          <View style={styles.titleTimeRow}>
            <Text style={styles.notifTitle}>{notif.title}</Text>
            <Text style={styles.notifTime}>{notif.time}</Text>
          </View>
          <Text style={styles.notifMessage}>{notif.message}</Text>
        </View>
      </View>
    );
  }

  // 5. รายการทั่วไป / ติ๊กสำเร็จ (med_taken หรืออื่นๆ)
  return (
    <View style={styles.notifCardNormal}>
      <View style={styles.iconBoxCheck}>
        <Ionicons name="checkmark" size={18} color="#8B95F6" />
      </View>
      <View style={styles.notifTextCol}>
        <View style={styles.titleTimeRow}>
          <Text style={styles.notifTitle}>{notif.title}</Text>
          <Text style={styles.notifTime}>{notif.time}</Text>
        </View>
        <Text style={styles.notifMessage}>{notif.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notifCardPurple: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: 16,
    marginBottom: 12,
  },
  notifCardTop: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  iconBoxPurple: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medThumbImage: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  notifTextCol: {
    flex: 1,
  },
  titleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnConfirm: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#8B95F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnPostpone: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPostponeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  notifCardBlue: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxBlue: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifCardGreen: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxGreen: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifCardAmber: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxAmber: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifCardNormal: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    padding: 16,
    marginBottom: 12,
  },
  iconBoxCheck: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
