import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { useApp } from '@/context/AppContext';

export default function NotificationsScreen() {
  const { notifications, clearNotifications, markTaken, todaySchedule, postponeSchedule } = useApp();

  const handleConfirmTake = async (notifId: string) => {
    // Find matching pending schedule
    const pendingItem = todaySchedule.find(s => !s.isTaken);
    if (pendingItem) {
      await markTaken(pendingItem.id, true);
    }
    Alert.alert('บันทึกสำเร็จ', 'ยืนยันการรับประทานยาเรียบร้อยแล้ว');
  };

  const handlePostpone = (notifId: string) => {
    const pendingItem = todaySchedule.find(s => !s.isTaken);
    if (pendingItem) {
      postponeSchedule(pendingItem.id, 30);
    }
    Alert.alert('เลื่อนเวลา', 'เลื่อนการแจ้งเตือนออกไป 30 นาทีแล้ว');
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert('ล้างการแจ้งเตือน', 'ต้องการล้างการแจ้งเตือนทั้งหมดหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ล้างทั้งหมด', style: 'destructive', onPress: clearNotifications },
    ]);
  };

  const todayNotifs = notifications.filter(n => n.date === 'วันนี้' || !n.date);
  const otherNotifs = notifications.filter(n => n.date && n.date !== 'วันนี้');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="การแจ้งเตือน"
        rightActionText={notifications.length > 0 ? 'ล้างทั้งหมด' : undefined}
        onRightActionPress={handleClearAll}
        rightActionColor="#DC2626"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={40} color="#8B95F6" />
            </View>
            <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือนในขณะนี้</Text>
            <Text style={styles.emptySubtitle}>
              คุณจะได้รับการแจ้งเตือนอัตโนมัติเมื่อถึงเวลารับประทานยา ข้อควรระวังด้านอาหาร หรือเมื่อมีนัดหมายแพทย์
            </Text>
          </View>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>วันนี้</Text>
                {todayNotifs.map(notif => {
                  if (notif.type === 'med_reminder') {
                    return (
                      <View key={notif.id} style={styles.notifCardPurple}>
                        <View style={styles.notifCardTop}>
                          <View style={styles.iconBoxPurple}>
                            <Ionicons name="alarm-outline" size={22} color="#8B95F6" />
                          </View>
                          <View style={styles.notifTextCol}>
                            <View style={styles.titleTimeRow}>
                              <Text style={styles.notifTitle}>{notif.title}</Text>
                              <Text style={styles.notifTime}>{notif.time}</Text>
                            </View>
                            <Text style={styles.notifMessage}>{notif.message}</Text>
                          </View>
                        </View>
                        <View style={styles.actionButtonsRow}>
                          <TouchableOpacity
                            style={styles.btnConfirm}
                            onPress={() => handleConfirmTake(notif.id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <Text style={styles.btnConfirmText}>ยืนยันกิน</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.btnPostpone}
                            onPress={() => handlePostpone(notif.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.btnPostponeText}>เลื่อน 30 นาที</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }

                  if (notif.type === 'food_warning') {
                    return (
                      <View key={notif.id} style={styles.notifCardBlue}>
                        <View style={styles.iconBoxBlue}>
                          <Ionicons name="information" size={20} color="#38BDF8" />
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

                  if (notif.type === 'appointment') {
                    return (
                      <View key={notif.id} style={styles.notifCardGreen}>
                        <View style={styles.iconBoxGreen}>
                          <Ionicons name="clipboard-outline" size={20} color="#10B981" />
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

                  return (
                    <View key={notif.id} style={styles.notifCardNormal}>
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
                })}
              </>
            )}

            {otherNotifs.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ก่อนหน้า</Text>
                {otherNotifs.map(notif => (
                  <View key={notif.id} style={styles.notifCardNormal}>
                    <View style={styles.iconBoxPill}>
                      <MaterialCommunityIcons name="pill" size={18} color="#8B95F6" />
                    </View>
                    <View style={styles.notifTextCol}>
                      <View style={styles.titleTimeRow}>
                        <Text style={styles.notifTitle}>{notif.title}</Text>
                        <Text style={styles.notifTime}>{notif.time}</Text>
                      </View>
                      <Text style={styles.notifMessage}>{notif.message}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
  },
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
  iconBoxPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
