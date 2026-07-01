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
        { "name": "বাংলা", "language_code": "Bn" }
    ]);
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //setLoading(true);
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
            //getAuthor();
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
            <VStack backgroundColor={"#000000"} flex={1}>
                <LinearGradient
                    colors={[
                        '#000000',
                        '#000000',
                        '#333333'
                    ]}
                    style={{ position: 'relative', flex: 1 }}
                >
                    <CommonHeader showMenu={true} search={false} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <VStack padding={5} space={5}>
                            <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                <Text color={"#ffffff"} fontSize="lg">{t("Select Language")}</Text>
                            </HStack>
                            <HStack flexWrap={'wrap'}>
                                {languageList.map((item, index) =>
                                    <Pressable style={{ width: '96%', margin: '2%' }} onPress={() => setLanguage(item.language_code)} key={index} justifyContent={'center'} alignItems={'center'} height={80} backgroundColor={"#222222"} borderRadius={30} overflow={'hidden'} borderColor={"#444444"} borderWidth={1}>
                                        <Text color={item.language_code == currentLanguage ? "#fc030b" : "#999999"} fontSize="xl" lineHeight={30}>{item.name}</Text>
                                    </Pressable>
                                )}
                            </HStack>
                        </VStack>
                    </ScrollView>

                    <BottomTabs selected={2} />
                </LinearGradient>
            </VStack>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#fc030b" />
                </View>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    inputbox: { borderWidth: 1, borderColor: "#cccccc", borderRadius: 30, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    custbtn: { width: '100%', borderRadius: 8, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }
});

export default LanguageScreen;
