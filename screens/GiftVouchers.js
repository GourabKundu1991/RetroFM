import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Input, Checkbox, AlertDialog } from 'native-base';
import React, { useEffect, useRef } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, Keyboard, ScrollView, StatusBar, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RenderHTML from 'react-native-render-html';
import moment from 'moment';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import { OtpInput } from 'react-native-otp-entry';
import apiClient from '../api/apiClient';

const GiftVouchersScreen = ({ navigation }) => {

    const { width } = useWindowDimensions();

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState("Gift");
    const [dataFound, setDataFound] = React.useState("");

    const [allVouchers, setAllVouchers] = React.useState([]);

    const [pop, setPop] = React.useState(false);
    const [otp, setOtp] = React.useState('');

    const [itemDetails, setItemDetails] = React.useState("");
    const [otpId, setOtpId] = React.useState("");
    const [termsCheck, setTermsCheck] = React.useState(false);

    const otpRef = useRef();

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
            getGiftData();
        });
        return unsubscribe;
    }, []);

    const getGiftData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/voucher_list`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Voucher:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setAllVouchers(responseJson.data.vouchers);
                            if (responseJson.data.vouchers.length != 0) {
                                setDataFound("found");
                            } else {
                                setDataFound("notfound");
                            }
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setDataFound("notfound");
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
                        //console.log("Voucher Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const getVehicleData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/vehicle_voucher_list`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Voucher:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setAllVouchers(responseJson.data.vouchers);
                            if (responseJson.data.vouchers.length != 0) {
                                setDataFound("found");
                            } else {
                                setDataFound("notfound");
                            }
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setDataFound("notfound");
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
                        console.log("Voucher Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onSetFilter = (type) => {
        setLoading(true);
        setFilterStatus(type);
        if (type == "Gift") {
            getGiftData();
        } else {
            getVehicleData();
        }
    }

    const unlockVoucher = (voucherData) => {
        setItemDetails(voucherData);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("skuId", voucherData.inv_sku_id);
                apiClient
                    .post(`${BASE_URL}/is_voucher_unlocked`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        //console.log("Unlock Voucher:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            sendOtp(voucherData);
                            setPop(true);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setDataFound("notfound");
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
                        console.log("Unlock Voucher Error:", error);
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

    const sendOtp = (vData) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("skuId", vData.inv_sku_id);
                formdata.append("productName", vData.product_name);
                formdata.append("lockedCode", vData.locked_code);
                apiClient
                    .post(`${BASE_URL}/registered_mobile_number_verification`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        setLoading(false);
                        console.log("Get OTP:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Toast.show({ description: responseJson.data.message });
                            setOtpId(responseJson.data.verification_respons.otp_id);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("OTP Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onVerify = () => {
        Keyboard.dismiss();
        if (otp.trim() == '') {
            Toast.show({ description: t("Please enter OTP") });
        } else if (termsCheck === false) {
            Toast.show({ description: t("Please accept Terms & Condition") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("token", JSON.parse(val).token);
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("skuId", itemDetails.inv_sku_id);
                    formdata.append("otpId", otpId);
                    formdata.append("otp", otp);
                    formdata.append("is_tnc_checked", termsCheck === true ? 1 : 0);
                    apiClient
                        .post(`${BASE_URL}/voucher_otp_verification`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                            console.log("Verify OTP:", responseJson.data);
                            if (responseJson.data.bstatus == 1) {
                                Toast.show({ description: responseJson.data.message });
                                onCancel();
                                getGiftData();
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

    const openDownloadPdf = (path) => {
        const fileName = "Voucher_" + moment(new Date()).format("DD-MMMM-YYYY");
        let dirs = ReactNativeBlobUtil.fs.dirs;
        ReactNativeBlobUtil.config({
            fileCache: true,
            appendExt: 'pdf',
            path: `${dirs.DocumentDir}/${fileName}`,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: fileName,
                description: 'File downloaded by download manager.',
                mime: 'application/pdf',
            },
        })
            .fetch('GET', path)
            .then((res) => {
                setLoading(false);
                // in iOS, we want to save our files by opening up the saveToFiles bottom sheet action.
                // whereas in android, the download manager is handling the download for us.
                if (Platform.OS === 'ios') {
                    const filePath = res.path();
                    let options = {
                        type: 'application/pdf',
                        url: filePath,
                        saveToFiles: true,
                    };
                    Share.open(options)
                        .then((resp) => console.log(resp))
                        .catch((err) => console.log(err));
                }
            })
            .catch((err) => console.log('BLOB ERROR -> ', err));
    };

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("My Gift Vouchers")}
                colorTheme={colorTheme}
            />
            <HStack alignItems="center" justifyContent="space-evenly" backgroundColor={colorTheme.normal} paddingX={3} paddingY={1}>
                <Button size="xs" borderRadius={0} variant="link" borderColor={filterStatus == "Gift" ? '#ffffff' : colorTheme.normal} borderBottomWidth={2} _text={{ color: filterStatus == "Gift" ? "#ffffff" : "#dddddd", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSetFilter("Gift")}>{t("Gift Voucher")}</Button>
                <Button size="xs" borderRadius={0} variant="link" borderColor={filterStatus == "Vehicle" ? '#ffffff' : colorTheme.normal} borderBottomWidth={2} _text={{ color: filterStatus == "Vehicle" ? "#ffffff" : "#dddddd", fontWeight: 'medium', fontSize: 12 }} onPress={() => onSetFilter("Vehicle")}>{t("Vehicle Voucher")}</Button>
            </HStack>
            <Box flex={1} bg={"#f1f1f1"}>
                {/* <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("My Gift Vouchers")}</Text>
                    </HStack>
                </HStack> */}
                <ScrollView>
                    <Box padding="5">
                        <Box>
                            {dataFound == "notfound" && (
                                <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                            )}
                            {dataFound == "found" && (
                                <VStack space={3}>
                                    {allVouchers.map((item, index) =>
                                        <Stack overflow={'hidden'} width={'100%'} position={'relative'}>
                                            <Box key={index} style={styles.productbox}>
                                                <HStack space="4">
                                                    <Box style={styles.productimage}>
                                                        <Image source={item.prod_img ? { uri: item.BaseUrl + item.prod_img } : require('../assets/images/noimage.png')} style={{ width: 100, height: 90 }} resizeMode='contain' />
                                                    </Box>
                                                    <VStack style={styles.productdetails} space="1">
                                                        <Text fontSize='sm' color={"#111111"} fontWeight="bold">{item.product_name}</Text>
                                                        <HStack space="2" alignItems="center">
                                                            <Text fontSize='xs'>{t("Order No")}:</Text>
                                                            <Text fontSize='sm' fontWeight="medium">{item.order_id}</Text>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <VStack width={'100%'} space="1" marginTop={3}>
                                                    {filterStatus == "Gift" ?
                                                        <Stack>
                                                            <HStack space="2" alignItems="center">
                                                                <Text fontSize='xs'>{t("Code")}:</Text>
                                                                {item.is_code_visible ?
                                                                    <Text fontSize='sm' fontWeight="medium"> {item.sku_code}</Text>
                                                                    :
                                                                    <Text fontSize='sm' fontWeight="medium">{item.locked_code}</Text>
                                                                }
                                                            </HStack>
                                                            {!item.is_code_visible && (
                                                                <Button size="sm" width={100} variant="link" padding={1} marginTop={2} backgroundColor={"#eeeeee"} _text={{ color: colorTheme.normal, fontWeight: 'bold', fontSize: 14 }} onPress={() => unlockVoucher(item)}>{t("Unlock Now")}</Button>
                                                            )}
                                                            {item.is_code_visible && (
                                                                <View>
                                                                    <HStack space="2" alignItems="center">
                                                                        <Text fontSize='xs'>{t("Pin")}:</Text>
                                                                        <Text fontSize='sm' fontWeight="medium">{item.activation_pin}</Text>
                                                                    </HStack>
                                                                    <HStack space="2" alignItems="center">
                                                                        <Text fontSize='xs'>{t("Validity")}:</Text>
                                                                        <Text fontSize='sm' fontWeight="medium">{item.sku_valid_till}</Text>
                                                                    </HStack>
                                                                </View>
                                                            )}
                                                        </Stack>
                                                        :
                                                        <Stack>
                                                            <HStack space="2" alignItems="center">
                                                                <Text fontSize='xs'>{t("Validity")}:</Text>
                                                                <Text fontSize='sm' fontWeight="medium">{item.sku_valid_till}</Text>
                                                            </HStack>
                                                            <Button size="sm" width={120} variant="link" padding={1} marginTop={2} backgroundColor={"#eeeeee"} _text={{ color: colorTheme.normal, fontWeight: 'bold', fontSize: 14 }} onPress={() => openDownloadPdf(item.BaseUrl + item.pdf_file)}>{t("Download Now")}</Button>
                                                        </Stack>
                                                    }
                                                </VStack>
                                            </Box>
                                            <Image source={require('../assets/images/zigzag.png')} style={{ width: '100%', height: 15, marginTop: -5, resizeMode: 'stretch' }} />
                                        </Stack>
                                    )}
                                </VStack>
                            )}
                        </Box>
                    </Box>
                </ScrollView>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
            {pop && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Box style={styles.productbox}>

                            <Stack space={3} padding={5}>
                                <HStack justifyContent={'space-between'} marginBottom={5}>
                                    <Text color="#444444" fontSize="md" fontWeight="bold">{t("OTP Verification")}</Text>
                                    <TouchableOpacity onPress={() => onCancel()}>
                                        <Icon name="close-outline" size={28} color="#666666" />
                                    </TouchableOpacity>
                                </HStack>

                                <OtpInput numberOfDigits={6} ref={otpRef} onTextChange={(text) => setOtp(text)} onFilled={(text) => Keyboard.dismiss()} theme={{
                                    filledPinCodeContainerStyle: { borderColor: '#928FA6B2' },
                                    pinCodeTextStyle: { color: '#000000' }
                                }} />
                                {/* <View style={styles.inputbox}>
                                    <Input size="lg" onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                </View> */}
                                <HStack space={2} marginTop="4" flexWrap={'wrap'} justifyContent={'center'}>
                                    <Checkbox shadow={2} onChange={() => setTermsCheck(!termsCheck)} accessibilityLabel="Checkbox">
                                        {t("I accept the terms & conditions")}
                                    </Checkbox>
                                    <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => setIsOpen(!isOpen)}>
                                        <Text color="#f04e23" fontSize="xs" fontWeight="medium" textAlign="center">{t("Read Terms & Condition")}</Text>
                                    </TouchableOpacity>
                                </HStack>
                            </Stack>
                            <HStack space={1} alignItems="center" justifyContent="space-evenly" overflow="hidden" mt="6" paddingX={5}>
                                <TouchableOpacity onPress={() => sendOtp()} style={{ width: '45%' }}>
                                    <Text color={colorTheme.normal} fontSize="md">{t("Resend OTP")}?</Text>
                                </TouchableOpacity>
                                <Button size="md" style={{ backgroundColor: colorTheme.dark, width: '55%', borderRadius: 8, overflow: 'hidden' }} onPress={() => onVerify()}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Verify")}</Text>
                                </Button>
                            </HStack>
                        </Box>
                    </VStack>
                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.spincontainer}>
                        <LinearGradient
                            colors={['#ffffff', "#cccccc"]}
                            start={{ x: 0.5, y: 0 }}
                            style={{ width: 300, borderRadius: 15, overflow: 'hidden' }}
                        >
                            <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                                <Stack space={3} alignItems="center">
                                    <Text color={colorTheme.dark} fontSize="lg" fontWeight="bold">{t("OTP Verification")}</Text>
                                    <Text color="#444444" paddingX="5" fontSize="sm" mb={4} textAlign="center">{t("Please Enter OTP and click Verify to Unlock Voucher")}</Text>
                                    <View style={styles.inputbox}>
                                        <Input size="lg" width={'100%'} onChangeText={(text) => setOtp(text)} keyboardType='number-pad' maxLength={6} variant="unstyled" InputLeftElement={<Icon name="key-outline" size={20} color="#f04e23" style={{ width: 25, marginLeft: 10, textAlign: 'center' }} />} placeholder={t("Enter OTP") + " *"} />
                                    </View>
                                    <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => sendOtp(itemDetails)}>
                                        <Text color="#f04e23" fontSize="md" fontWeight="bold" textAlign="center">{t("Resend OTP")}?</Text>
                                    </TouchableOpacity>
                                    <Stack space={2} marginTop="4">
                                        <Checkbox shadow={2} onChange={() => setTermsCheck(!termsCheck)} accessibilityLabel="Checkbox">
                                            {t("I accept the terms & conditions")}
                                        </Checkbox>
                                        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => navigation.navigate("TermsConditions")}>
                                            <Text color="#f04e23" fontSize="sm" fontWeight="medium" textAlign="center">{t("Read Terms & Condition")}</Text>
                                        </TouchableOpacity>
                                    </Stack>
                                </Stack>
                                <HStack space={1} alignItems="center" justifyContent="space-evenly" overflow="hidden" marginTop={8}>
                                    <Button size="sm" style={{ backgroundColor: '#999999', width: '28%', borderRadius: 30, overflow: 'hidden' }} onPress={() => onCancel()}>
                                        <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Close")}</Text>
                                    </Button>
                                    <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: '65%', borderRadius: 30, overflow: 'hidden' }} onPress={() => onVerify()}>
                                        <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Verify")}</Text>
                                    </Button>
                                </HStack>
                            </VStack>
                        </LinearGradient>
                    </View>
                </TouchableWithoutFeedback> */}
                </TouchableWithoutFeedback>

            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    inputbox: { backgroundColor: '#ffffff', borderRadius: 6, width: '100%', overflow: 'hidden', marginVertical: 0, borderColor: '#cccccc', borderWidth: 1 },
    custbtn: { borderRadius: 6, marginTop: 10 },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 6, width: '38%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
    productbox: { borderTopLeftRadius: 10, borderTopRightRadius: 10, width: '100%', backgroundColor: '#ffffff', padding: 15, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }
});

export default GiftVouchersScreen;