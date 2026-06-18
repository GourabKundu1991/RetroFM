import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import {
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

const CHANNEL_ID = 'default';

const PushControllerService = ({ navigation }) => {
  const createNotificationChannel = async () => {
    try {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      console.log('Notification Channel Created');
    } catch (error) {
      console.log('Channel Creation Error:', error);
    }
  };

  const getToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    } catch (error) {
      console.log('FCM Token Error:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification Permission Denied');
            return;
          }
        }

        await createNotificationChannel();
        await getToken();
      } else {
        const authStatus = await messaging().requestPermission();

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await getToken();
        }
      }
    } catch (error) {
      console.log('Permission Error:', error);
    }
  };

  const handleNotificationNavigation = remoteMessage => {
    try {
      const screenName = remoteMessage?.data?.screen;

      if (screenName && navigation) {
        navigation.navigate(screenName, {
          ...remoteMessage.data,
        });
      }
    } catch (error) {
      console.log('Navigation Error:', error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();

    // Foreground Messages
    const unsubscribeForeground = messaging().onMessage(
      async remoteMessage => {
        console.log(
          'Foreground Message:',
          JSON.stringify(remoteMessage, null, 2),
        );

        const imageUrl =
          remoteMessage?.notification?.android?.imageUrl ||
          remoteMessage?.notification?.image ||
          remoteMessage?.data?.image;

        await notifee.displayNotification({
          title: remoteMessage?.notification?.title || 'Notification',
          body: remoteMessage?.notification?.body || '',
          android: {
            channelId: CHANNEL_ID,
            smallIcon: 'ic_notification',
            importance: AndroidImportance.HIGH,

            ...(imageUrl && {
              largeIcon: imageUrl,
              style: {
                type: 0, // BIGPICTURE
                picture: imageUrl,
              },
            }),

            pressAction: {
              id: 'default',
            },
          },
        });
      },
    );

    // App opened from background by tapping notification
    const unsubscribeOpenedApp =
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification Opened From Background:',
          remoteMessage,
        );

        handleNotificationNavigation(remoteMessage);

        if (remoteMessage?.notification) {
          Alert.alert(
            remoteMessage.notification.title || 'Notification',
            remoteMessage.notification.body || '',
          );
        }
      });

    // App opened from killed state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification Opened From Quit State:',
            remoteMessage,
          );

          handleNotificationNavigation(remoteMessage);

          if (remoteMessage?.notification) {
            Alert.alert(
              remoteMessage.notification.title || 'Notification',
              remoteMessage.notification.body || '',
            );
          }
        }
      });

    // Token refresh listener
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(
      token => {
        console.log('New FCM Token:', token);
      },
    );

    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
      unsubscribeTokenRefresh();
    };
  }, [navigation]);

  return null;
};

export default PushControllerService;