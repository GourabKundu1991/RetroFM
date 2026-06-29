/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LoginScreen from './screens/Login';
import HomeScreen from './screens/Home';
import LeftMenuBarScreen from './screens/LeftMenuBar';
import AuthorListScreen from './screens/AuthorList';
import AuthorDetailsScreen from './screens/AuthorDetails';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function MyStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AuthorList" component={AuthorListScreen} />
      <Stack.Screen name="AuthorDetails" component={AuthorDetailsScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <View style={[styles.container, { paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }]}>
      <Drawer.Navigator
          drawerContent={(props) => <LeftMenuBarScreen {...props} />}>
          <Drawer.Screen
            name="Welcome"
            options={{ headerShown: false, swipeEnabled: false }}
            component={MyStack}
          />
        </Drawer.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;