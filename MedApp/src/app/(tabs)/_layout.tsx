import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { CustomTabBar } from '@/components/ui/CustomTabBar';
import { useApp } from '@/context/AppContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B95F6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login' as any} />;
  }

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าหลัก',
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'ยาของฉัน',
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'นัดหมาย',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
