import { Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack, Select } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, AuthToken, BASE_URL } from '../auth_provider/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import CommonHeader from '../components/CommonHeader';
import apiClient from '../api/apiClient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

const SignupScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const {
        country_code,
        phone,
        device_type,
        device_token,
    } = route.params || {};


    const [name, setName] = React.useState("");
    const [dob, setDOB] = React.useState("");
    const [gender, setGender] = React.useState("");
    const [email, setEmail] = React.useState("");

    const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const maxDate = new Date(year, month, day - 100);
    const miniData = new Date(year, month, day - 18);

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
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = date => {
        hideDatePicker();
        setDOB(date);
    };

    const onSubmit = () => {
        if (name.trim() == "") {
            Toast.show({ description: t("Please enter Name") });
        } else if (dob == "") {
            Toast.show({ description: t("Please enter DOB") });
        } else if (gender == "") {
            Toast.show({ description: t("Please select Gender") });
        } else if (email.trim() == "") {
            Toast.show({ description: t("Please enter Email") });
        } else {
            setLoading(true);
            let formdata = new FormData();
            formdata.append("name", name);
            formdata.append("dob", moment(dob).format('YYYY-MM-DD'));
            formdata.append("gender", gender);
            formdata.append("email", email);
            formdata.append("country_code", country_code);
            formdata.append("phone", phone);
            formdata.append("device_type", `${device_type}`);
            formdata.append("device_token", device_token);
            formdata.append("password", "123456");
            console.log(formdata);
            apiClient
                .post(`${BASE_URL}/signup`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authtoken: `${AuthToken}`,
                    },
                }).then(response => {
                    return response.data;
                })
                .then((responseJson) => {
                    console.log("signup:", responseJson);
                    if (responseJson.status == true) {
                        Toast.show({ description: responseJson.message });
                        AsyncStorage.setItem('userToken', JSON.stringify(responseJson.details));
                        navigation.replace('Home');
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
                    console.log("withdraw referral Error:", error);
                });
        }
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
                    <CommonHeader showBack={true} search={false} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <VStack padding={5} space={8} justifyContent={'center'} alignItems={'center'}>
                            <Stack alignSelf={'center'} justifyContent={'center'} alignItems={'center'} style={{ backgroundColor: '#000000', width: 140, height: 140, marginTop: 30, borderRadius: 100, overflow: 'hidden' }}>
                                <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                            </Stack>
                            <Text color={"#ffffff"} fontSize="md">{t("Please Sign Up Now")}</Text>
                            <VStack space={4} style={{ width: '100%' }}>
                                <View style={styles.inputbox}>
                                    <Input
                                        size="md"
                                        style={{ height: 45, color: '#000000' }}
                                        onChangeText={(text) => setName(text)}
                                        value={name}
                                        variant="unstyled"
                                        placeholder={t("Enter Your Name") + " *"}
                                    />
                                </View>
                                <View>
                                    <Pressable style={styles.inputbox} onPress={() => showDatePicker()}>
                                        <HStack style={{ paddingHorizontal: 10, height: 43 }} alignItems="center" paddingY={Platform.OS == 'ios' ? '1.5' : '2.5'} justifyContent="space-between">
                                            <Text color={dob != '' ? '#111111' : '#999999'} fontSize="sm"> {dob != '' ? moment(dob).format('DD-MM-YYYY') : "DOB *"}</Text>
                                            <Icon name="calendar-outline" size={18} color={"#111111"} />
                                        </HStack>
                                    </Pressable>
                                </View>
                                <View style={styles.inputbox}>
                                    <Select variant="unstyled" size="md" height={45}
                                        placeholder='Please Choose Gender *'
                                        selectedValue={gender}
                                        onValueChange={value => setGender(value)}
                                        style={{ paddingLeft: 15 }}
                                        dropdownCloseIcon={<Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />}
                                        dropdownOpenIcon={<Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />}
                                        _selectedItem={{
                                            backgroundColor: 'green',
                                            endIcon: <Icon name="checkmark-circle" size={20} color={'#000000'} style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        <Select.Item label={"Male"} value={"male"} />
                                        <Select.Item label={"Female"} value={"female"} />
                                        <Select.Item label={"Others"} value={"others"} />
                                    </Select>
                                </View>
                                <View style={styles.inputbox}>
                                    <Input
                                        size="md"
                                        style={{ height: 45, color: '#000000' }}
                                        onChangeText={(text) => setEmail(text)}
                                        value={email}
                                        variant="unstyled"
                                        placeholder={t("Email") + " *"}
                                    />
                                </View>
                                <DateTimePickerModal date={dob || undefined} isVisible={isDatePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={hideDatePicker} />
                            </VStack>
                            <Button size="sm" backgroundColor={"#fc030b"} style={{ width: '100%', height: 45, marginTop: 10, borderRadius: 15, overflow: 'hidden' }} onPress={() => onSubmit()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Register")}</Text>
                            </Button>
                        </VStack>
                    </ScrollView>
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
    inputbox: { backgroundColor: '#eeeeee', borderRadius: 15, width: '100%', overflow: 'hidden', height: 45, paddingHorizontal: 10 },
    custbtn: { width: '100%', borderRadius: 15, overflow: 'hidden', height: 45 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default SignupScreen;