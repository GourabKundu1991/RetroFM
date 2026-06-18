import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, StatusBar, View, useWindowDimensions, Alert } from 'react-native';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';

const ProductDetailsScreen = ({ navigation, route }) => {

    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [details, setDetails] = useState("");
    const [inCart, setInCart] = React.useState(0);
    const [productImage, setProductImage] = useState("");

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
            setDetails(route.params.details);
            console.log('details', JSON.stringify(route.params.details));
            if (route.params.details.ProductImage != "") {
                setProductImage(route.params.details.ProductImage);
            }
            countCart();
        });
        return unsubscribe;
    }, [])

    const countCart = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/mycartcount`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Cart:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setInCart(responseJson.data.total_count);
                        } else {
                            setInCart(0);
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
                        console.log("Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const addToCart = (type) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("prod_id", details.productId);
                formdata.append("price", details.pricePoints);
                formdata.append("prod_name", details.productName);
                formdata.append("price_in_points", details.pricePoints);
                formdata.append("quantity", 1);
                console.log(JSON.parse(val).token);
                apiClient
                    .post(`${BASE_URL}/addcart`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        //console.log("Add Cart:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            countCart();
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                if (type == "BuyNow") {
                                    navigation.navigate('MyCart');
                                }
                            }, 100);
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
                        console.log("Add Cart Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const BannerContent = () => {
        return (
            <Box bgColor={'white'} justifyContent={'center'} alignItems={'center'} width={'100%'} height={240} borderRadius={10}>
                <Image source={productImage == "" ? require('../assets/images/noimage.png') : { uri: details.BaseUrl + details.ProductImage }} style={{ width: '100%', height: 220 }} resizeMode='contain' />
            </Box>
        );
    }

    const InfoContent = ({ title, value }) => {
        return (
            <Box mb={1.5}>
                <HStack space={1} justifyContent={'space-between'}>
                    <Box borderRadius={5} px={4} justifyContent={'center'} width={'50%'} py={3} bgColor={'white'}>
                        <Text fontWeight={'semibold'} color={'#707274'}>{title}</Text>
                    </Box>
                    <Box borderRadius={5} px={4} justifyContent={'center'} width={'50%'} py={3} bgColor={'white'}>
                        <Text color={'#999999'}>{value}</Text>
                    </Box>
                </HStack>
            </Box>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t('Product Details')}
                colorTheme={colorTheme}
                showCart={true}
                cartCount={inCart}
            />
            {(details) && (
                <Box flex={1} px={4} bg={"#F1F1F1"}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Stack my={2} />
                        <BannerContent />
                        <Text mt={4} fontSize={'md'} fontWeight={'bold'}>{details?.productName}</Text>
                        <HStack space={2} mt={2} alignItems={'center'}>
                            <Image source={require('../assets/images/star.png')} style={{ width: 30, height: 30, resizeMode: 'contain' }} />
                            <Text color={colorTheme?.normal} fontSize={'2xl'} fontWeight={'bold'}>{details?.pricePoints}</Text>
                            <Text fontSize={'md'} fontWeight={'semibold'} color={'gray.600'} >{t('points')}</Text>
                        </HStack>
                        <VStack my={4}>
                            {/* <Text color="#888888">{t("Description")}:</Text> */}
                            <RenderHTML contentWidth={width} baseStyle={{ color: '#707274', fontSize: 14 }} source={{ html: details.ProductDesc }} />
                        </VStack>
                        <InfoContent
                            title={t('Brand')}
                            value={details?.ProductParams?.Brand}
                        />
                        <InfoContent
                            title={t('Item')}
                            value={details?.ProductParams?.Item}
                        />
                        <InfoContent
                            title={t('Denomination')}
                            value={details?.ProductParams?.Denomination}
                        />
                        <InfoContent
                            title={t("Product Code")}
                            value={details?.ProductCode}
                        />
                        <InfoContent
                            title={t('Product Id')}
                            value={details?.productId}
                        />
                        <Stack my={2} />
                        <HStack justifyContent={'space-between'}>
                            <Button onPress={() => addToCart("AddCart")} borderColor={colorTheme?.normal} borderWidth={2} bgColor={'transparent'} py={3} borderRadius={8} overflow={'hidden'} width={'48%'}>
                                <Text fontWeight={'semibold'} color={colorTheme?.normal}>{t('Add to Cart')}</Text>
                            </Button>
                            <Button onPress={() => addToCart("BuyNow")} borderColor={colorTheme?.normal} borderWidth={2} width={'48%'} py={3} borderRadius={8} overflow={'hidden'} bgColor={colorTheme?.normal}>
                                {t('Buy Now')}
                            </Button>
                        </HStack>
                        <Stack my={2} />
                    </ScrollView>
                </Box>
            )}
            <BottomTabs
                selected={1}
                colorTheme={colorTheme}
            />
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    productbox: { borderRadius: 20, borderColor: '#cccccc', backgroundColor: '#eeeeee', marginBottom: 30, borderWidth: 3, marginHorizontal: 5 },
    solidBtn: { width: '48%', borderWidth: 1, borderRadius: 10 },
    outlineBtn: { width: '48%', borderColor: '#ffffff', borderWidth: 1, backgroundColor: 'none', borderRadius: 10 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default ProductDetailsScreen;
