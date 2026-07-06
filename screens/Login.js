import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack, View, } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { API_KEY, OS_TYPE, APP_VERSION, BASE_URL, AuthToken, DEVICE_TYPE } from '../auth_provider/Config';
import i18n from '../assets/language/i18n';
import apiClient from '../api/apiClient';
import { countryCodes, CountryPicker } from 'react-native-country-codes-picker';
import { OtpInput } from 'react-native-otp-entry';

const LoginScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [show, setShow] = React.useState(false);

    const [versionFound, setVersionFound] = React.useState(false);
    const [storeUrl, setStoreUrl] = React.useState("");
    const [versionUpdateTitle, setVersionUpdateTitle] = React.useState("");
    const [versionUpdateMsg, setVersionUpdateMsg] = React.useState("");

    const [countryCode, setCountryCode] = React.useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [email, setEmail] = useState("");

    const [otpPop, setOtpPop] = useState(false);
    const [otp, setOtp] = React.useState('');
    const otpRef = useRef();

    const [serverToken, setServerToken] = React.useState("");


    useEffect(() => {
        setLoading(true);
        setCountryCode({ dial_code: '+91', code: 'IN', flag: '🇮🇳' });
        let formdata = new FormData();
        formdata.append("app_version", `${APP_VERSION}`);
        formdata.append("device_type", `${DEVICE_TYPE}`);
        apiClient
            .post(`${BASE_URL}/app-version-check`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authtoken: `${AuthToken}`,
                },
            })
            .then(response => {
                return response.data;
            })
            .then(responseJson => {
                console.log('verssion Check:', responseJson);
                if (responseJson.status == false) {
                    AsyncStorage.getItem('userToken').then(val => {
                        if (val != null) {
                            navigation.replace('Home');
                            setLoading(false);
                        } else {
                            setLoading(false);
                        }
                    });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    setVersionUpdateTitle(responseJson.update_title);
                    setVersionUpdateMsg(responseJson.update_description);
                    setStoreUrl(responseJson.store_url);
                    setVersionFound(true);
                }
            })
            .catch(error => {
                console.log('Version Check Error', error);
                setLoading(false);
            });
    }, []);


    const onContinue = () => {
        Linking.openURL(storeUrl);
    }

    const sendOtp = () => {
        Keyboard.dismiss();
        setOtp("");
        if (phoneNo.trim() == '') {
            if (countryCode.code == "IN") {
                Toast.show({ description: t("Please enter Phone Number") });
            } else {
                Toast.show({ description: t("Please enter Email Address") });
            }
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("email", email);
            formdata.append("phone", phoneNo);
            formdata.append("device_type", `${DEVICE_TYPE}`);
            apiClient
                .post(`${BASE_URL}/generate-custom-otp`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authtoken: `${AuthToken}`,
                    },
                })
                .then(response => {
                    return response.data;
                })
                .then((responseJson) => {
                    setLoading(false);
                    console.log("Get OTP:", responseJson);
                    if (responseJson.status == true) {
                        setOtpPop(true);
                        Toast.show({ description: responseJson.message });
                    } else {
                        Toast.show({ description: responseJson.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log("OTP Error:", error);
                });
        }
    }

    const onVerify = () => {
        Keyboard.dismiss();
        setLoading(true);
        let formdata = new FormData();
        formdata.append("email", email);
        formdata.append("phone", phoneNo);
        formdata.append("otp", otp);
        apiClient
            .post(`${BASE_URL}/verify-otp`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authtoken: `${AuthToken}`,
                },
            })
            .then(response => {
                return response.data;
            })
            .then((responseJson) => {
                console.log("Verify OTP:", responseJson);
                if (responseJson.status == true) {
                    setOtpPop(false);
                    setOtp("");
                    Toast.show({ description: responseJson.message });
                    onLogin();
                } else {
                    setLoading(false);
                    Toast.show({ description: responseJson.message });
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log("OTP Error:", error);
            });
    }

    const onLogin = () => {
        let formdata = new FormData();
        formdata.append("country_code", countryCode.dial_code);
        formdata.append("phone", phoneNo);
        formdata.append("device_type", `${DEVICE_TYPE}`);
        formdata.append("device_token", serverToken);
        console.log(formdata);
        apiClient
            .post(`${BASE_URL}/login`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authtoken: `${AuthToken}`,
                },
            })
            .then(response => {
                return response.data;
            })
            .then((responseJson) => {
                setLoading(false);
                console.log("Login:", responseJson);
                if (responseJson.status == true) {
                    AsyncStorage.setItem('userToken', JSON.stringify(responseJson.details));
                    navigation.replace('Home');
                } else {
                    Toast.show({ description: responseJson.message });
                }
            })
            .catch((error) => {
                setLoading(false);
                console.log("OTP Error:", error);
            });
    }

    const onClose = () => {
        setOtpPop(false);
        setOtp("");
    }

    return (
        <NativeBaseProvider>
            <ImageBackground source={require('../assets/images/bg.jpg')} resizeMode="cover" style={styles.bg}>
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,1)',
                        'rgba(66,2,2,0.9)',
                        'rgba(33,1,1,0.7)',
                        'rgba(16,0,0,0.6)',
                        'rgba(0,0,0,95)',
                        'rgba(0,0,0,1)',
                    ]}
                    style={{ flex: 1, position: 'relative' }}
                >
                    <Stack alignSelf={'center'} justifyContent={'center'} alignItems={'center'} style={{ backgroundColor: '#000000', width: 140, height: 140, marginBottom: 100, marginTop: 100, borderRadius: 100, overflow: 'hidden' }}>
                        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                    </Stack>
                    <VStack p={5} style={{ position: 'absolute', width: '100%', left: 0, bottom: 0 }}>
                        <ScrollView style={{ width: "100%", height: '100%', padding: 10 }} showsVerticalScrollIndicator={false}>
                            <VStack space={8}>
                                <Text textAlign={'center'} color="#ffffff" fontSize="lg">{t('Welcome, Please Sign In')}</Text>
                                <HStack space={0} justifyContent={'space-between'} alignItems={'center'}>
                                    <View style={[styles.inputbox, { width: '25%' }]}>
                                        <TouchableOpacity
                                            onPress={() => setShow(true)}
                                            style={{
                                                width: '100%'
                                            }}
                                        >
                                            <Text style={{
                                                color: 'black',
                                                lineHeight: 50,
                                                fontSize: 16,
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                {countryCode.flag} {countryCode.dial_code}
                                            </Text>
                                        </TouchableOpacity>
                                        <CountryPicker
                                            show={show}
                                            // when picker button press you will get the country object with dial code
                                            pickerButtonOnPress={(item) => {
                                                console.log(item);
                                                setCountryCode(item);
                                                setShow(false);
                                            }}
                                            //showOnly={['UA', 'UK', 'IN']}
                                            initialState={countryCode}
                                            maxHeight={400}
                                        />
                                    </View>
                                    <View style={[styles.inputbox, { width: '73%' }]}>
                                        {countryCode.code == "IN" ?
                                            <Input
                                                size="lg"
                                                style={{ height: 50, fontWeight: 'bold', color: '#000000' }}
                                                onChangeText={(text) => setPhoneNo(text)}
                                                value={phoneNo.toString()}
                                                keyboardType='number-pad'
                                                maxLength={10}
                                                variant="unstyled"
                                                placeholder={t("Enter Mobile No") + " *"}
                                            />
                                            :
                                            <Input
                                                size="lg"
                                                style={{ height: 50, fontWeight: 'bold', color: '#000000' }}
                                                onChangeText={(text) => setEmail(text)}
                                                value={email}
                                                keyboardType='email-address'
                                                variant="unstyled"
                                                placeholder={t("Enter Email") + " *"}
                                            />
                                        }
                                    </View>
                                </HStack>
                                <Button style={styles.custbtn} backgroundColor={'#fc030b'} onPress={() => sendOtp()} marginY={2}>
                                    <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Send OTP")}</Text>
                                </Button>
                            </VStack>
                        </ScrollView>
                    </VStack>
                </LinearGradient>
            </ImageBackground>
            {otpPop && (
                <View style={styles.spincontainer}>
                    <Button backgroundColor={"#eeeeee"} style={{ borderRadius: 30, overflow: 'hidden', height: 40, width: 40, position: 'absolute', right: 30, top: 15 }} size="xs" marginTop={5} onPress={() => onClose()}>
                        <Text color="#000000" fontSize="2xl" lineHeight={10}>X</Text>
                    </Button>
                    <Stack style={{ width: 300, borderRadius: 15, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        <VStack space={5} w="100%" minHeight={350} paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
                            <Text textAlign={'center'} fontSize="2xl" color={"#ffffff"} fontWeight="bold">Verify OTP</Text>
                            <Text textAlign="center" fontSize="md" fontWeight="medium" color="#cccccc" mb={3}>{t("Verify your identity by entering the one-time passcode below.")}</Text>
                            <OtpInput
                                autoFocus={false}
                                ref={otpRef}
                                onTextChange={(text) => setOtp(text)}
                                onFilled={(text) => Keyboard.dismiss()}
                                focusColor={'#ffffff'}
                                theme={{
                                    filledPinCodeContainerStyle: { borderColor: '#ffffff' },
                                    pinCodeTextStyle: { color: '#ffffff' },
                                    pinCodeContainerStyle: { width: 32, height: 50 }
                                }}
                            />
                            <Text onPress={() => sendOtp()} textAlign={'center'} color={'yellow.400'}>{t("Resend OTP")}</Text>
                            <Button size="sm" backgroundColor={"#fc030b"} style={{ width: 180, borderRadius: 30, overflow: 'hidden' }} onPress={() => onVerify()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Verify Now")}</Text>
                            </Button>
                        </VStack>
                    </Stack>
                </View>
            )}
            {versionFound && (
                <View style={styles.spincontainer}>
                    <Stack style={{ width: 280, borderRadius: 15, overflow: 'hidden', backgroundColor: '#cccccc' }}>
                        <VStack space={1} w="100%" paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                            <Text mt={5} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{versionUpdateTitle}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{versionUpdateMsg}</Text>
                            <Button size="sm" backgroundColor={"#fc030b"} style={{ width: 180, borderRadius: 30, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Update Now")}</Text>
                            </Button>
                        </VStack>
                    </Stack>
                </View>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#fc030b" />
                </View>
            )}
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    logo: { width: 120, height: 120, resizeMode: 'contain', alignSelf: 'center' },
    bg: {
        width: '100%',
        height: '100%',
        alignSelf: 'center',
        resizeMode: 'cover',
        position: 'relative'
    },
    inputbox: { backgroundColor: '#ffffff', borderRadius: 30, width: '100%', overflow: 'hidden', height: 50, paddingHorizontal: 10 },
    custbtn: { width: '100%', borderRadius: 30, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default LoginScreen;