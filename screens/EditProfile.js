import { Actionsheet, Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, useDisclose, VStack } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, AuthToken, BASE_URL } from '../auth_provider/Config';
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';
import FastImage from 'react-native-fast-image';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import moment from 'moment';
import Events from '../auth_provider/Events';

const EditProfileScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [profileData, setProfileData] = React.useState({});

    const [isImageLoading, setIsImageLoading] = React.useState(false);

    const [profilePic, setProfilePic] = React.useState("");
    const { isOpen, onOpen, onClose } = useDisclose();

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
            getProfileData("");
        });
        return unsubscribe;
    }, []);

    const getProfileData = (profileImage) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("profile_image", profileImage);
                console.log(formdata, JSON.parse(val).access_token);
                apiClient
                    .post(`${BASE_URL}/update-profile`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {

                        console.log("Profile details:", responseJson.details);
                        if (responseJson.status == true) {
                            setProfileData(responseJson.details);
                            AsyncStorage.setItem('userToken', JSON.stringify(responseJson.details));
                            Events.publish('profileData', responseJson.details);
                            setLoading(false);
                        } else {
                            setLoading(false);
                            Toast.show({ description: responseJson.message });
                            if (responseJson.access_token_expired == true) {
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Error:", error);
                    });
            }
        })
    }

    const openProfilePicker = (type) => {
        onClose();
        if (type == "library") {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                    saveToPhotos: true,
                    includeExtra: true,
                },
                (response) => {
                    //console.log(response);
                    if (response.assets != undefined) {
                        setLoading(true);
                        getProfileData(response.assets[0].base64);
                    }
                },
            )
        } else if (type == "camera") {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                    saveToPhotos: true,
                    includeExtra: true,
                },
                (response) => {
                    //console.log(response.assets);
                    if (response.assets != undefined) {
                        setLoading(true);
                        getProfileData(response.assets[0].base64);
                    }
                },
            )
        }
    }



    /* const profileUpdate = (imageVal, dateVal) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                var CryptoJS = require("crypto-js");
                const decryptData = CryptoJS.AES.decrypt(val, secretKey).toString(CryptoJS.enc.Utf8);
                let formdata = new FormData();
                formdata.append("profile_image", (imageVal != "" ? imageVal : ""));
                formdata.append("dob", (dateVal != "" ? moment(dateVal).format('DD-MM-YYYY') : ""));
                //formdata.append("aniversery_date", (dateVal != "" ? moment(dateVal).format('YYYY-MM-DD') : ""));
                console.log(formdata);
                fetch(`${BASE_URL}/profile-update`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'accesstoken': `${AccessToken}`,
                        'Useraccesstoken': JSON.parse(decryptData).token
                    },
                    body: formdata
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        setLoading(false);
                        console.log("Profile Update:", responseJson);
                        if (responseJson.bstatus == 1) {
                            getAllData();
                        } else {
                            Toast.show(responseJson.message, Toast.LONG);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Error:", error);
                        Toast.show(t("Sorry! Somthing went Wrong. Maybe Network request Failed"));
                    });
            }
        })

    } */

    return (
        <NativeBaseProvider>
            <VStack backgroundColor={"#000000"} flex={1}>
                <LinearGradient
                    colors={[
                        '#000000',
                        '#000000',
                        '#333333'
                    ]}
                    style={{ position: 'relative', flex: 1 }}
                >
                    <CommonHeader showBack={true} search={false} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <VStack padding={5} space={5}>
                            <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                <Text color={"#ffffff"} fontSize="lg">{t("Profile Edit")}</Text>
                            </HStack>
                        </VStack>
                        <VStack position="relative" alignItems={'center'}>
                            <Avatar borderColor={"#eeeeee"} resizeMode="contain" borderWidth="4" size="150" source={{ uri: profileData.image }}></Avatar>
                            <Pressable onPress={onOpen} style={{ backgroundColor: "#fc030b", height: 40, width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 30, top: -25 }}>
                                <Icon name="camera" size={22} color={"#ffffff"} />
                            </Pressable>
                            <Actionsheet isOpen={isOpen} onClose={onClose}>
                                <Actionsheet.Content>
                                    <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                                    <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                                    <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                                    <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                                </Actionsheet.Content>
                            </Actionsheet>
                        </VStack>
                        <VStack justifyContent="center" alignItems={'center'} width={'100%'} space={3}>
                            <Text color="#ffffff" fontSize="2xl">{profileData.name}</Text>
                            <VStack space={2} marginTop={5} alignItems="center" padding={5} width={'90%'} borderColor={"#999999"} borderWidth={0.5}>
                                <HStack width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                                    <Text color={"#999999"} fontSize="md">Email:</Text>
                                    <Text color={"#ffffff"} fontSize="md">{profileData.email}</Text>
                                </HStack>
                                <HStack width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                                    <Text color={"#999999"} fontSize="md">Phone Number:</Text>
                                    <Text color={"#ffffff"} fontSize="md">{profileData.phone}</Text>
                                </HStack>
                                <HStack width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                                    <Text color={"#999999"} fontSize="md">DOB:</Text>
                                    <Text color={"#ffffff"} fontSize="md">{moment(profileData.dob).format("DD-MM-YYYY")}</Text>
                                </HStack>
                                <HStack width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                                    <Text color={"#999999"} fontSize="md">Gender:</Text>
                                    <Text color={"#ffffff"} fontSize="md" textTransform={'capitalize'}>{profileData.gender}</Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </ScrollView>

                    <BottomTabs selected={"-"} />
                </LinearGradient>
            </VStack>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#fc030b" />
                </View>
            )}
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    linkbox: { borderRadius: 20, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default EditProfileScreen;