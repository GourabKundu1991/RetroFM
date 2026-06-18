import { Box, Button, HStack, Input, NativeBaseProvider, ScrollView, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, ImageBackground, Keyboard, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, APP_VERSION, BASE_URL, OS_TYPE, } from '../auth_provider/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import i18n from '../assets/language/i18n';
import AuthContainer from '../components/AuthContainer';
import apiClient from '../api/apiClient';

const VerifyFirmScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [loading, setLoading] = React.useState(false);
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [sapCode, setSapCode] = React.useState("");

    useEffect(() => {
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
    }, []);

    const onVerify = () => {
        Keyboard.dismiss();
        if (sapCode.trim() == '') {
            Toast.show({ description: t("Please enter SAP Code") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("APIkey", `${API_KEY}`);
            formdata.append("externalID", sapCode);
            apiClient
                .post(`${BASE_URL}/verify_firm`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`
                    },
                }).then(response => {
                    return response;
                })
                .then((responseJson) => {
                    setLoading(false);
                    console.log("verify_firm:", responseJson.data);
                    if (responseJson.data.bstatus == 1) {
                        Toast.show({ description: responseJson.data.message });
                        AsyncStorage.setItem('firmData', JSON.stringify(responseJson.data));
                        navigation.replace('Registration');
                    } else {
                        Toast.show({ description: responseJson.data.message });
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    //console.log("verify_firm Error:", error);
                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                });
        }
    }

    const goLogin = () => {
        navigation.replace('Welcome');
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AuthContainer marginTop={40} bgImg={require('../assets/images/auth_bg.png')}>
                <View style={{ height: 20 }} />
                <Text mb={2} fontSize="2xl" fontWeight="bold">{t('Verify Yourself')}</Text>
                <Text color="#666666" lineHeight={16} textAlign={'center'}>{t("Please enter your registered SAP code. We need to verify your firm name")}</Text>
                <View style={{ height: 30 }} />
                <Text alignSelf={'flex-start'} mb={2} >{t('Enter SAP Code')}</Text>
                <View style={styles.inputbox}>
                    <Input
                        size="lg"
                        onChangeText={(text) => setSapCode(text)}
                        value={sapCode}
                        maxLength={10}
                        variant="unstyled"
                        // InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                        placeholder={t("Dealer SAP Code") + " *"}
                    />
                </View>
                <View style={{ height: 15 }} />
                <Button style={styles.custbtn} backgroundColor={"#00915D"}
                    onPress={() => onVerify()}
                    marginY={2}>
                    <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Verify")}</Text>
                </Button>
                <View style={{ height: 15 }} />
                <HStack justifyContent={'center'} alignItems={'center'}>
                    <Text>{t('Already have an account?') + ' '}</Text>
                    <Text onPress={() => goLogin()} fontWeight={'semibold'} underline color={'#00915D'}>{t('Login Now')}</Text>
                </HStack>
            </AuthContainer>
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
    logo: { width: 150, height: 150, resizeMode: 'contain', marginVertical: 20 },
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

export default VerifyFirmScreen;