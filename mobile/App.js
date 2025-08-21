import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketProvider';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();
  
  // Show loading screen instead of blank screen
  if (loading) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Loading" 
            component={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
              </View>
            )}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SocketProvider>
    </AuthProvider>
  );
}
