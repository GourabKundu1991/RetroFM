import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack, Select } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { AccessToken, API_KEY, BASE_URL, OS_TYPE } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';

const CartScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [dataFound, setDataFound] = React.useState("");

    const [allCart, setAllCart] = React.useState([]);
    const [controls, setControls] = React.useState("");

    const [isPending, setIsPending] = React.useState(false);
    const [isKYC, setIsKYC] = React.useState(false);

    const [prodId, setProdId] = React.useState("");
    const [vendorPop, setVendorPop] = React.useState(false);
    const [stateList, setStateList] = React.useState([]);
    const [state, setState] = React.useState("");
    const [cityList, setCityList] = React.useState([]);
    const [city, setCity] = React.useState("");
    const [vendorList, setVendorList] = React.useState([]);
    const [vendor, setVendor] = React.useState("");

    const [addeditbutton, setAddEditButton] = React.useState("Add Vendor");

    const [successOrder, setSuccessOrder] = React.useState(false);

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

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/mycart`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("My Cart:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setAllCart(responseJson.data.row_items);
                            setControls(responseJson.data.control);
                            setDataFound("found");
                            if (responseJson.data.is_approved == 2) {
                                setIsKYC(true);
                            } else if (responseJson.data.is_approved == 0) {
                                setIsPending(true);
                            }
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setAllCart([]);
                            setDataFound("notfound");
                            setControls("");
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.message == "Session is expired") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("My Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const updateKYC = () => {
        navigation.navigate('UpdateKYC');
    }

    const updateQty = (qty, cartId, productId) => {
        if (qty < 1) {
            Toast.show({ description: t("Quantity must be minimun 1. If you want to remove from cart please click on Trash Icon.") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("cart_id", cartId);
                    formdata.append("product_id", productId);
                    formdata.append("quantity", qty);
                    apiClient
                        .post(`${BASE_URL}/save_quantity`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                            //console.log("update Cart:", responseJson.data);
                            if (responseJson.data.bstatus == 1) {
                                Toast.show({ description: responseJson.data.message });
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
                            //console.log("Update Cart Error:", error);
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

    const removeCart = (cartId, productId) => {
        Alert.alert(
            t("Warning"),
            t("Do you want to Remove Item from cart") + "?",
            [
                { text: t("Cancel"), onPress: () => { return null } },
                {
                    text: t("Yes"), onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                let formdata = new FormData();
                                formdata.append("APIkey", `${API_KEY}`);
                                formdata.append("orgId", JSON.parse(val).org_id);
                                formdata.append("cart_id", cartId);
                                formdata.append("product_id", productId);
                                apiClient
                                    .post(`${BASE_URL}/removecart`, formdata, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                            accesstoken: `${AccessToken}`,
                                            useraccesstoken: JSON.parse(val).token
                                        },
                                    }).then(response => {
                                        return response;
                                    })
                                    .then((responseJson) => {
                                        //console.log("Remove Cart:", responseJson.data);
                                        getAllData();
                                    })
                                    .catch((error) => {
                                        setLoading(false);
                                        //console.log("Remove Cart Error:", error);
                                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                    });
                            } else {
                                setLoading(false);
                                AsyncStorage.clear();
                                navigation.navigate('Welcome');
                            }
                        });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    const goAddress = () => {
        if (controls.is_voucher == 1) {
            navigation.navigate('Address', { cartId: controls.cart_id });
        } else {
            setLoading(true);
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
                                onPlaceOrder(controls.cart_id, responseJson.data.address.permanent_address.add_id);
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
    }

    const onPlaceOrder = (cartId, addressId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("cartId", cartId);
                formdata.append("address_id", addressId);
                formdata.append("referece_address_table", 'dcm_addresses');
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
                        //console.log("Order Placed Error:", error);
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

    const openVendor = (proId) => {
        setAddEditButton("Add Vendor");
        setVendorPop(true);
        setLoading(true);
        setProdId(proId);
        getStateData();
    }

    const getStateData = () => {
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
                            setLoading(false);
                            setStateList(responseJson.data.state_list);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setStateList([]);
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

    const onSelectState = (val) => {
        setState(val);
        setLoading(true);
        getCityData(val);
        setCity("");
        setVendor("");
    }

    const getCityData = (stateId) => {
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
                    }).then((responseJson) => {
                        console.log("GetCityWithStateIDList:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setCityList(responseJson.data.city_list);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setCityList([]);
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

    const onSelectCity = (val) => {
        setCity(val);
        setLoading(true);
        getVendorData(val, state, prodId);
        setVendor("");
    }

    const getVendorData = (cityId, stateId, proId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("os_type", `${OS_TYPE}`);
                formdata.append("state_id", stateId);
                formdata.append("city_id", cityId);
                formdata.append("product_id", proId);
                apiClient
                    .post(`${BASE_URL}/VendorDetailsBybrand`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("VendorDetailsBybrand:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setVendorList(responseJson.data.city_list);
                        } else {
                            Toast.show({ description: responseJson.message });
                            setVendorList([]);
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.message == "Session is expired") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("VendorDetailsBybrand Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const addVendor = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("cart_id", controls.cart_id);
                formdata.append("vendor_id", vendor);
                formdata.append("product_id", prodId);
                apiClient
                    .post(`${BASE_URL}/AddVendorDetailsCart`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("AddVendorDetailsCart:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Toast.show({ description: responseJson.data.message });
                            setVendorPop(false);
                            getAllData();
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
                        //console.log("AddVendorDetailsCart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onEditVendor = (itemVal) => {
        setAddEditButton("Edit Vendor");
        setLoading(true);
        setVendorPop(true);
        setProdId(itemVal.product_id);
        getStateData();
        setState(Number(itemVal.vendor_details.dcm_state_id));
        getCityData(itemVal.vendor_details.dcm_state_id);
        setCity(Number(itemVal.vendor_details.dcm_city_id));
        getVendorData(itemVal.vendor_details.dcm_city_id, itemVal.vendor_details.dcm_state_id, itemVal.product_id);
        setVendor(itemVal.vendor_id);
    }

    const onClose = () => {
        setVendorPop(false);
        setState("");
        setCity("");
        setVendor("");
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("My Cart")}
                colorTheme={colorTheme}
            />
            <Box px={4} flex={1} bg={"#F1F1F1"}>
                <ScrollView>
                    <Box>
                        {dataFound == "notfound" ?
                            <Stack space={5} style={[styles.productbox, { height: 350, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                <Icon name="hourglass-outline" size={80} color="#999999" />
                                <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                            </Stack>
                            :
                            <VStack>
                                {allCart.map((item, index) =>
                                    <Box key={index} mt={index == 0 ? 4 : 0} style={styles.productbox}>
                                        <HStack width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
                                            <Box borderRadius={10} overflow={'hidden'} alignItems={'center'} justifyContent={'center'} bgColor={'#EEEEEE'} width={'25%'} height={110}>
                                                <Image
                                                    source={item.product_image == "" ? require('../assets/images/noimage.png') : { uri: item.BaseUrl + item.product_image }}
                                                    style={{ width: 60, height: 60, resizeMode: 'contain' }}
                                                />
                                            </Box>
                                            <VStack width={'70%'}>
                                                <Text color={'#707274'} fontSize={'xs'} width={'90%'}>{item.product_name}</Text>
                                                <Text fontWeight={'bold'} fontSize={'lg'} width={'90%'}>{item.price_in_points} {t("points")}</Text>
                                                <HStack width={'100%'} mt={2} justifyContent={'space-between'} alignItems={'center'}>
                                                    <HStack py={1} borderRadius={5} alignItems={'center'} borderWidth={1} borderColor={'gray.400'}>
                                                        <Text onPress={() => updateQty(Number(item.quantity) - 1, item.cart_id, item.product_id)} width={7} textAlign={'center'} fontSize={'md'} fontWeight={'extrabold'} borderColor={'gray.400'} borderRightWidth={1}>-</Text>
                                                        <Text width={12} textAlign={'center'} fontSize={'md'} fontWeight={'bold'} borderColor={'gray.400'} borderRightWidth={1}>{item.quantity}</Text>
                                                        <Text onPress={() => updateQty(Number(item.quantity) + 1, item.cart_id, item.product_id)} width={7} textAlign={'center'} fontSize={'md'} fontWeight={'extrabold'}>+</Text>
                                                    </HStack>
                                                    <TouchableOpacity activeOpacity={0.5} onPress={() => removeCart(item.cart_id, item.product_id)}>
                                                        <Icon name="trash-outline" size={21} color="#f04e23" />
                                                    </TouchableOpacity>
                                                </HStack>
                                            </VStack>
                                        </HStack>
                                        {item.is_vehicle_voucher == 1 && item.vendor_details.length == 0 && (
                                            <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: '100%', borderRadius: 8, overflow: 'hidden' }} marginTop={5} onPress={() => openVendor(item.product_id)}>
                                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Add Vendor Details")}</Text>
                                            </Button>
                                        )}
                                        {item.is_vehicle_voucher == 1 && item.vendor_details.length != 0 && (
                                            <View style={{ marginTop: 20, borderColor: '#cccccc', borderWidth: 1, backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden' }}>
                                                <HStack justifyContent={'space-between'} alignItems={'center'}>
                                                    <Text padding={2} fontSize='md' fontWeight="medium" color={colorTheme.dark}>{t("Vendor Details")}</Text>
                                                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#cccccc' }} onPress={() => onEditVendor(item)}>
                                                        <Icon name="create-outline" size={22} color="#000000" />
                                                    </TouchableOpacity>
                                                </HStack>
                                                <VStack space={1} paddingY={2} paddingX={5}>
                                                    <HStack space={2} alignItems={'center'}>
                                                        <Icon name="business-sharp" size={20} color={'#111111'} />
                                                        <Text fontSize='sm'>{item.vendor_details.firm_name}</Text>
                                                    </HStack>
                                                    <HStack space={2} alignItems={'center'}>
                                                        <Icon name="location-sharp" size={20} color={'#111111'} />
                                                        <Stack>
                                                            <Text fontSize='sm'>{item.vendor_details.full_address}</Text>
                                                            <Text fontSize='sm'>{item.vendor_details.city_name}, {item.vendor_details.state_name}</Text>
                                                        </Stack>
                                                    </HStack>
                                                    <HStack space={2} alignItems={'center'}>
                                                        <Icon name="call-sharp" size={20} color={'#111111'} />
                                                        <Text fontSize='sm'>{item.vendor_details.phone_number}</Text>
                                                    </HStack>
                                                </VStack>
                                            </View>
                                        )}
                                    </Box>
                                )}
                                {controls != "" && (
                                    <VStack>
                                        <Box my={2} p={4} borderRadius={10} bgColor={'white'} width={'100%'} borderWidth={1} borderColor={'#EEEEEE'} style={{ elevation: 4 }}>
                                            <HStack justifyContent={'space-between'}>
                                                <VStack>
                                                    <Text fontSize="md" fontWeight="medium">{t("Grand Total")}</Text>
                                                    <HStack space={2} alignItems="center">
                                                        <Text color={colorTheme?.dark} fontSize="2xl" fontWeight="bold">{controls.grandtotal_in_point}</Text>
                                                        <Text color={'gray.400'} fontSize="md" fontWeight="bold">{t("Points")}</Text>
                                                    </HStack>
                                                </VStack>
                                                <Image source={require('../assets/images/star.png')} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                                            </HStack>
                                        </Box>
                                    </VStack>
                                )}
                            </VStack>
                        }
                    </Box>

                </ScrollView>
                {controls != "" && (
                    <VStack paddingY={4} >
                        <Button onPress={() => goAddress()} alignSelf={'flex-end'} width={'100%'} borderRadius={8} overflow={'hidden'} height={50} bgColor={colorTheme?.normal}>
                            <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Place Order")}</Text>
                        </Button>
                    </VStack>
                )}
            </Box>
            <BottomTabs
                selected={2}
                colorTheme={colorTheme}
            />
            {isPending && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', "#cccccc"]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 10, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="hourglass-outline" size={100} color={colorTheme.dark}></Icon>
                            <Text mt={8} mb={5} fontSize="2xl" fontWeight="bold" color="#111111">{t("Pending")}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your Ekyc verification is under process. You can proceed once the verification process is completed.")}.</Text>
                            <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: 180, borderRadius: 8, overflow: 'hidden' }} onPress={() => navigation.goBack()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Back")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {isKYC && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', "#cccccc"]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 10, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="10" alignItems="center" justifyContent="center">
                            <Icon name="warning-outline" size={100} color={colorTheme.dark}></Icon>
                            <Text mt={8} mb={5} fontSize="2xl" fontWeight="bold" color="#111111">{t("Warning")}</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your E-KYC Rejected / Not verified. Please click on Update to continue.")}.</Text>
                            <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: 180, borderRadius: 8, overflow: 'hidden' }} onPress={() => updateKYC()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Update")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {vendorPop && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={['#ffffff', "#cccccc"]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 10, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" padding={4} alignItems="center" justifyContent="center">
                            <Text mb={5} width={'100%'} borderColor={'#cccccc'} borderBottomWidth={1} pb={2} textAlign={'center'} fontSize="lg" fontWeight="bold" color="#111111">{t("Vendor Details")}</Text>
                            <VStack space={3} width={'100%'}>
                                <View style={styles.inputbox}>
                                    <Select variant="none" size="md"
                                        InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                        selectedValue={state}
                                        onValueChange={value => onSelectState(value)}
                                        placeholder={t("Select State")}
                                        style={{ paddingLeft: 20, height: 40 }}
                                        _selectedItem={{
                                            backgroundColor: '#eeeeee',
                                            endIcon: <Icon name="checkmark-circle" size={20} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                        }}>
                                        {stateList.map((item, index) =>
                                            <Select.Item key={index} label={item.state_name} value={item.state_id} />
                                        )}
                                    </Select>
                                </View>
                                {state != "" && (
                                    <View style={styles.inputbox}>
                                        <Select variant="none" size="md"
                                            InputLeftElement={<Icon name="location-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                            selectedValue={city}
                                            onValueChange={value => onSelectCity(value)}
                                            placeholder={t("Select City")}
                                            style={{ paddingLeft: 20, height: 40 }}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={20} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {cityList.map((item, index) =>
                                                <Select.Item key={index} label={item.city_name} value={item.city_id} />
                                            )}
                                        </Select>
                                    </View>
                                )}
                                {city != "" && (
                                    <View style={styles.inputbox}>
                                        <Select variant="none" size="md"
                                            InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                            selectedValue={vendor}
                                            onValueChange={value => setVendor(value)}
                                            placeholder={t("Select Vendor")}
                                            style={{ paddingLeft: 20, height: 40 }}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={20} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {vendorList.map((item, index) =>
                                                <Select.Item key={index} label={item.firm_name} value={item.vendor_id} />
                                            )}
                                        </Select>
                                    </View>
                                )}
                            </VStack>
                            <Button disabled={vendor == ""} size="sm" style={{ backgroundColor: colorTheme.dark, width: '100%', borderRadius: 8, overflow: 'hidden', opacity: vendor != "" ? 1 : 0.5 }} onPress={() => addVendor()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{addeditbutton}</Text>
                            </Button>
                            <Button size="sm" style={{ backgroundColor: '#999999', width: 100, borderRadius: 8, overflow: 'hidden' }} onPress={() => onClose()} marginY={2}>
                                <Text color="#ffffff" fontSize="xs" fontWeight="medium">{t("Close")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
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
    inputbox: { backgroundColor: '#ffffff', borderRadius: 8, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    solidBtn: { width: '48%', borderWidth: 2, borderRadius: 10, overflow: 'hidden' },
    productbox: {
        borderRadius: 10,
        width: '100%',
        marginBottom: '3%',
        backgroundColor: '#ffffff',
        padding: 15,
        borderColor: '#eeeeee',
        // borderColor:'grey',
        borderWidth: 1,
        overflow: 'hidden',
        alignSelf: 'center',
        elevation: 2
    },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '38%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    productdetails: { width: '58%' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default CartScreen;
