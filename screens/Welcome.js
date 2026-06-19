import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack, View, } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { API_KEY, OS_TYPE, APP_VERSION, BASE_URL, AccessToken } from '../auth_provider/Config';
import i18n from '../assets/language/i18n';
import apiClient from '../api/apiClient';
import { CountryPicker } from 'react-native-country-codes-picker';

const WelcomeScreen = ({ navigation }) => {

    const [loading, setLoading] = React.useState(false);

    const [show, setShow] = React.useState(false);
    const [countryCode, setCountryCode] = React.useState('');

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
                    <VStack p={5} style={{ position: 'absolute', width: '100%', height: 300, left: 0, bottom: 0 }}>
                        <ScrollView style={{ width: "100%", padding: 10 }} showsVerticalScrollIndicator={false}>
                            <VStack space={5}>
                                <Text textAlign={'center'} color="#ffffff" fontSize="lg">{t('Welcome Back, Please Sign In')}</Text>
                                <HStack>
                                    <View style={styles.inputbox}>
                                        <TouchableOpacity
                                            onPress={() => setShow(true)}
                                            style={{
                                                width: '100%',
                                                padding: 12,
                                            }}
                                        >
                                            <Text style={{
                                                color: 'black',
                                                fontSize: 20
                                            }}>
                                                {countryCode}
                                            </Text>
                                        </TouchableOpacity>

      // For showing picker just put show state to show prop
                                        <CountryPicker
                                            show={show}
                                            // when picker button press you will get the country object with dial code
                                            pickerButtonOnPress={(item) => {
                                                console.log(item);
                                                setCountryCode(item.flag);
                                                setShow(false);
                                            }}
                                            showOnly={['UA', 'UK', 'IN']}
                                        />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Select
                                            variant="none"
                                            size="lg"
                                            // InputLeftElement={<Image source={require('../assets/images/language.png')} style={{ width: 22, objectFit: 'contain', marginLeft: 15, textAlign: 'center' }} />}
                                            selectedValue={""}
                                            onValueChange={value => onSaveLang(value)}
                                            style={{ paddingLeft: 20, height: 48 }}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={20} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            <Select.Item label={"India"} value={"IND"} />
                                        </Select>
                                    </View>
                                </HStack>
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
                            </VStack>
                        </ScrollView>
                    </VStack>
                </LinearGradient>
            </ImageBackground>
            {/* <LinearGradient
                colors={['#000000', '#000000', '#100000', '#210101', '#420202', '#840303']} // define gradient colors
                style={{ flex: 1, justifyContent: 'center' }}
            >
                <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                    <Stack space={5}>
                        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                        <VStack space={2}>
                            <Text textAlign={'center'} color="#ffffff" fontSize="xl">{t('Welcome')}</Text>
                            <Text textAlign={'center'} color="#aaaaaa">{t('Please enter Registered Mobile No.')}</Text>
                        </VStack>
                    </Stack>
                </ScrollView>
            </LinearGradient> */}
            {/* <AuthContainer>
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
            )} */}
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
    inputbox: { backgroundColor: '#ffffff', borderRadius: 30, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    custbtn: { width: '100%', borderRadius: 30, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default WelcomeScreen;