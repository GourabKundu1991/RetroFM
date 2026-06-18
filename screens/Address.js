import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Input, Select, Divider } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Image, Keyboard, ScrollView, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { AccessToken, API_KEY, BASE_URL, OS_TYPE } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import { HeadingBox } from '../components/CommonComponent';
import { OtpInput } from "react-native-otp-entry";
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';

const AddreessScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [altAddress, setAltAddress] = React.useState("");
    const [parAddress, setParAddress] = React.useState("");

    const [addressId, setAddressId] = React.useState("");
    const [addressType, setAddressType] = React.useState("");

    const [otp, setOtp] = React.useState('');

    const [pop, setPop] = React.useState(false);
    const [successOrder, setSuccessOrder] = React.useState(false);
    const [popAddress, setPopAddress] = React.useState(false);

    const [address1, setAddress1] = React.useState("");
    const [address2, setAddress2] = React.useState("");
    const [address3, setAddress3] = React.useState("");
    const [state, setState] = React.useState("");
    const [city, setCity] = React.useState("");
    const [pinCode, setPinCode] = React.useState("");

    const [stateList, setStateList] = React.useState([]);
    const [cityList, setCityList] = React.useState([]);
    const { width, height } = useWindowDimensions();

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
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    setColorTheme(JSON.parse(val).info.theme_color);
                    Events.publish('colorTheme', val.info.theme_color);
                }
            });
            getAllData();
        });
        return unsubscribe;
    }, []);

    const onSelectState = (idVal) => {
        setLoading(true);
        setState(idVal);
        setCity("");
        getCityList(idVal);
    }


    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                apiClient
                    .post(`${BASE_URL}/get_user_address`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("get_user_address:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setAltAddress(responseJson.data.address.alternate_addresses);
                            setParAddress(responseJson.data.address.permanent_address);
                            getStateList();
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.message == "Session is expired") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("get_user_address Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const getStateList = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("os_type", `${OS_TYPE}`);
                apiClient
                    .post(`${BASE_URL}/GetStateList`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("GetStateList:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setStateList(responseJson.data.state_list);
                            setLoading(false);
                        } else {
                            setLoading(false);
                            setStateList([]);
                            Toast.show({ description: responseJson.data.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("GetStateList Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const getCityList = (stateId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("state_id", stateId);
                apiClient
                    .post(`${BASE_URL}/GetCityWithStateIDList`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("GetCityWithStateIDList:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setCityList(responseJson.data.city_list);
                            setLoading(false);
                        } else {
                            setLoading(false);
                            setStateList([]);
                            Toast.show({ description: responseJson.data.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("GetCityWithStateIDList Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const selectAddress = (addId, addType) => {
        setAddressId(addId);
        setAddressType(addType);
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("contactHierId", JSON.parse(val).hier_id);
                apiClient
                    .post(`${BASE_URL}/generate_shipping_otp`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("generate_shipping_otp:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setPop(true);
                            Toast.show({ description: responseJson.data.message });
                            setLoading(false);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.message == "Session is expired") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("generate_shipping_otp Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onCancel = () => {
        setPop(false);
        setOtp("");
    }

    const resendOTP = () => {
        selectAddress(addressId, addressType);
    }

    const onVerify = () => {
        Keyboard.dismiss();
        if (otp.trim() == '') {
            Toast.show({ description: t("Please enter OTP") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("os_type", `${OS_TYPE}`);
                    formdata.append("otpVal", otp);
                    apiClient
                        .post(`${BASE_URL}/validate_shipping_otp`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                            //console.log("Verify OTP:", responseJson.data);
                            if (responseJson.data.bstatus == 1) {
                                Toast.show({ description: responseJson.data.message });
                                onCancel();
                                onPlaceOrder();
                            } else {
                                setLoading(false);
                                Toast.show({ description: responseJson.data.message });
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.log("Verify OTP Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Welcome');
                }
            });
        }
    }

    const onSaveAddress = () => {
        if (address1.trim() == "") {
            Toast.show({ description: t("Please enter Address Line 1") });
        } else if (address2.trim() == "") {
            Toast.show({ description: t("Please enter Address Line 2") });
        } else if (state == "") {
            Toast.show({ description: t("Please select State") });
        } else if (city == "") {
            Toast.show({ description: t("Please select City") });
        } else if (pinCode.trim() == "") {
            Toast.show({ description: t("Please enter Pincode") });
        } else {
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("add_address_line1", address1);
                    formdata.append("add_address_line2", address2);
                    formdata.append("add_address_line3", address3);
                    formdata.append("add_state", state);
                    formdata.append("add_city", city);
                    formdata.append("add_pincode", pinCode);
                    apiClient
                        .post(`${BASE_URL}/add_alternate_address`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                            console.log("add_alternate_address:", responseJson.data);
                            if (responseJson.data.bstatus == 1) {
                                onCancelAddress();
                                selectAddress(responseJson.data.address_id, 'dcm_contact_shipping_address');
                            } else {
                                if (responseJson.data.message == "Session is expired") {
                                    Toast.show({ description: responseJson.data.message });
                                    setTimeout(function () {
                                        AsyncStorage.clear();
                                        navigation.navigate('Welcome');
                                    }, 1000);
                                } else {
                                    Alert.alert(
                                        t("Sorry") + "!",
                                        responseJson.data.message,
                                        [
                                            {
                                                text: t("Ok"), onPress: () => { }
                                            }
                                        ],
                                        { cancelable: false }
                                    );
                                }
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            console.log("add_alternate_address Error:", error);
                            Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                        });
                } else {
                    setLoading(false);
                    AsyncStorage.clear();
                    navigation.navigate('Wlcome');
                }
            });
        }
    }

    const onPlaceOrder = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("cartId", route.params.cartId);
                formdata.append("address_id", addressId);
                formdata.append("referece_address_table", addressType);
                apiClient
                    .post(`${BASE_URL}/order`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Order Placed:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setSuccessOrder(true);
                            getAllData();
                        } else {
                            if (responseJson.data.message == "Session is expired") {
                                Toast.show({ description: responseJson.data.message });
                                setTimeout(function () {
                                    setLoading(false);
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }, 1000);
                            } else {
                                setLoading(false);
                                Alert.alert(
                                    t("Sorry") + "!",
                                    responseJson.data.message,
                                    [
                                        {
                                            text: t("Ok"), onPress: () => { }
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Order Placed Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onContinue = () => {
        setSuccessOrder(false);
        navigation.navigate('Home');
    }

    const onCancelAddress = () => {
        setPopAddress(false);
        setAddress1("");
        setAddress2("");
        setAddress3("");
        setState("");
        setCity("");
        setPinCode("");
    }

    const LabelValue = ({ label, value }) => {
        return (
            <HStack space={1.5} alignItems={'center'}>
                <Text fontWeight={'bold'} color={'#707274'}>{label}:</Text>
                <Text color={'#707274'}>{value}</Text>
            </HStack>
        )
    }

    const AddressContent = ({ type, data, onPress }) => {
        return (
            <Box px={4} py={4} borderRadius={10} bgColor={'white'}>
                <Box position={'absolute'} right={15} top={15} borderRadius={5} px={4} py={0.5} alignSelf={'flex-start'} bgColor={colorTheme.light}>
                    <Text fontWeight={'semibold'} color={colorTheme?.dark}>{type}</Text>
                </Box>
                <Stack my={1} />
                {(data == "") ?
                    <HStack padding="10" justifyContent="center">
                        <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                    </HStack>
                    :
                    <>
                        <LabelValue
                            label={t("Address Line1")}
                            value={data?.line1}
                        />
                        <LabelValue
                            label={t("Address Line2")}
                            value={data?.line2}
                        />
                        {(data?.line3) && (
                            <LabelValue
                                label={t("Address Line3")}
                                value={data?.line3}
                            />
                        )}
                        <LabelValue
                            label={t("Country")}
                            value={data?.country}
                        />
                        <LabelValue
                            label={t("State")}
                            value={data?.state}
                        />
                        <LabelValue
                            label={t("City")}
                            value={data?.city}
                        />
                        <LabelValue
                            label={t("Post Code")}
                            value={data?.post_code}
                        />
                        <Button onPress={() => onPress()} mt={4} size={'xs'} bgColor={colorTheme?.normal} alignSelf={'flex-end'}>
                            {t("Delivery to This Address")}
                        </Button>
                    </>
                }
            </Box>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Select Shipping Address")}
                colorTheme={colorTheme}
            />
            <Box px={4} flex={1} bg={"#F1F1F1"}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Box>
                        <VStack>
                            <Stack my={2} />
                            <AddressContent
                                type={t("Parmanent")}
                                data={parAddress}
                                onPress={() => selectAddress(parAddress.add_id, 'dcm_addresses')}
                            />
                            <Stack my={2} />
                            {altAddress && (
                                <AddressContent
                                    type={t("Alternative")}
                                    data={altAddress}
                                    onPress={() => selectAddress(altAddress.add_id, 'dcm_contact_shipping_address')}
                                />
                            )}
                            <Stack my={2} />
                            <HStack justifyContent="center" alignItems="center" w="100%" marginTop={4}>
                                <Button variant={'outline'} borderColor={colorTheme.dark} backgroundColor={'#ffffff'} size="lg" width="100%" borderRadius={8} _text={{ color: colorTheme.normal, fontWeight: 'bold' }} onPress={() => setPopAddress(true)}>{t("Add New Address")}</Button>
                            </HStack>
                        </VStack>
                    </Box>
                </ScrollView>
            </Box>
            <BottomTabs
                selected={2}
                colorTheme={colorTheme}
            />
            {pop && (
                <View style={styles.spincontainer}>
                    <Box px={4} py={4} borderTopLeftRadius={10} borderTopRadius={10} bgColor={'#FFFFFF'} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        <HStack justifyContent={'space-between'}>
                            <Text fontSize="lg" fontWeight="bold">{t("OTP Verification")}</Text>
                            <TouchableOpacity onPress={() => onCancel()}>
                                <Icon name={'close'} color={'black'} size={24} />
                            </TouchableOpacity>
                        </HStack>
                        <Text color="#444444" fontSize="sm">{t("Please Enter OTP and click Place Order to Continue")}</Text>
                        <Stack my={4} />
                        <OtpInput
                            autoFocus={false}
                            // ref={otpRef}
                            onTextChange={(text) => setOtp(text)}
                            onFilled={(text) => Keyboard.dismiss()}
                            focusColor={'black'}
                            theme={{
                                filledPinCodeContainerStyle: { borderColor: '#928FA6B2' },
                                pinCodeTextStyle: { color: '#000000' }
                            }}
                        />
                        <Stack my={4} />
                        <HStack justifyContent={'space-between'} alignItems={'center'}>
                            <Text onPress={() => resendOTP()} fontWeight={'semibold'} underline color={colorTheme?.normal}>{t('Resend OTP')}</Text>
                            <Button bgColor={colorTheme?.normal} onPress={() => onVerify()}>
                                {t('Place Order')}
                            </Button>
                        </HStack>
                    </Box>
                </View>
            )}
            {popAddress && (
                // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.spincontainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <LinearGradient
                            colors={['#F1F1F1', "#F1F1F1"]}
                            start={{ x: 0.5, y: 0 }}
                            style={{ width: width, height: height, overflow: 'hidden' }}
                        >
                            <CommonHeader
                                navigation={navigation}
                                showBack={true}
                                title={t("Add New Address")}
                                colorTheme={colorTheme}
                                onPressBack={() => onCancelAddress()}
                            />
                            <Box px={4} py={2} >
                                {/* <HeadingBox
                                    prefixIcon={require('../assets/images/map.png')}
                                    colorTheme={colorTheme}
                                    title={t('Address Entry')}
                                    desc={t('Complete Below')}
                                /> */}
                                <Box px={6} py={8} mt={6} borderRadius={10} bgColor={'white'} style={{ elevation: 4 }}>
                                    <Image source={require('../assets/images/map.png')} style={{ width: 250, height: 150, resizeMode: 'contain', alignSelf: 'center' }} />
                                    <Stack my={4} />
                                    <Text mb={0.5}>{t("Address Line 1")}<Text color={'red.400'}> *</Text></Text>
                                    <View style={styles.inputboxNew}>
                                        <Input
                                            size="lg"
                                            onChangeText={(text) => setAddress1(text)}
                                            value={address1.toString()}
                                            variant="unstyled"
                                            // InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                            placeholder={t("Address Line 1") + " *"}
                                        />
                                    </View>
                                    <Text mt={3} mb={0.5}>{t("Address Line 2")}<Text color={'red.400'}> *</Text></Text>
                                    <View style={styles.inputboxNew}>
                                        <Input
                                            size="lg"
                                            onChangeText={(text) => setAddress2(text)}
                                            value={address2.toString()}
                                            variant="unstyled"
                                            // InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                            placeholder={t("Address Line 2") + " *"}
                                        />
                                    </View>
                                    <Text mt={3} mb={0.5}>{t("Address Line 3")}</Text>
                                    <View style={styles.inputboxNew}>
                                        <Input
                                            size="lg"
                                            onChangeText={(text) => setAddress3(text)}
                                            value={address3.toString()}
                                            variant="unstyled"
                                            // InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                            placeholder={t("Address Line 3") + " *"}
                                        />
                                    </View>
                                    <Text mt={3} mb={0.5}>{t("State")}<Text color={'red.400'}> *</Text></Text>
                                    <View style={styles.inputboxNew}>
                                        <Select pl={4} size="lg" width={400} maxWidth={'100%'} placeholder={t("Select State") + " *"}
                                            selectedValue={state}
                                            variant={'unstyled'}
                                            onValueChange={value => onSelectState(value)}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {stateList.map((item, index) =>
                                                <Select.Item key={index} label={item.state_name} value={item.state_id} />
                                            )}
                                        </Select>
                                    </View>
                                    {state != "" && (
                                        <>
                                            <Text mt={3} mb={0.5}>{t("City")}<Text color={'red.400'}> *</Text></Text>
                                            <View style={styles.inputboxNew}>
                                                <Select pl={4} variant="unstyled" size="lg" width={400} maxWidth={'100%'} placeholder={t("Select City") + " *"}
                                                    selectedValue={city}
                                                    onValueChange={value => setCity(value)}
                                                    _selectedItem={{
                                                        backgroundColor: '#eeeeee',
                                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                    }}>
                                                    {cityList.map((item, index) =>
                                                        <Select.Item key={index} label={item.city_name} value={item.city_id} />
                                                    )}
                                                </Select>
                                            </View>
                                        </>
                                    )}
                                    <Text mt={3} mb={0.5}>{t("Pincode")}<Text color={'red.400'}> *</Text></Text>
                                    <View style={styles.inputboxNew}>
                                        <Input
                                            size="lg"
                                            onChangeText={(text) => setPinCode(text)}
                                            value={pinCode.toString()}
                                            variant="unstyled"
                                            keyboardType='number-pad'
                                            maxLength={6}
                                            // InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />}
                                            placeholder={t("Pincode") + " *"}
                                        />
                                    </View>
                                    <Button onPress={() => onSaveAddress()} bgColor={colorTheme?.normal} mt={8}>
                                        {t('Save')}
                                    </Button>
                                    {/* <Text onPress={() => onCancelAddress()} fontWeight={'semibold'} color={'gray.500'} mt={6} textAlign={'center'} fontSize={'sm'} underline>{t('Cancel')}</Text> */}
                                </Box>
                            </Box>
                            {/* <View style={styles.spincontainer}>
                        <LinearGradient
                            colors={['#ffffff', "#cccccc"]}
                            start={{ x: 0.5, y: 0 }}
                            style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                        >
                            <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                                <Stack space={3} alignItems="center">
                                    <Text color={colorTheme.dark} fontSize="lg" fontWeight="bold">{t("Add New Address")}</Text>
                                    <Text color="#444444" paddingX="5" fontSize="sm" mb={4} textAlign="center">{t("Please Enter your Address Details and click Save Address to Continue")}</Text>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" width={'100%'} onChangeText={(text) => setAddress1(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 1") + " *"} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" width={'100%'} onChangeText={(text) => setAddress2(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 2") + " *"} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" width={'100%'} onChangeText={(text) => setAddress3(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Address Line 3")} />
                                    </View>
                                    <View style={styles.inputbox}>
                                        <Select variant="underlined" size="lg" width={400} maxWidth={'100%'} placeholder={t("Select State") + " *"}
                                            InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                            selectedValue={state}
                                            onValueChange={value => onSelectState(value)}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {stateList.map((item, index) =>
                                                <Select.Item key={index} label={item.state_name} value={item.state_id} />
                                            )}
                                        </Select>
                                    </View>
                                    {state != "" && (
                                        <View style={styles.inputbox}>
                                            <Select variant="underlined" size="lg" width={400} maxWidth={'100%'} placeholder={t("Select City") + " *"}
                                                InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                                selectedValue={city}
                                                onValueChange={value => setCity(value)}
                                                _selectedItem={{
                                                    backgroundColor: '#eeeeee',
                                                    endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                }}>
                                                {cityList.map((item, index) =>
                                                    <Select.Item key={index} label={item.city_name} value={item.city_id} />
                                                )}
                                            </Select>
                                        </View>
                                    )}
                                    <View style={styles.inputbox}>
                                        <Input size="lg" width={'100%'} keyboardType='number-pad' maxLength={6} onChangeText={(text) => setPinCode(text)} variant="unstyled" InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Pincode") + " *"} />
                                    </View>
                                </Stack>
                                <HStack space={1} alignItems="center" justifyContent="space-evenly" overflow="hidden" marginTop={8}>
                                    <Button size="sm" style={{ backgroundColor: '#999999', width: '28%', borderRadius: 30, overflow: 'hidden' }} onPress={() => onCancelAddress()}>
                                        <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Close")}</Text>
                                    </Button>
                                    <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: '65%', borderRadius: 30, overflow: 'hidden' }} onPress={() => onSaveAddress()}>
                                        <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Save")}</Text>
                                    </Button>
                                </HStack>
                            </VStack> */}
                        </LinearGradient>
                    </ScrollView>
                </View>
            )}
            {successOrder && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', "#cccccc"]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 10, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="10" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="checkmark-done-circle-outline" size={100} color={colorTheme.dark}></Icon>
                            <Text mt={8} fontSize="xl" fontWeight="bold" color="#111111">{t("Thank You")}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your order has been Placed Successfully")}.</Text>
                            <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: 180, borderRadius: 8, overflow: 'hidden' }} onPress={() => onContinue()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
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
    );
};

const styles = StyleSheet.create({
    inputbox: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, width: '100%', overflow: 'hidden', marginVertical: 0 }, inputbox: { backgroundColor: '#ffffff', borderRadius: 30, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    optionbtn: { backgroundColor: 'none', width: '46%', borderRadius: 8, overflow: 'hidden' },
    productbox: { borderRadius: 20, width: '96%', margin: '2%', borderWidth: 2, overflow: 'hidden' },
    spincontainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)'
    },
    inputboxNew: { backgroundColor: '#ffffff', borderRadius: 10, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },

});

export default AddreessScreen;
