import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { useNotificationsScreen } from '@/hooks/useNotificationsScreen';
import { NotificationCard } from '@/components/notifications/NotificationCard';

export default function NotificationsScreen() {
  const {
    notifications,
    todayNotifs,
    otherNotifs,
    previewImage,
    setPreviewImage,
    getMedImageForNotif,
    handleConfirmTake,
    handlePostpone,
    handleClearAll,
  } = useNotificationsScreen();

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
                <Text style={styles.sectionTitle}>มื้อถัดไป</Text>
                {todayNotifs.map(notif => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    isToday={true}
                    medImage={getMedImageForNotif(notif)}
                    onPreviewImage={setPreviewImage}
                    onConfirmTake={handleConfirmTake}
                    onPostpone={handlePostpone}
                  />
                ))}
              </>
            )}

            {otherNotifs.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: todayNotifs.length > 0 ? 24 : 0 }]}>
                  นัดหมายถัดไป
                </Text>
                {otherNotifs.map(notif => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    isToday={false}
                    medImage={getMedImageForNotif(notif)}
                    onPreviewImage={setPreviewImage}
                    onConfirmTake={handleConfirmTake}
                    onPostpone={handlePostpone}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal ดูรูปยาขนาดใหญ่ */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPreviewImage(null)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {previewImage?.name || 'รูปยา'}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewImage(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {previewImage?.uri && (
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: previewImage.uri }}
                  style={styles.modalLargeImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
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
  // Modal Preview Image
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLargeImage: {
    width: '100%',
    height: '100%',
  },
});
