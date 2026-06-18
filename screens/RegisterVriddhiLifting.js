import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, Input, NativeBaseProvider, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import apiClient from '../api/apiClient';

const RegisterVriddhiLiftingScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [openFor, setOpenFor] = React.useState("");
    const [productType, setProductType] = React.useState([]);
    const [type, setType] = React.useState("");
    const [productList, setProductList] = React.useState([]);
    const [product, setProduct] = React.useState("");
    const [dealerList, setDealerList] = React.useState([]);
    const [dealer, setDealer] = React.useState("");
    const [quantity, setQuantity] = React.useState("");
    const [searchDealer, setSearchDealer] = React.useState("");
    const [searchTerm, setSearchTerm] = React.useState("");

    const [pageFor, setPageFor] = React.useState("Registration");

    const [totalApprove, setTotalApprove] = React.useState("");
    const [saleList, setSaleList] = React.useState([]);

    const [isWindow, setIsWindow] = React.useState(true);

    const [newQuantity, setNewQuantity] = React.useState(true);

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
                    .post(`${BASE_URL}/default_value_for_vriddhi_sales_revamp`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("default_value_for_vriddhi_sales_revamp:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setIsWindow(true);
                            setProductType(responseJson.data.group);
                            setOpenFor(responseJson.data.open_for);
                            getDealer();
                        } else {
                            setIsWindow(false);
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
                        //console.log("default_value_for_vriddhi_sales_revamp Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onSelectProductType = (val) => {
        setType(val.group);
        setProductList(val.list);
        setProduct("");
    }

    const getDealer = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/influencer_dropdown`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("influencer_dropdown:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setDealerList(responseJson.data.dealer_list);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setDealerList([]);
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
                        //console.log("influencer_dropdown Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onSearchDealer = () => {
        setSearchDealer(searchTerm);
        setLoading(true);
        if (searchTerm.trim() == "") {
            getDealer();
        } else {
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    formdata.append("keyword", searchTerm);
                    apiClient
                        .post(`${BASE_URL}/influencer_listing_by_dealer_state_id`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                            console.log("influencer_listing_by_dealer_state_id:", responseJson.data);
                            if (responseJson.data.bstatus == 1) {
                                setLoading(false);
                                setDealerList(responseJson.data.dealer_list);
                            } else {
                                setDealerList([]);
                                Toast.show({ description: responseJson.data.message });
                                setLoading(false);
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.log("influencer_listing_by_dealer_state_id Error:", error);
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

    const saleRegister = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("product_id", product);
                formdata.append("saleInfluencer", dealer);
                formdata.append("quantity", quantity);
                console.log("formdata: ", formdata);
                console.log("token: ", JSON.parse(val).token);
                apiClient
                        .post(`${BASE_URL}/vriddhi_sales_registration`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                        console.log("vriddhi_sales_registration:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                navigation.goBack();
                            }, 1000);
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
                        console.log("vriddhi_sales_registration Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const selectPage = (valPage) => {
        setPageFor(valPage);
        setType("");
        setProduct("");
        setDealer("");
        setQuantity("");
        setSearchDealer("");
        setTotalApprove("");
    }

    const onSearchList = () => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("product_id", product);
                apiClient
                        .post(`${BASE_URL}/vriddhi_sale_listing`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                        console.log("vriddhi_sale_listing:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setTotalApprove(responseJson.data.total_approve_variable);
                            setSaleList(responseJson.data.vriddhi_sale_listing);
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTotalApprove("");
                            setSaleList([]);
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
                        //console.log("vriddhi_sale_listing Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onConfirm = (val) => {
        Alert.alert(
            t("Confirm Sale") + "!",
            t("Are you sure you want to confirm") + "?",
            [
                {
                    text: t("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: t("Yes"), onPress: () => {
                        setLoading(true);
                        saleConfirm(val);
                    }
                }
            ],
            { cancelable: false }
        );
    }

    const saleConfirm = (itemvalue) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("prod_sel", itemvalue.pro_master_id);
                formdata.append("quantity_sold", newQuantity);
                formdata.append("contact_id", itemvalue.contact_id);
                formdata.append("actn", "accept");
                console.log(formdata);
                apiClient
                        .post(`${BASE_URL}/sale_approval_by_capping_vriddhi_sales`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                        console.log("vriddhi_sale_listing:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setNewQuantity("");
                            setLoading(false);
                            Toast.show({ description: responseJson.data.message });
                            onSearchList();
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
                        console.log("vriddhi_sale_listing Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <Box flex={1} bg={"#f1f1f1"}>
                <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Register Unnati Lifting")}</Text>
                    </HStack>
                </HStack>
                <HStack alignItems="center" justifyContent="space-evenly" backgroundColor={colorTheme.normal} paddingX={3} paddingY={1}>
                    <Button size="sm" borderRadius={0} variant="link" borderColor={pageFor == "Registration" ? '#ffffff' : colorTheme.normal} borderBottomWidth={2} _text={{ color: pageFor == "Registration" ? "#ffffff" : "#dddddd", fontWeight: 'bold', fontSize: 12 }} onPress={() => selectPage("Registration")}>{t("Registration")}</Button>
                    <Button size="sm" borderRadius={0} variant="link" borderColor={pageFor == "SaleList" ? '#ffffff' : colorTheme.normal} borderBottomWidth={2} _text={{ color: pageFor == "SaleList" ? "#ffffff" : "#dddddd", fontWeight: 'medium', fontSize: 12 }} onPress={() => selectPage("SaleList")}>{t("Sale List")}</Button>
                </HStack>
                <ScrollView>
                    {!isWindow ?
                        <Box padding={5}>
                            <Box style={styles.productbox} marginY={10}>
                                <VStack alignItems="center" w="100%" padding={2}>
                                    <Text color={colorTheme.dark} fontSize="md" textAlign="center" fontWeight="bold">{openFor}</Text>
                                </VStack>
                            </Box>
                        </Box>
                        :
                        <Box padding={5}>
                            {pageFor == "Registration" && (
                                <View>
                                    <Box style={styles.productbox} marginBottom={5}>
                                        <VStack alignItems="center" w="100%" padding={2}>
                                            <Text color={colorTheme.dark} fontSize="md" textAlign="center" fontWeight="bold">{openFor}</Text>
                                        </VStack>
                                    </Box>
                                    <VStack space={3} style={[styles.productbox, { marginBottom: 20, paddingHorizontal: 20 }]}>
                                        <VStack space={2}>
                                            <Text fontSize='sm' color={"#111111"}>{t("Type")}</Text>
                                            <View style={styles.inputbox}>
                                                <Select variant="none" size="md"
                                                    placeholder={type == "" ? t("Select Type") : type}
                                                    placeholderTextColor={type == "" ? "#999999" : "#111111"}
                                                    InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                                    selectedValue={type}
                                                    onValueChange={value => onSelectProductType(value)}
                                                    style={{ paddingLeft: 20, height: 45 }}
                                                    _selectedItem={{
                                                        backgroundColor: '#eeeeee',
                                                        endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                    }}>
                                                    {productType.map((item, index) =>
                                                        <Select.Item key={index} label={item.group} value={item} />
                                                    )}
                                                </Select>
                                            </View>
                                        </VStack>
                                        {type != "" && (
                                            <VStack space={2}>
                                                <Text fontSize='sm' color={"#111111"}>{t("Product")}</Text>
                                                <View style={styles.inputbox}>
                                                    <Select variant="none" size="md"
                                                        placeholder={t("Select Product")}
                                                        InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                                        selectedValue={product}
                                                        onValueChange={value => setProduct(value)}
                                                        style={{ paddingLeft: 20, height: 45 }}
                                                        _selectedItem={{
                                                            backgroundColor: '#eeeeee',
                                                            endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                        }}>
                                                        {productList.map((item, index) =>
                                                            <Select.Item key={index} label={item.product_name} value={item.product_Id} />
                                                        )}
                                                    </Select>
                                                </View>
                                            </VStack>
                                        )}
                                        <VStack space={2}>
                                            <Text fontSize='sm' color={"#111111"}>{t("Quantity")}</Text>
                                            <View style={styles.inputbox}>
                                                <Input size="md" onChangeText={(text) => setQuantity(text)} variant="unstyled" InputLeftElement={<Icon name="keypad-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 15, textAlign: 'center' }} />} placeholder={t("Product Quantity")} />
                                            </View>
                                        </VStack>
                                        {searchDealer == "" && (
                                            <VStack space={2}>
                                                <Text fontSize='sm' color={"#111111"}>{t("Influencer")}</Text>
                                                <View style={styles.inputbox}>
                                                    <Select variant="none" size="md"
                                                        placeholder={t("Select Influencer")}
                                                        InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                                        selectedValue={dealer}
                                                        onValueChange={value => setDealer(value)}
                                                        style={{ paddingLeft: 20, height: 45 }}
                                                        _selectedItem={{
                                                            backgroundColor: '#eeeeee',
                                                            endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                        }}>
                                                        {dealerList.map((item, index) =>
                                                            <Select.Item key={index} label={item.value} value={item.id} />
                                                        )}
                                                    </Select>
                                                </View>
                                            </VStack>
                                        )}
                                        <VStack space={2}>
                                            <Text fontSize='sm' color={"#111111"}>{t("Influencer")}</Text>
                                            <View style={styles.inputbox}>
                                                <Input size="md" onChangeText={(text) => setSearchTerm(text)} variant="unstyled" InputLeftElement={<Icon name="person-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 15, textAlign: 'center' }} />} InputRightElement={<Button onPress={() => onSearchDealer()} backgroundColor={"#111111"}><Text fontSize='sm' color={"#ffffff"}>{t("Search")}</Text></Button>} placeholder={t("Search Influencer")} />
                                            </View>
                                        </VStack>
                                        {searchDealer != "" && (
                                            <VStack space={2} style={[styles.productbox, { backgroundColor: "#ffffff" }]}>
                                                {dealerList.length == 0 && (
                                                    <VStack borderColor={"#cccccc"} borderWidth={1} borderRadius={12} alignItems="center" w="100%" padding={1}>
                                                        <Text color="#666666" fontSize="sm">
                                                            {t("--- Not Found ---")}

                                                        </Text>
                                                    </VStack>
                                                )}
                                                {dealerList.map((item, index) =>
                                                    <Pressable key={index} onPress={() => setDealer(item.id)}>
                                                        <VStack borderColor={dealer == item.id ? colorTheme.dark : "#cccccc"} backgroundColor={dealer == item.id ? colorTheme.light : "#ffffff"} borderWidth={1} borderRadius={12} alignItems="center" w="100%" padding={1}>
                                                            <Text color={colorTheme.dark} fontSize="md" fontWeight="bold">{item.value}</Text>
                                                            <Text color="#666666" fontSize="sm">{item.mobile}</Text>
                                                        </VStack>
                                                    </Pressable>
                                                )}
                                            </VStack>
                                        )}
                                    </VStack>
                                    <Button size="md" backgroundColor={colorTheme.normal} style={styles.custbtn} variant="link" _text={{ color: "#ffffff", fontWeight: 'medium', fontSize: 16 }} onPress={() => saleRegister()}>{t("Submit")}</Button>
                                </View>
                            )}
                            {pageFor == "SaleList" && (
                                <View>
                                    <VStack space={3} style={[styles.productbox, { marginBottom: 20, paddingHorizontal: 20 }]}>
                                        <VStack space={2}>
                                            <Text fontSize='sm' color={"#111111"}>{t("Type")}</Text>
                                            <View style={styles.inputbox}>
                                                <Select variant="none" size="md"
                                                    placeholder={type == "" ? t("Select Type") : type}
                                                    placeholderTextColor={type == "" ? "#999999" : "#111111"}
                                                    InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                                    selectedValue={type}
                                                    onValueChange={value => onSelectProductType(value)}
                                                    style={{ paddingLeft: 20, height: 45 }}
                                                    _selectedItem={{
                                                        backgroundColor: '#eeeeee',
                                                        endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                    }}>
                                                    {productType.map((item, index) =>
                                                        <Select.Item key={index} label={item.group} value={item} />
                                                    )}
                                                </Select>
                                            </View>
                                        </VStack>
                                        {type != "" && (
                                            <VStack space={2}>
                                                <Text fontSize='sm' color={"#111111"}>{t("Product")}</Text>
                                                <View style={styles.inputbox}>
                                                    <Select variant="none" size="md"
                                                        placeholder={t("Select Product")}
                                                        InputLeftElement={<Icon name="options-outline" size={20} color="#666666" style={{ marginLeft: 15 }} />}
                                                        selectedValue={product}
                                                        onValueChange={value => setProduct(value)}
                                                        style={{ paddingLeft: 20, height: 45 }}
                                                        _selectedItem={{
                                                            backgroundColor: '#eeeeee',
                                                            endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                                        }}>
                                                        {productList.map((item, index) =>
                                                            <Select.Item key={index} label={item.product_name} value={item.product_Id} />
                                                        )}
                                                    </Select>
                                                </View>
                                            </VStack>
                                        )}
                                        <Button size="md" backgroundColor={colorTheme.normal} style={styles.custbtn} variant="link" _text={{ color: "#ffffff", fontWeight: 'medium', fontSize: 16 }} onPress={() => onSearchList()}>{t("Search")}</Button>
                                    </VStack>
                                    {totalApprove != "" && (
                                        <Box style={styles.productbox} marginBottom={5}>
                                            <VStack alignItems="center" w="100%" padding={2}>
                                                <Text color={colorTheme.dark} fontSize="md" textAlign="center" fontWeight="bold">{totalApprove}</Text>
                                            </VStack>
                                        </Box>
                                    )}
                                    <Box style={[styles.productbox, { borderColor: colorTheme.light, padding: 0, backgroundColor: '#ffffff' }]}>
                                        <View style={{ padding: 12, backgroundColor: colorTheme.light }}>
                                            <Text color={colorTheme.dark} fontSize="md" textAlign="center" fontWeight="bold">{t("List of Registered Sale")}</Text>
                                        </View>
                                        {saleList.length == 0 ?
                                            <HStack padding="10" justifyContent="center">
                                                <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                            </HStack>
                                            :
                                            <VStack padding="4" space="3">
                                                {saleList.map((item, index) =>
                                                    <Box key={index} borderWidth="1" borderColor="#aaaaaa" borderRadius="10" overflow="hidden">
                                                        <VStack padding={3} space={1} borderTopRadius="10">
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("ID")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.ID}</Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Name")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.Contact_Name}</Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Phone")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.ph_number}</Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Product")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.Product}</Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Claimed Quantity")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.claimed_quantity} <Text fontSize='xs' color="#111111" fontWeight="medium">{item.real_unit_name}</Text></Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Sold Quantity")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.Bags_Sold} <Text fontSize='xs' color="#111111" fontWeight="medium">{item.real_unit_name}</Text></Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Dealer")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.dealer_company}</Text>
                                                            </HStack>
                                                            <HStack alignItems="center" space={2}>
                                                                <Text fontSize='xs' color="#999999">{t("Date")}:</Text>
                                                                <Text fontSize='sm' color="#666666" fontWeight="medium">{item.Sale_Date}</Text>
                                                            </HStack>
                                                            {item.is_verified == 0 && item.has_exception == 0 && (
                                                                <VStack bg="#eeeeee" borderRadius={8} padding={2} overflow="hidden" marginTop={2}>
                                                                    <Text fontSize='sm' color="#111111" textAlign="center">
                                                                        {t("Quantity Sold in")} {item.unit_name}</Text>
                                                                    <HStack padding="2" justifyContent="space-between" alignItems="center">
                                                                        <View style={[styles.inputbox, { width: '69%' }]}>
                                                                            <Input size="sx" keyboardType='number-pad' height={35} onChangeText={(text) => setNewQuantity(text)} variant="unstyled" InputRightElement={<Stack height={35} justifyContent={'center'} paddingX={1} backgroundColor={"#999999"}><Text fontSize='sm' color={"#ffffff"}>{t("MT")}</Text></Stack>} placeholder={t("Enter Quantity")} />
                                                                        </View>
                                                                        <Button size="sx" height={35} borderRadius={6} style={{ width: '30%' }} backgroundColor={colorTheme.normal} variant="link" _text={{ color: "#ffffff", fontWeight: 'medium', fontSize: 14 }} onPress={() => onConfirm(item)}>{t("Confirm")}</Button>
                                                                    </HStack>
                                                                </VStack>
                                                            )}
                                                        </VStack>
                                                    </Box>
                                                )}
                                            </VStack>
                                        }
                                    </Box>
                                </View>
                            )}
                        </Box>
                    }
                </ScrollView>
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>

    )
}

const styles = StyleSheet.create({
    smallBtn: { width: '49%', borderRadius: 6 },
    productbox: { borderRadius: 10, backgroundColor: '#ffffff', padding: 15, overflow: 'hidden' },
    inputbox: { backgroundColor: '#ffffff', borderRadius: 6, width: '100%', overflow: 'hidden', borderColor: '#cccccc', borderWidth: 1 },
    custbtn: { width: '100%', borderRadius: 6, overflow: 'hidden', height: 48, marginTop: 10 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default RegisterVriddhiLiftingScreen;
