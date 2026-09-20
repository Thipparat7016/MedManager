import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

export default function TabsLayout() {
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
