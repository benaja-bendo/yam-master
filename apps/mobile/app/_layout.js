import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{
            title: 'YAMaster',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{
            title: 'Paramètres',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="game" 
          options={{
            title: 'Jeu',
            headerShown: true,
          }} 
        />
      </Stack>
    </>
  );
}