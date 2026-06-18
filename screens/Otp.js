import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Image, ImageBackground, Keyboard, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, APP_VERSION, BASE_URL, OS_TYPE, } from '../auth_provider/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import i18n from '../assets/language/i18n';
import { OtpInput } from "react-native-otp-entry";
import { useRoute } from '@react-navigation/native';
import AuthContainer from '../components/AuthContainer';
import messaging from '@react-native-firebase/messaging';
import apiClient from '../api/apiClient';

const OtpScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);

    const [phoneNum, setPhoneNum] = React.useState('');
    const [otp, setOtp] = React.useState('');

    const [otpVerification, setOtpVerification] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [orgId, setOrgId] = React.useState('');
    const [orgPop, setOrgPop] = React.useState(false);
    const [orgList, setOrgList] = React.useState([]);

    const [serverToken, setServerToken] = React.useState("");

    const route = useRoute();
    const { otps, orgsId, phoneNo } = route.params;
    const otpRef = useRef();

    //for IOS
    /* const getServerKey = () => {
        let fcmToken = messaging().getToken();
        if (fcmToken) {
            console.log("login token:", fcmToken);
            setServerToken(fcmToken);
        }
        setLoading(false);
    } */

    //for ANDROID
    async function getServerKey() {
        let fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log("login token:", fcmToken);
            setServerToken(fcmToken);
        }
        setLoading(false);
    }

    useEffect(() => {
        setLoading(true);
        AsyncStorage.getItem('language').then(val => {
            if (val != null) {
                setLanguage(val);
                i18n
                    .changeLanguage(val)
                    .then(() => setLoading(false))
                    .catch(err => console.log(err));
            } else {
                i18n
                    .changeLanguage(currentLanguage)
                    .then(() => console.log())
                    .catch(err => console.log());
            }
        });
        if (otps !== 0) {
            setOtp(otps ?? '');
            otpRef.current.setValue(otps.toString() ?? '');
        }
        setOrgId(orgsId);
        setPhoneNum(phoneNo);
        getServerKey();
    }, []);

    const sendOtp = () => {
        Keyboard.dismiss()
        setOtp("");
        if (phoneNum.trim() == '') {
            Toast.show({ description: t("Please enter Phone Number") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("mobileNumber", phoneNum);
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("orgId", orgId);
            apiClient
                .post(`${BASE_URL}/get_login_otp`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`,
                    },
                })
                .then(response => {
                    return response;
                })
                .then((responseJson) => {
                    setLoading(false);
                    console.log("Get OTP:", responseJson.data);
                    if (responseJson.data.bstatus == 1) {
                        setOtpVerification(true);
                        setOrgId(responseJson.data.orgId);
                        if (responseJson.data.otp != "") {
                            setOtp(Number(responseJson.data.otp));
                            otpRef.current.setValue(responseJson.data.otp.toString() ?? '');
                        }
                        /* if (responseJson.status_code == 'duplicate') {
                            setOrgList(responseJson.org_list);
                            setOrgPop(true);
                        } else {
                            
                        } */
                        Toast.show({ description: responseJson.data.message });
                    } else {
                        Toast.show({ description: responseJson.data.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log("OTP Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    const onVerify = () => {
        Keyboard.dismiss();
        if (otp == '') {
            Toast.show({ description: t("Please enter OTP Number") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("mobileNumber", phoneNum);
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("orgId", orgId);
            formdata.append("otpVal", otp);
            formdata.append("app_ver", `${APP_VERSION}`);
            formdata.append("os_version", "");
            formdata.append("os_type", `${OS_TYPE}`);
            formdata.append("language_code", currentLanguage);
            formdata.append("device_token", serverToken);
            formdata.append("deviceId", "");
            console.log(formdata);
            apiClient
                .post(`${BASE_URL}/validate_login_otp`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`,
                    },
                })
                .then(response => {
                    return response;
                })
                .then((responseJson) => {
                    setLoading(false);
                    console.log("Verify OTP:", responseJson.data);
                    if (responseJson.data.bstatus == 1) {
                        Toast.show({ description: responseJson.data.message });
                        if (responseJson.data.user_created == 1) {
                            AsyncStorage.setItem('userToken', JSON.stringify(responseJson.data));
                            navigation.replace('Home');
                        } else if (responseJson.data.user_created == 0) {
                            let formdata = new FormData();
                            formdata.append("APIkey", `${API_KEY}`);
                            formdata.append("externalID", responseJson.data.sap_code);
                            apiClient
                                .post(`${BASE_URL}/verify_firm`, formdata, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                        accesstoken: `${AccessToken}`,
                                    },
                                })
                                .then(response => {
                                    return response;
                                })
                                .then((responseJsonFirm) => {
                                    setLoading(false);
                                    console.log("verify_firm:", responseJsonFirm.data);
                                    if (responseJsonFirm.data.bstatus == 1) {
                                        Toast.show({ description: responseJsonFirm.data.message });
                                        AsyncStorage.setItem('firmData', JSON.stringify(responseJsonFirm.data));
                                        navigation.replace('Registration');
                                    } else {
                                        Toast.show({ description: responseJsonFirm.data.message });
                                    }
                                })
                                .catch((error) => {
                                    setLoading(false);
                                    console.log("verify_firm Error:", error);
                                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                });
                        }
                    } else {
                        Toast.show({ description: responseJson.data.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    console.log("Verify OTP Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    const goLogin = () => {
        navigation.replace('Login');
    }

    const onContinue = () => {
        if (orgId == '') {
            Toast.show({ description: t("Please select Organization") });
        } else {
            setOrgPop(false);
            onVerify();
        }
    }

    const goRegistration = () => {
        navigation.navigate('VerifyFirm');
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AuthContainer>
                <View style={{ height: 30 }} />
                <Text textAlign={'center'} fontSize="2xl" fontWeight="bold">Verify OTP</Text>
                <View style={{ height: 20 }} />
                <OtpInput
                    autoFocus={false}
                    ref={otpRef}
                    onTextChange={(text) => setOtp(text)}
                    onFilled={(text) => Keyboard.dismiss()}
                    focusColor={'black'}
                    theme={{
                        filledPinCodeContainerStyle: { borderColor: '#928FA6B2' },
                        pinCodeTextStyle: { color: '#000000' }
                    }}
                />
                {/* <View style={styles.inputbox}>
                    <Input size="2xl" style={{textAlign: 'center'}} onChangeText={(text) => setOtp(text)} value={otp.toString()} keyboardType='number-pad' maxLength={6} variant="unstyled" placeholder={t("Enter OTP") + " *"} />
                </View> */}
                <View style={{ height: 20 }} />
                <Button style={styles.custbtn} backgroundColor={"#00915D"} onPress={() => onVerify()} marginY={2}>
                    <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Submit")}</Text>
                </Button>
                <View style={{ height: 20 }} />
                <Text onPress={() => sendOtp()} textAlign={'center'} color={'#00915D'} underline>{t("Resend OTP")}</Text>
            </AuthContainer>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    bgimage: { flex: 1 },
    fromContainer: { width: '80%', backgroundColor: '#ffffff', borderRadius: 30, overflow: 'hidden', borderColor: '#dddddd', borderWidth: 1, borderTopWidth: 0, elevation: 10, shadowColor: '#777777', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10 },
    mainContainer: { width: '100%', justifyContent: 'center', alignItems: 'center' },
    logo: { width: 150, height: 150, resizeMode: 'contain', marginVertical: 20 },
    inputbox: { backgroundColor: '#ffffff', borderRadius: 8, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 1 },
    custbtn: { width: '100%', borderRadius: 8, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default OtpScreen;