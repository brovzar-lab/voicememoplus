import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen
            name="record"
            options={{ presentation: 'fullScreenModal', gestureEnabled: true }}
          />
          <Stack.Screen
            name="processing"
            options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen
            name="results/[id]"
            options={{ presentation: 'fullScreenModal', gestureEnabled: true }}
          />
        </Stack>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}
