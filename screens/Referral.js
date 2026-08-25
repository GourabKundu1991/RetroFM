import { Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack, Select } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import CheckBox from '@react-native-community/checkbox';

const ReferralScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [refDetails, setRefDetails] = React.useState("");

    const [tab, setTab] = React.useState([]);
    const [selectedTab, setSelectedTab] = React.useState("");
    const [tabMenu, setTabMenu] = React.useState([]);
    const [transactionType, setTransactionType] = React.useState([]);

    const [selectedTransactionType, setSelectedTransactionType] = React.useState("");

    const [isAccept, setIsAccept] = React.useState(false);

    const [popUp, setPopUp] = React.useState(false);

    const [bankName, setBankName] = React.useState("");
    const [IFSCcode, setSIFSCcode] = React.useState("");
    const [accountNumber, setAccountNumber] = React.useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = React.useState("");
    const [holderName, setHolderName] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [upiID, setUpiID] = React.useState("");
    const [paypalID, setPaypalID] = React.useState("");

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
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("language", currentLanguage);
                apiClient
                    .post(`${BASE_URL}/get-referral-details`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("referral:", responseJson);
                        if (responseJson.status == true) {
                            setRefDetails(responseJson.details);
                            setSelectedTab(responseJson.details.tab_details[0].label);
                            setTabMenu(responseJson.details.tab_details[0].menu);
                            setTab(responseJson.details.tab_details);
                            setTransactionType(responseJson.details.withdraw_options);
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
                        console.log("referral Error:", error);
                    });
            }
        })
    }

    const onShare = async () => {
        try {
            const result = await Share.share({
                title: refDetails.referral_text,
                message: refDetails.referral_url
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const onTabSelect = (itemData) => {
        setSelectedTab(itemData.label);
        setTabMenu(itemData.menu);
    }

    const onWithdraw = () => {
        setPopUp(true);
    }

    const onClose = () => {
        setPopUp(false);
        setSelectedTransactionType("");
        setBankName("");
        setSIFSCcode("");
        setAccountNumber("");
        setConfirmAccountNumber("");
        setHolderName("");
        setUpiID("");
        setPaypalID("");
        setAmount("");
    }

    const onModeChange = () => {
        setBankName("");
        setSIFSCcode("");
        setAccountNumber("");
        setConfirmAccountNumber("");
        setHolderName("");
        setUpiID("");
        setPaypalID("");
        setAmount("");
    }

    const onSubmit = () => {
        if (selectedTransactionType === 0 && bankName.trim() == "") {
            Toast.show({ description: t("Please enter Bank Name") });
        } else if (selectedTransactionType === 0 && IFSCcode.trim() == "") {
            Toast.show({ description: t("Please enter IFSC Code") });
        } else if (selectedTransactionType === 0 && accountNumber.trim() == "") {
            Toast.show({ description: t("Please enter Account Number") });
        } else if (selectedTransactionType === 0 && confirmAccountNumber.trim() == "") {
            Toast.show({ description: t("Please enter Confirm Account Number") });
        } else if (selectedTransactionType === 0 && accountNumber != confirmAccountNumber) {
            Toast.show({ description: t("Account Number and Cofirm Account Number Not matched") });
        } else if (selectedTransactionType === 0 && holderName.trim() == "") {
            Toast.show({ description: t("Please enter Account Holder Name") });
        } else if (selectedTransactionType === 1 && upiID.trim() == "") {
            Toast.show({ description: t("Please enter UPI ID") });
        } else if (selectedTransactionType === 2 && paypalID.trim() == "") {
            Toast.show({ description: t("Please enter PayPal ID") });
        } else if (amount.trim() == "") {
            Toast.show({ description: t("Please enter Withdraw Amount") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("withdraw_type", selectedTransactionType);
                    formdata.append("bank_name", bankName);
                    formdata.append("ifsc_code", IFSCcode);
                    formdata.append("account_number", accountNumber);
                    formdata.append("account_holder_name", holderName);
                    formdata.append("upi_id", upiID);
                    formdata.append("paypal_id", paypalID);
                    formdata.append("amount", amount);
                    /*Axis Bank
                    :AXIS000213
                    :3635343637389373
                    :Gopinath Mukherjee*/
                    apiClient
                        .post(`${BASE_URL}/submit-withdraw-request`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                authtoken: `${AuthToken}`,
                                accesstoken: JSON.parse(val).access_token
                            },
                        }).then(response => {
                            return response.data;
                        })
                        .then((responseJson) => {
                            console.log("withdraw referral:", responseJson);
                            if (responseJson.status == true) {
                                Toast.show({ description: responseJson.message });
                                getAllData();
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
            })
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
                            <Image style={{ width: '100%', height: 300, resizeMode: 'contain' }} source={{ uri: refDetails.referral_image }} />
                            <Text color={"#ffffff"} fontSize="md">{refDetails.referral_text}</Text>
                            <HStack justifyContent={'space-evenly'} alignItems={'center'} width={'100%'}>
                                <View style={{ width: '70%', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 12, borderColor: '#444444', borderWidth: 1, backgroundColor: '#111111' }}>
                                    <Text color={"#ffffff"} fontSize="md">{refDetails.referral_code}</Text>
                                </View>
                                <Pressable onPress={() => onShare()} style={{ width: '20%', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 12, borderColor: '#FC030B', borderWidth: 1, backgroundColor: '#FC030B' }}>
                                    <Icon name="share-outline" size={24} color="#ffffff" />
                                </Pressable>
                            </HStack>
                            <HStack justifyContent={'space-evenly'} alignItems={'center'} width={'100%'}>
                                {tab.map((item, index) =>
                                    <Pressable key={index} onPress={() => onTabSelect(item)} style={{ width: '45%', justifyContent: 'center', alignItems: 'center', height: 40, borderRadius: 12, borderColor: selectedTab == item.label ? '#FC030B' : '#444444', borderWidth: 1, backgroundColor: selectedTab == item.label ? '#FC030B' : '#222222' }}>
                                        <Text color={selectedTab == item.label ? "#ffffff" : "#666666"} fontSize="sm">{item.label}</Text>
                                    </Pressable>
                                )}
                            </HStack>
                            {tabMenu.length != 0 ?
                                <VStack space={2} alignItems="center" padding={5} width={'90%'} borderColor={"#999999"} borderWidth={0.5}>
                                    {tabMenu.map((item, index) =>
                                        <HStack key={index} width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                                            <Text color={"#999999"} fontSize="sm">{item.label}:</Text>
                                            {item.isHighlight ?
                                                <Pressable style={{ minWidth: 50, justifyContent: 'center', alignItems: 'center', height: 25, borderRadius: 6, backgroundColor: '#FC030B' }}>
                                                    <Text color={"#ffffff"} fontSize="md">{refDetails.referral_amount ? refDetails.referral_amount : 0}</Text>
                                                </Pressable>
                                                :
                                                <Text color={"#FC030B"} fontSize="sm">{item.value}</Text>
                                            }
                                        </HStack>
                                    )}
                                </VStack>
                                :
                                <VStack space={2} alignItems="center" padding={5} width={'90%'} borderColor={"#999999"} borderWidth={0.5}>
                                    <Text color={"#666666"} fontSize="md">{t("No Data Found")}</Text>
                                </VStack>
                            }
                            {selectedTab == "Details" && (
                                <Stack style={{width: '100%'}}>
                                    <HStack space={1} alignItems="center" paddingRight={2}>
                                        <CheckBox
                                            value={isAccept}
                                            onValueChange={() => setIsAccept(!isAccept)}
                                            tintColors={{ true: '#FC030B' }}
                                        />
                                        <Text
                                            fontSize="xs"
                                            color={"#ffffff"}>
                                            {t('I accept the terms & conditions and privacy policy')}
                                        </Text>
                                    </HStack>
                                    <Button disabled={!isAccept} opacity={!isAccept ? 0.2 : 1} style={styles.custbtn} backgroundColor={'#fc030b'} onPress={() => onWithdraw()} marginY={2}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="bold">{t("Withdraw")}</Text>
                                    </Button>
                                </Stack>
                            )}
                        </VStack>
                    </ScrollView>

                    <BottomTabs selected={"-"} />
                </LinearGradient>
            </VStack>
            {popUp && (
                <View style={styles.spincontainer}>
                    <Button backgroundColor={"#eeeeee"} style={{ borderRadius: 30, overflow: 'hidden', height: 40, width: 40, position: 'absolute', right: 30, top: 15 }} size="xs" marginTop={5} onPress={() => onClose()}>
                        <Text color="#000000" fontSize="2xl" lineHeight={10}>X</Text>
                    </Button>
                    <Stack style={{ width: 300, borderRadius: 15, overflow: 'hidden', backgroundColor: '#ffffff' }}>
                        <VStack space={5} w="100%" minHeight={250} paddingY="5" paddingX="5" alignItems="center" justifyContent="center">
                            <Text textAlign={'center'} fontSize="lg" marginBottom={5} color={"#000000"} fontWeight="bold">Withdraw Options</Text>
                            <VStack space={2} style={{ width: '100%' }}>
                                <View style={styles.inputbox}>
                                    <Select variant="unstyled" size="md" height={45}
                                        placeholder='Please Select Mode'
                                        selectedValue={selectedTransactionType}
                                        onValueChange={value => (setSelectedTransactionType(value), onModeChange())}
                                        style={{ paddingLeft: 15 }}
                                        dropdownCloseIcon={<Icon name="chevron-down-outline" style={{ marginRight: 10 }} size={20} />}
                                        dropdownOpenIcon={<Icon name="chevron-up-outline" style={{ marginRight: 10 }} size={20} />}
                                        _selectedItem={{
                                            backgroundColor: 'green',
                                            endIcon: <Icon name="checkmark-circle" size={20} color={'#000000'} style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        {transactionType.map((item, index) =>
                                            <Select.Item key={index} label={item.type} value={item.id} />
                                        )}
                                    </Select>
                                </View>
                                {selectedTransactionType === 0 && (
                                    <VStack space={2}>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setBankName(text)}
                                                value={bankName}
                                                variant="unstyled"
                                                placeholder={t("Enter Bank Name") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setSIFSCcode(text)}
                                                value={IFSCcode}
                                                variant="unstyled"
                                                placeholder={t("Enter IFSC Code") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setAccountNumber(text)}
                                                value={accountNumber}
                                                keyboardType='number-pad'
                                                variant="unstyled"
                                                placeholder={t("Enter Account Number") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setConfirmAccountNumber(text)}
                                                value={confirmAccountNumber}
                                                keyboardType='number-pad'
                                                variant="unstyled"
                                                placeholder={t("Confirm Account Number") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setHolderName(text)}
                                                value={holderName}
                                                variant="unstyled"
                                                placeholder={t("Enter Account Holder Name") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setAmount(text)}
                                                value={amount}
                                                keyboardType='number-pad'
                                                variant="unstyled"
                                                placeholder={t("Enter Withdraw Amount") + " *"}
                                            />
                                        </View>
                                    </VStack>
                                )}
                                {selectedTransactionType === 1 && (
                                    <VStack space={2}>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setUpiID(text)}
                                                value={upiID}
                                                variant="unstyled"
                                                placeholder={t("Enter UPI ID") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setAmount(text)}
                                                value={amount}
                                                keyboardType='number-pad'
                                                variant="unstyled"
                                                placeholder={t("Enter Withdraw Amount") + " *"}
                                            />
                                        </View>
                                    </VStack>
                                )}
                                {selectedTransactionType === 2 && (
                                    <VStack space={2}>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setPaypalID(text)}
                                                value={paypalID}
                                                variant="unstyled"
                                                placeholder={t("Enter PayPal ID") + " *"}
                                            />
                                        </View>
                                        <View style={styles.inputbox}>
                                            <Input
                                                size="md"
                                                style={{ height: 45, color: '#000000' }}
                                                onChangeText={(text) => setAmount(text)}
                                                value={amount}
                                                keyboardType='number-pad'
                                                variant="unstyled"
                                                placeholder={t("Enter Withdraw Amount") + " *"}
                                            />
                                        </View>
                                    </VStack>
                                )}
                            </VStack>
                            {selectedTransactionType !== "" && (
                                <Button size="sm" backgroundColor={"#fc030b"} style={{ width: '100%', height: 45, marginTop: 20, borderRadius: 15, overflow: 'hidden' }} onPress={() => onSubmit()}>
                                    <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Submit")}</Text>
                                </Button>
                            )}
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
    inputbox: { backgroundColor: '#eeeeee', borderRadius: 15, width: '100%', overflow: 'hidden', height: 45, paddingHorizontal: 10 },
    custbtn: { width: '100%', borderRadius: 15, overflow: 'hidden', height: 45 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default ReferralScreen;