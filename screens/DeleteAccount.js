import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import apiClient from '../api/apiClient';

const DeleteAccountScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [emailSpot, setEmailSpot] = React.useState("");
    const [mobileSpot, setMobileSpot] = React.useState("");

    useEffect(() => {
        setLoading(true);
        const unsubscribe = navigation.addListener('focus', () => {
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
        setTimeout(function () {
            setLoading(false);
        }, 1000);
        return unsubscribe;
    }, []);

    const onDel = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/delete_account`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("delete_account:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Toast.show({ description: responseJson.data.message });
                            AsyncStorage.clear();
                            setTimeout(function () {
                                setLoading(false);
                                navigation.replace('Welcome');
                            }, 1500);
                        } else {
                            setLoading(false);
                            Toast.show({ description: responseJson.data.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("get_gallery Error:", error);
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
            <Box flex={1} bg={"#F1F1F1"}>
                <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Delete Account")}</Text>
                    </HStack>
                </HStack>
                <ScrollView>
                    <Box padding={5}>
                        <VStack space={5} backgroundColor={'#ffffff'} borderRadius={10} overflow={'hidden'} p={10}>
                            <Text color={colorTheme.dark} marginY={5} alignSelf="center" textAlign="center" fontSize="2xl" fontWeight="bold">{t('Warning')} !</Text>
                            <Text color={"#333333"} fontSize="lg" textAlign="center">{t('Are you sure want to delete your account')}?</Text>
                            <HStack justifyContent="space-between" alignItems="center" w="100%" paddingTop={10}>
                                <Button size="xs" style={{ width: '48%', backgroundColor: "#666666", height: 37 }} onPress={() => navigation.goBack()}>
                                    <Text color={colorTheme.light} fontSize="sm" fontWeight={'bold'}>{t("Back")}</Text>
                                </Button>
                                <Button size="xs" style={{ width: '48%', backgroundColor: 'red', height: 37 }} onPress={() => onDel()}>
                                    <Text color={colorTheme.light} fontSize="sm" fontWeight={'bold'}>{t("Confirm")}</Text>
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </ScrollView>
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
    productbox: { borderRadius: 10, backgroundColor: '#ffffff', paddingVertical: 15, paddingHorizontal: 20, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default DeleteAccountScreen;
