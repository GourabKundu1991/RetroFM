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
import StoryListScreen from './screens/StoryList';
import SubscriptionScreen from './screens/Subscription';
import MyLibraryScreen from './screens/MyLibrary';
import LanguageScreen from './screens/Language';
import EditProfileScreen from './screens/EditProfile';
import DownloadScreen from './screens/MyDownload';
import ReferralScreen from './screens/Referral';
import AboutScreen from './screens/About';
import SearchScreen from './screens/Search';
import StoryDetailsScreen from './screens/StoryDetails';


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
      <Stack.Screen name="StoryList" component={StoryListScreen} />
      <Stack.Screen name="MySubscription" component={SubscriptionScreen} />
      <Stack.Screen name="MyLibrary" component={MyLibraryScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyDownload" component={DownloadScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="StoryDetails" component={StoryDetailsScreen} />
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