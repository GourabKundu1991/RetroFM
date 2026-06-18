import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, ImageBackground, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import apiClient from '../api/apiClient';

const LanguageScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [languageList] = React.useState([
        { "name": "English", "language_code": "Eng" },
        { "name": "हिंदी", "language_code": "Hn" },
        { "name": "বাংলা", "language_code": "Bn" },
        { "name": "ଓଡ଼ିଆ", "language_code": "Od" }
    ]);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    useEffect(() => {
        setLoading(true)
        const unsubscribe = navigation.addListener('focus', () => {
            setTimeout(function () {
                setLoading(false);
            }, 500);
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
        });
        return unsubscribe;
    }, []);

    const saveLanguage = () => {
        if (currentLanguage == '') {
            Toast.show({ description: t("Please select Language") });
        } else {
            onSaveLang();
        }
    };

    const onSaveLang = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("language_code", currentLanguage);
                console.log("Language formdata:", formdata);
                apiClient
                    .post(`${BASE_URL}/change_profile_language`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Language:", responseJson);
                        if (responseJson.data.status == 'success') {
                            Toast.show({ description: responseJson.data.message });
                            AsyncStorage.setItem('language', currentLanguage);
                            i18n
                                .changeLanguage(currentLanguage)
                                .then(() => setLoading(false))
                                .catch(err => console.log(err));
                            setTimeout(function () {
                                setLoading(false);
                                navigation.goBack();
                            }, 500);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Login');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Language Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    };

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Language Change")}
                colorTheme={colorTheme}
            />
            <Box flex={1} px={5} py={5} bg={"#F1F1F1"}>

                <Stack flex={1} backgroundColor={'#ffffff'} borderRadius={10} overflow={'hidden'}>
                    <HStack padding={10} justifyContent={'center'} flexWrap={'wrap'}>
                        <Image source={require('../assets/images/lang.png')} style={{ width: '100%', height: 150, resizeMode: 'contain' }} />
                    </HStack>
                    <ScrollView>
                        <HStack padding={3} justifyContent={''} flexWrap={'wrap'}>
                            {languageList.map((item, index) =>
                                <Pressable style={{ width: '45%', margin: '2%' }} onPress={() => setLanguage(item.language_code)} key={index} justifyContent={'center'} alignItems={'center'} height={100} backgroundColor={item.language_code == currentLanguage ? colorTheme.normal : "#F9F9F9"} borderRadius={10} overflow={'hidden'} borderColor={"#eeeeee"} borderWidth={1}>
                                    <Text color={item.language_code == currentLanguage ? "#ffffff" : "#111111"} fontSize="2xl" fontWeight="normal">{item.name}</Text>
                                </Pressable>
                            )}
                        </HStack>
                    </ScrollView>
                    <HStack padding={5} backgroundColor={"#ffffff"} justifyContent={'space-evenly'} alignItems={'center'} flexWrap={'wrap'}>
                        <Button style={styles.custbtn} backgroundColor={colorTheme.normal} onPress={() => saveLanguage()} marginY={2}>
                            <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Save")}</Text>
                        </Button>
                    </HStack>
                </Stack>
            </Box>
            <BottomTabs
                selected={5}
                colorTheme={colorTheme}
            />
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider >
    )
}

const styles = StyleSheet.create({
    inputbox: { borderWidth: 1, borderColor: "#cccccc", borderRadius: 30, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    custbtn: { width: '100%', borderRadius: 8, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }
});

export default LanguageScreen;
