import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack, View, } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { API_KEY, OS_TYPE, APP_VERSION, BASE_URL, AccessToken } from '../auth_provider/Config';
import i18n from '../assets/language/i18n';
import AuthContainer from '../components/AuthContainer';
import apiClient from '../api/apiClient';

const WelcomeScreen = ({ navigation }) => {

    const [loading, setLoading] = React.useState(false);

    const { t } = useTranslation();
    const [languageList, SetLanguageList] = React.useState([
        { "name": "English", "language_code": "Eng" },
        { "name": "Hindi", "language_code": "Hn" },
        { "name": "Bengali", "language_code": "Bn" },
        { "name": "Odia", "language_code": "Od" }
    ]);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [versionFound, setVersionFound] = React.useState(false);
    const [storeUrl, setStoreUrl] = React.useState("");
    const [phoneNo, setPhoneNo] = useState("");


    useEffect(() => {
        setLoading(true);
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("app_ver", `${APP_VERSION}`);
        formdata.append("os_type", `${OS_TYPE}`);
        apiClient
            .post(`${BASE_URL}/app_version_check`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    accesstoken: `${AccessToken}`,
                },
            })
            .then(response => {
                return response;
            })
            .then(responseJson => {
                setLoading(false);
                console.log('verssion Check:', responseJson.data);
                if (responseJson.data.bstatus == 1) {
                    console.log('update_available Check:', responseJson.data.version_details.update_available);
                    if (responseJson.data.version_details.update_available == 0) {
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                navigation.replace('Home');
                            }
                        });
                    } else {
                        setLoading(false);
                        AsyncStorage.clear();
                        setStoreUrl(responseJson.data.version_details.store_url);
                        setVersionFound(true);
                    }
                }
            })
            .catch(error => {
                console.log('Version Check Error', error);
                setLoading(false);
            });

        AsyncStorage.getItem('language').then(val => {
            if (val != null) {
                setLanguage(val);
                i18n
                    .changeLanguage(val)
                    .then(() => console.log(val))
                    .catch(err => console.log(err));
            } else {
                i18n
                    .changeLanguage("Eng")
                    .then(() => console.log())
                    .catch(err => console.log());
            }
        });
    }, []);

    const onSaveLang = (langval) => {
        setLanguage(langval);
        AsyncStorage.setItem('language', langval);
        i18n
            .changeLanguage(langval)
            .then(() => setLoading(true))
            .catch(err => console.log(err));
        setTimeout(function () {
            setLoading(false);
        }, 500);
    }

    const onContinue = () => {
        Linking.openURL(storeUrl);
    }

    const goLogin = () => {
        navigation.navigate('Login');
    }

    const goOtp = () => {
        navigation.navigate('Otp');
    }

    const goRegistration = () => {
        navigation.navigate('VerifyFirm');
    }

    const sendOtp = () => {
        Keyboard.dismiss()
        if (phoneNo.trim() == '') {
            Toast.show({ description: t("Please enter Phone Number") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("mobileNumber", phoneNo);
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("orgId", '');
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
                        let params = {
                            phoneNo: phoneNo,
                            otps: Number(responseJson.data.otp),
                            orgsId: responseJson.data.orgId
                        }
                        navigation.navigate('Otp', params);
                        // setOtpVerification(true);
                        // setOrgId(responseJson.orgId);
                        // if (responseJson.otp != "") {
                        // setOtp(Number(responseJson.otp));
                        // }
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

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AuthContainer>
                <Text textAlign={'center'} fontSize="2xl" fontWeight="bold">{t('Welcome')}</Text>
                <Text textAlign={'center'} color="#666666">{t('Please enter Registered Mobile No.')}</Text>
                <View style={{ height: 20 }} />
                <Text alignSelf={'flex-start'} mb={2} >{t('Mobile No')}</Text>
                <View style={styles.inputbox}>
                    <Input
                        size="lg"
                        onChangeText={(text) => setPhoneNo(text)}
                        value={phoneNo.toString()}
                        keyboardType='number-pad'
                        maxLength={10}
                        variant="unstyled"
                        // InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                        placeholder={t("Enter Mobile No") + " *"}
                    />
                </View>
                <View style={{ height: 15 }} />
                <Text alignSelf={'flex-start'} mb={2} >{t('Language')}</Text>
                <View style={styles.inputbox}>
                    <Select
                        variant="none"
                        size="lg"
                        // InputLeftElement={<Image source={require('../assets/images/language.png')} style={{ width: 22, objectFit: 'contain', marginLeft: 15, textAlign: 'center' }} />}
                        selectedValue={currentLanguage}
                        onValueChange={value => onSaveLang(value)}
                        style={{ paddingLeft: 20, height: 48 }}
                        _selectedItem={{
                            backgroundColor: '#eeeeee',
                            endIcon: <Icon name="checkmark-circle" size={20} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                        }}>
                        {languageList.map((item, index) =>
                            <Select.Item key={index} label={item.name} value={item.language_code} />
                        )}
                    </Select>
                </View>
                <View style={{ height: 15 }} />
                <Button style={styles.custbtn} backgroundColor={"#00915D"}
                    //  onPress={() => goOtp()} 
                    onPress={() => sendOtp()}
                    marginY={2}>
                    <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Verify")}</Text>
                </Button>
                <View style={{ height: 15 }} />
                <HStack justifyContent={'center'} alignItems={'center'}>
                    <Text>{t('For New Dealer') + ' '}</Text>
                    <Text onPress={() => goRegistration()} fontWeight={'semibold'} underline color={'#00915D'}>{t('Register Here')}</Text>
                </HStack>
            </AuthContainer>
            {versionFound && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', '#cccccc']}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 280, borderRadius: 15, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingY="10" paddingX="5" alignItems="center" justifyContent="center">
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                            <Text mt={5} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t("Update Warning")}!</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("App need Update to the Latest Version. Please click on Update Now button to Continue")}...</Text>
                            <Button size="sm" backgroundColor={"#ed2f42"} style={{ width: 180, borderRadius: 30, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Update Now")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    bgimage: { flex: 1 },
    fromContainer: { width: '80%', backgroundColor: '#ffffff', borderRadius: 30, overflow: 'hidden', borderColor: '#dddddd', borderWidth: 1, borderTopWidth: 0, elevation: 10, shadowColor: '#777777', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10 },
    mainContainer: { width: '100%', justifyContent: 'center', alignItems: 'center' },
    logo: { width: 180, height: 180, resizeMode: 'contain', marginVertical: 20 },
    inputbox: { backgroundColor: '#ffffff', borderRadius: 30, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    custbtn: { width: '100%', borderRadius: 30, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
    custbtn: {
        width: '100%',
        borderRadius: 5,
        overflow: 'hidden',
        height: 48
    },
    inputbox: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        width: '100%',
        overflow: 'hidden',
        borderColor: '#e7e7e9',
        borderWidth: 2
    },
});

export default WelcomeScreen;