import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Avatar, Box, HStack, NativeBaseProvider, Stack, Text, Toast, VStack, useDisclose } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';

const PerformanceUpdateScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [performanceDetails, setPerformanceDetails] = React.useState("");
    const [allSales, setAllSales] = React.useState([]);

    const [saleInfo, setsaleInfo] = React.useState("");

    const [tierImage, setTierImage] = React.useState("");

    const openClose = (type) => {
        setsaleInfo(type);
    }

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
                    .post(`${BASE_URL}/show_performance`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("show_performance:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setTierImage(JSON.parse(val).BaseUrl + responseJson.data.tier_badge);
                            setPerformanceDetails(responseJson.data);
                            setAllSales(responseJson.data.sales);
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
                        console.log("show_performance Error:", error);
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
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Performance Update")}
                colorTheme={colorTheme}
            />
            <Box flex={1} bg={"#F1F1F1"}>
                <ScrollView>
                    <Box padding="5">
                        <Image source={{ uri: tierImage }} style={{ width: 55, height: 70, resizeMode: 'contain', alignSelf: 'center', position: 'relative', zIndex: 9 }} />
                        <VStack marginBottom={5} marginTop={-38} backgroundColor={'#ffffff'} p={3} paddingTop={10} borderRadius={10} overflow={'hidden'}>
                            <Text color="#666666" fontSize="sm" textAlign="center" fontWeight="medium">{performanceDetails.eligibility_tier}</Text>
                            <Text color={colorTheme.dark} fontSize="xs" textAlign="center" fontWeight="medium" textTransform="capitalize">{performanceDetails.balance_quantity}</Text>
                            <VStack marginY={2}>
                                <HStack alignItems={'center'} justifyContent={'center'} space={2}>
                                    <Image source={require('../assets/images/target.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                    <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium">{performanceDetails.retain_tier_name}</Text>
                                    <Text color={"#111111"} fontSize="xl" textAlign="center" fontWeight="bold">{performanceDetails.retentionSaleVolExcess}</Text>
                                </HStack>
                                <HStack alignItems={'center'} justifyContent={'center'} space={2}>
                                    <Image source={require('../assets/images/target.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
                                    <Text color="#666666" fontSize="xs" textAlign="center" fontWeight="medium">{performanceDetails.qualify_tier_name}</Text>
                                    <Text color={"#111111"} fontSize="xl" textAlign="center" fontWeight="bold">{performanceDetails.upgradationSaleVolExcess}</Text>
                                </HStack>
                            </VStack>
                            <Text color="#ff0000" fontSize="xs" textAlign="center">**All Values are in Metric Tonnes (MT)</Text>
                        </VStack>
                        <VStack space={3}>
                            {allSales.map((item, index) =>
                                <VStack key={index} backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'}>
                                    <TouchableOpacity onPress={() => openClose(index)}>
                                        <HStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'} paddingY={2} paddingX={5} justifyContent={'space-between'}>
                                            <Text color="#111111" fontSize="sm" fontWeight="bold">{item.month_name}</Text>
                                            {index == saleInfo ? <Icon name="remove" size={25} color="#111111" /> : <Icon name="add" size={25} color="#111111" />}
                                        </HStack>
                                    </TouchableOpacity>
                                    {index == saleInfo && (
                                        <Stack>
                                            <VStack style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#eeeeee', borderTopWidth: 1 }}>
                                                <VStack space={2}>
                                                    <VStack justifyContent={"space-between"} style={{ paddingHorizontal: 5, paddingVertical: 5, textAlign: 'center', flexWrap: 'wrap', width: '100%' }}>
                                                        {item.sale_details.map((subitem, subindex) =>
                                                            <HStack space={2} alignItems="center">
                                                                <Text color="#707274" fontSize="xs" textAlign="center" fontWeight="medium">{subitem.product_name}:</Text>
                                                                <Text color="#707274" fontSize="xs" textAlign="center" textTransform="uppercase">{subitem.tonnage_sold} MT</Text>
                                                            </HStack>
                                                        )}
                                                    </VStack>
                                                </VStack>
                                            </VStack>
                                            <HStack space={2} backgroundColor={colorTheme.normal} alignItems="center" style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
                                                <Text color="#ffffff" fontSize="sm" textAlign="center" fontWeight="medium">{t("Grand Total")}:</Text>
                                                <Text color="#ffffff" fontSize="sm" textAlign="center" textTransform="uppercase">{item.total_sales} MT</Text>
                                            </HStack>
                                        </Stack>
                                    )}
                                </VStack>
                            )}
                        </VStack>
                    </Box>
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
    avatar: { elevation: 10, marginVertical: 20, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, borderColor: "#ffffff", borderWidth: 4, backgroundColor: '#ffffff' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default PerformanceUpdateScreen;
