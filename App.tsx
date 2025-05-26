import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// Import database initialization
import { initDatabase } from './src/utils/database';
import { IDScanData } from './src/types';

// Define the stack navigator param list
export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  Review: { idData: IDScanData };
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // Initialize the database when the app starts
  React.useEffect(() => {
    initDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'ID Scanner' }} 
        />
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ title: 'Scan ID Card' }} 
        />
        <Stack.Screen 
          name="Review" 
          component={ReviewScreen} 
          options={{ title: 'Review Information' }} 
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'Scan History' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}