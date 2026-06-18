import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, Image, PermissionsAndroid, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import apiClient from '../api/apiClient';

const TakeStorePictureScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [locationInfo, setLocationInfo] = React.useState("");
    const [showBtn, setShowBtn] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoading(true);
            AsyncStorage.getItem('language').then(val => {
                if (val != null) {
                    setLanguage(val);
                    i18n
                        .changeLanguage(val)
                        .then(() => console.log(val))
                        .catch(err => console.log(err));
                } else {
                    i18n
                        .changeLanguage(currentLanguage)
                        .then(() => console.log())
                        .catch(err => console.log());
                }
            });
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setColorTheme(JSON.parse(val).info.theme_color);
                    Events.publish('colorTheme', val.info.theme_color);
                }
            });
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {

        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/check_location_image_info`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("check_location_image_info:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLocationInfo(responseJson.data.have_location_info);
                            setShowBtn(responseJson.data.show_button);
                            setLoading(false);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.message == "Session is expired") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("check_location_image_info Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
          const auth = await Geolocation.requestAuthorization('whenInUse');
          return auth === 'granted';
        }
      
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      };

      const onTakeImage = async () => {
        setLoading(true);
      
        const hasPermission = await requestLocationPermission();
      
        if (!hasPermission) {
          setLoading(false);
          Toast.show({
            description: 'Location permission denied',
          });
          return;
        }
      
        launchCamera(
          {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 1500,
            maxWidth: 1500,
          },
          response => {
            if (!response.assets?.length) {
              setLoading(false);
              return;
            }
      
            Geolocation.getCurrentPosition(
              position => {
                console.log('Location:', position);
      
                onStoreLocation(
                  position.coords.latitude,
                  position.coords.longitude,
                  position.coords.accuracy,
                  response.assets[0].base64,
                );
              },
              error => {
                console.log('Location Error:', error);
      
                setLoading(false);
      
                Toast.show({
                  description: error.message,
                });
              },
              {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
                forceRequestLocation: true,
                showLocationDialog: true,
              },
            );
          },
        );
      };

    const onStoreLocation = (latitude, longitude, accuracy, storeImage) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("token", JSON.parse(val).token);
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("locationImage", storeImage);
                formdata.append("locationLat", latitude);
                formdata.append("locationLong", longitude);
                formdata.append("accuracy", accuracy);
                console.log(formdata);
                apiClient
                    .post(`${BASE_URL}/store_location_info`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    })
                    .then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("store_location_info:", responseJson.data);
                        if (responseJson.data.status == 'success') {
                            Toast.show({ description: responseJson.data.message });
                            setLoading(false);
                            if (responseJson.data.bstatus == 1) {
                                Alert.alert(
                                    responseJson.data.status,
                                    responseJson.data.message,
                                    [
                                        {
                                            text: t("Ok"), onPress: () => {
                                                navigation.goBack();
                                            }
                                        }
                                    ],
                                );
                                setLoading(false);
                            } else {
                                Toast.show({ description: responseJson.data.message });
                                setTimeout(function () {
                                    setLoading(false);
                                    if (responseJson.data.message == "Session is expired") {
                                        AsyncStorage.clear();
                                        navigation.navigate('Welcome');
                                    }
                                }, 1000);
                            }
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("registration Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={locationInfo != 0}
                showMenu={locationInfo == 0}
                title={t("Shop Image & Location")}
                colorTheme={colorTheme}
            />
            <Box flex={1} bg={"#F1F1F1"} padding={5}>
                {/* <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        {locationInfo == 0 ?
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Icon name="menu" size={28} color="#ffffff" />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Icon name="chevron-back" size={28} color="#ffffff" />
                            </TouchableOpacity>
                        }
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Shop Image & Location")}</Text>
                    </HStack>
                </HStack> */}
                <VStack space={5} flex={1} padding={5} borderRadius={10} overflow={'hidden'} backgroundColor={'#ffffff'} justifyContent={'center'} alignItems={'center'}>
                    <Image source={require('../assets/images/storeimage.png')} style={{ width: '90%', height: 350, objectFit: 'contain' }} />
                    <Button disabled={showBtn != "yes"} style={[styles.custbtn, { opacity: showBtn == "yes" ? 1 : 0.6 }]} backgroundColor={colorTheme.normal} onPress={() => onTakeImage()} marginY={2}>
                        <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Get Location Image")}</Text>
                    </Button>
                    <Text fontSize="xs" color="#666666" textAlign={'center'} paddingX={10}>**{t("You must have to allow the permissions for GPS and Camera - GPS will be used to plot your outlet on Google map")}</Text>
                    <Text fontSize="xs" color="#666666" textAlign={'center'} paddingX={10}>**{t("Dealer shop image to have Dealer Shop Name clearly visible in the image")}</Text>
                </VStack>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>

    )
}

const styles = StyleSheet.create({
    custbtn: { width: '90%', borderRadius: 8, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default TakeStorePictureScreen;
