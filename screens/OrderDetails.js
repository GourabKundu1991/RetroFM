import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, StatusBar, View, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import apiClient from '../api/apiClient';

const OrderDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [details, setDetails] = useState("");

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
            setTimeout(function () {
                setLoading(false);
                setDetails(route.params.orderDetails);
            }, 1000);
        });
        return unsubscribe;
    }, [])

    const cancelOrder = () => {
        Alert.alert(
            t("Cancel Warning"),
            t("Do you want to Cancel this Order") + "?",
            [
                { text: 'Cancel', onPress: () => { return null } },
                {
                    text: 'Yes', onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                let formdata = new FormData();
                                formdata.append("APIkey", `${API_KEY}`);
                                formdata.append("orgId", JSON.parse(val).org_id);
                                formdata.append("orderId", details.orderId);
                                formdata.append("itemId", details.orderItemId);
                                formdata.append("status", "Cancelled");
                                apiClient
                                    .post(`${BASE_URL}/cancel_order`, formdata, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                            accesstoken: `${AccessToken}`,
                                            useraccesstoken: JSON.parse(val).token
                                        },
                                    }).then(response => {
                                        return response;
                                    })
                                    .then((responseJson) => {
                                        console.log("Cancel Order:", responseJson.data);
                                        if (responseJson.data.bstatus == 1) {
                                            setLoading(false);
                                            navigation.goBack();
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
                                        console.log("Remove Cart Error:", error);
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

    const ImageContent = () => {
        return (
            <Box width={'100%'} height={230} bgColor={'#FFFFFF'} borderRadius={10} style={{ overflow: 'hidden' }}>
                <Image
                    source={details == "" ? require('../assets/images/noimage.png') : details.product_image == "" ? require('../assets/images/noimage.png') : { uri: details.BaseUrl + details.product_image }}
                    style={{ width: '100%', height: 220, objectFit: 'contain' }}
                />
                {/* <Box px={2} py={1} borderTopRightRadius={10} bgColor={'#EEEEEE'} style={{ position: 'absolute', left: 0, bottom: 0 }}>
                    <HStack space={1} alignItems={'center'} justifyContent={'flex-end'}>
                        <Image source={require('../assets/images/star.png')} style={{ width: 25, height: 25, resizeMode: 'contain' }} />
                        <Text fontSize={'xl'} color={colorTheme?.normal}>{details?.pricePoint}</Text>
                        <Text fontSize={'md'} color={'gray.400'}>{t('Points')}</Text>
                    </HStack>
                </Box> */}
            </Box>
        )
    }

    const LabelValue = ({ label, value }) => {
        return (
            <HStack space={1}>
                <Text color={'gray.500'}>{label}:</Text>
                <Text fontWeight={'medium'}>{value}</Text>
            </HStack>
        )
    }

    const InfoContent = () => {
        return (
            <Box p={4} width={'100%'} bgColor={'#FFFFFF'} borderRadius={10} style={{ overflow: 'hidden' }}>
                <Text mb={1} fontSize={'md'} fontWeight={'semibold'}>{details?.productName}</Text>
                <LabelValue
                    label={t('Points')}
                    value={details?.pricePoint}
                />
                <LabelValue
                    label={t('Order Id')}
                    value={details?.orderId}
                />
                <LabelValue
                    label={t('Order Item Id')}
                    value={details?.orderItemId}
                />
                <LabelValue
                    label={t('Order Quantity')}
                    value={details?.quantity}
                />
                <LabelValue
                    label={t('Date')}
                    value={details?.orderDate}
                />
                {details.status != "Open" && details.status != "Cancelled" && (
                    <>
                        <LabelValue
                            label={t('AWB Number')}
                            value={details?.awbNo}
                        />
                        <LabelValue
                            label={t('Courier Name')}
                            value={details?.courierName}
                        />
                    </>
                )}
                <Box px={5} py={0.5} borderRadius={5} alignSelf={'flex-end'} alignItems={'center'} justifyContent={'center'} bgColor={details.status == "Open" ? '#00915D' : details.status == "Cancelled" ? '#EF4030' : '#FFB74D'}>
                    <Text fontWeight={'semibold'} fontSize={'xs'} color={'#ffffff'}>{details?.status}</Text>
                </Box>
            </Box>
        )
    }

    const LabelValueNew = ({ label, value }) => {
        return (
            <HStack width={'80%'} space={1.5} >
                <Text fontWeight={'bold'} color={'#707274'}>{label}:</Text>
                <Text color={'#707274'}>{value}</Text>
            </HStack>
        )
    }

    const AddressContent = () => {
        return (
            <Box p={4} width={'100%'} bgColor={'#FFFFFF'} borderRadius={10} style={{ overflow: 'hidden' }}>
                <Text mb={1} fontSize={'md'} fontWeight={'semibold'}>{t('Address')}</Text>
                <LabelValueNew
                    label={t('Address')}
                    value={details?.address}
                />
                <LabelValueNew
                    label={t('State')}
                    value={details?.state_name}
                />
                <LabelValueNew
                    label={t('City')}
                    value={details?.city_name}
                />
                <LabelValueNew
                    label={t('Post Code')}
                    value={details?.post_code}
                />
            </Box>
        )
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Order Details")}
                colorTheme={colorTheme}
            />
            {(details) && (
                <Box px={4} flex={1} bg={"#F1F1F1"}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Stack my={4} />
                        <ImageContent />
                        <Stack my={2} />
                        <InfoContent />
                        <Stack my={2} />
                        <AddressContent />
                        <Stack my={3} />
                        <Box>
                            {details.hsn_code == 'EGV' && details.canCancel == 1 && (
                                <Button style={{ position: 'absolute', left: 0 }} onPress={() => navigation.navigate('GiftVouchers')} alignSelf={'flex-start'} variant="outline" borderColor={colorTheme?.normal}>
                                    <Text color={colorTheme?.normal}>{t('Gift Vouchers')}</Text>
                                </Button>
                            )}
                            <Button style={{ position: 'absolute', right: 0 }} onPress={() => cancelOrder()} disabled={details.canCancel == 0} bgColor={details.canCancel == 0 ? 'gray.300' : '#EF4030'}>
                                {t('Cancel Order')}
                            </Button>
                        </Box>
                        <Stack my={10} />
                    </ScrollView>
                </Box>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    productbox: { borderRadius: 10, backgroundColor: '#ffffff', marginBottom: 30, padding: 15, marginHorizontal: 5 },
    solidBtn: { width: '48%', borderColor: '#f95b01', borderWidth: 2, backgroundColor: '#ae4203', borderRadius: 30 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default OrderDetailsScreen;
