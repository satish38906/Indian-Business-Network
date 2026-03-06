// app/chapter/index.tsx
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LeaderScreen from './leadership';
import MemberScreen from './members';

const Tab = createMaterialTopTabNavigator();

export default function ChapterScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#ddd',
        tabBarStyle: { backgroundColor: '#1e90ff' },
        tabBarIndicatorStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen name="Leaders" component={LeaderScreen} />
      <Tab.Screen name="Members" component={MemberScreen} />
    </Tab.Navigator>
  );
}
