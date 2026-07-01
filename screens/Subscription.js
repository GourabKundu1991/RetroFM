import { Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
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

const SubscriptionScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [allAuthor, setAllAuthor] = React.useState([]);

    const [isImageLoading, setIsImageLoading] = React.useState(false);

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
            getAuthor();
        });
        return unsubscribe;
    }, []);

    const getAuthor = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("page", "");
                formdata.append("authorId", "");
                apiClient
                    .post(`${BASE_URL}/get-authors`, "", {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Author List:", responseJson);
                        if (responseJson.status == true) {
                            setAllAuthor(responseJson.details);
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
                        console.log("Author List Error:", error);
                    });
            }
        })
    }
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
                        <VStack padding={8} space={8}>
                            <LinearGradient
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                colors={[
                                    '#009c53',
                                    '#6bd1a1'
                                ]}
                                style={{ position: 'relative', width: '100%', minHeight: 200, borderRadius: 20, overflow: 'hidden' }}
                            >
                                <HStack marginTop={5} paddingRight={5} justifyContent={'space-between'} alignItems={'center'}>
                                    <View style={{ paddingVertical: 5, paddingHorizontal: 8, width: 100, backgroundColor: '#000000', overflow: 'hidden', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}>
                                        <Text color={"#ffffff"} fontSize="md" textAlign={'center'}>{t("Monthly")}</Text>
                                    </View>
                                    <Text color={"#ffffff"} fontSize="md">{t("Validation")}: <Text fontWeight={'bold'}>30 Days</Text></Text>
                                </HStack>
                                <Stack padding={5} space={2}>
                                    <Text marginBottom={2} lineHeight={26} color={"#ffffff"} fontSize="3xl" fontWeight={'bold'}>₹ 99</Text>
                                    <Text color={"#ffffff"} fontSize="sm">* Listen Ad Free Story</Text>
                                    <Text color={"#ffffff"} fontSize="sm">* Get 3 Months Free</Text>
                                    <Text color={"#ffffff"} fontSize="sm">* 35% Off</Text>
                                </Stack>
                            </LinearGradient>
                            <LinearGradient
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                colors={[
                                    '#e06c19',
                                    '#db8b51'
                                ]}
                                style={{ position: 'relative', width: '100%', minHeight: 200, borderRadius: 20, overflow: 'hidden' }}
                            >
                                <HStack marginTop={5} paddingRight={5} justifyContent={'space-between'} alignItems={'center'}>
                                    <View style={{ paddingVertical: 5, paddingHorizontal: 8, width: 100, backgroundColor: '#000000', overflow: 'hidden', borderTopRightRadius: 10, borderBottomRightRadius: 10 }}>
                                        <Text color={"#ffffff"} fontSize="md" textAlign={'center'}>{t("Yearly")}</Text>
                                    </View>
                                    <Text color={"#ffffff"} fontSize="md">{t("Validation")}: <Text fontWeight={'bold'}>365 Days</Text></Text>
                                </HStack>
                                <Stack padding={5} space={2}>
                                    <Text marginBottom={2} lineHeight={26} color={"#ffffff"} fontSize="3xl" fontWeight={'bold'}>₹ 399</Text>
                                    <Text color={"#ffffff"} fontSize="sm">* Listen Ad Free Story</Text>
                                    <Text color={"#ffffff"} fontSize="sm">* Get 3 Months Free</Text>
                                    <Text color={"#ffffff"} fontSize="sm">* 35% Off</Text>
                                </Stack>
                            </LinearGradient>
                        </VStack>
                    </ScrollView>

                    <BottomTabs selected={3} />
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

export default SubscriptionScreen;