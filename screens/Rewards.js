import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Stack, Actionsheet, useDisclose, Select, Button } from 'native-base';
import React, { useCallback, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import RangeSlider from 'react-native-range-slider-expo/src/RangeSlider';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';

const RewardScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");
    const [dataFound, setDataFound] = React.useState("");

    const [pageNumber, setPageNumber] = React.useState(1);
    const [isLoadMore, setIsLoadMore] = React.useState(true);
    const [allProducts, setAllProducts] = React.useState([]);
    const [inCart, setInCart] = React.useState(0);
    const [allCategory, setAllCategory] = React.useState([]);

    const [cateId, setCateId] = React.useState(0);

    const { isOpen, onOpen, onClose } = useDisclose();
    const [pointRange, setPointRange] = React.useState("");
    const [fromValue, setFromValue] = React.useState(0);
    const [toValue, setToValue] = React.useState(0);

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
                    Events.publish('colorTheme', JSON.parse(val).info.theme_color);
                }
            });
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                console.log(JSON.parse(val).token);
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("pageNumber", 1);
                formdata.append("min", fromValue);
                formdata.append("max", toValue);
                formdata.append("filter", 1);
                formdata.append("categoryId", route.params ? route.params.cateId : cateId);
                apiClient
                    .post(`${BASE_URL}/catalog`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Rewards:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            countCart();
                            setAllProducts(responseJson.data.products);
                            setAllCategory(responseJson.data.categories);
                            setPointRange(responseJson.data.minMax);
                            setDataFound("found");
                            if (fromValue == "") {
                                setFromValue(responseJson.data.minMax.min);
                            }
                            if (toValue == "") {
                                setToValue(responseJson.data.minMax.max);
                            }
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setAllProducts([]);
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
                        console.log("Rewards Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

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
                            setLoading(false);
                            setInCart(0);
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

    const onApply = () => {
        setLoading(true);
        onClose();
        getAllData();
    }

    const onClear = useCallback(() => {
        setLoading(true);
        onClose();
        setCateId(0);
        setPageNumber(1);
        setIsLoadMore(true);
        setFromValue(pointRange.min);
        setToValue(pointRange.max);
        setTimeout(function () {
            getAllData();
        }, 1000);
    }, [],
    );

    const renderProduct = ({ item, index }) => {
        return (
            <VStack key={index} style={styles.productbox}>
                <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { details: item })}>
                    <Box style={styles.productimage} backgroundColor={"#eeeeee"}>
                        <Image source={item.ProductImage == "" ? require('../assets/images/noimage.png') : { uri: item.BaseUrl + item.ProductImage }} style={{ width: 100, height: 90 }} resizeMode='contain' />
                    </Box>
                    <Stack padding={1}>
                        <Text textAlign={'center'} fontSize='sm' mb="2">{item.productName.substring(0, 30)}</Text>
                        <Text textAlign={'center'} fontWeight="bold" fontSize='md' color={colorTheme.dark}>{item.pricePoints} {t("points")}</Text>
                    </Stack>
                </TouchableOpacity>
            </VStack>
        );
    }

    const loadMore = () => {
        let num = pageNumber + 1;
        console.log(num);
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("pageNumber", num);
                formdata.append("min", fromValue);
                formdata.append("max", toValue);
                formdata.append("filter", 1);
                formdata.append("categoryId", route.params ? route.params.cateId : cateId);
                apiClient
                    .post(`${BASE_URL}/catalog`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            let newArrya = allProducts.concat(responseJson.data.products);
                            setAllProducts(newArrya);
                            setPageNumber(num);
                        } else {
                            setLoading(false);
                            setIsLoadMore(false);
                            setPageNumber(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Rewards Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    };

    const RenderItem = ({ item }) => {
        return (
            <Box px={4} py={4} mt={3} borderRadius={10} bgColor={'white'} style={{ width: '48%' }}>
                <Box style={styles.productimage}>
                    <Image
                        source={item.ProductImage == "" ? require('../assets/images/noimage.png') : { uri: item.BaseUrl + item.ProductImage }}
                        style={{ width: '80%', height: 120, resizeMode: 'contain', alignSelf: 'center' }}
                    />
                </Box>

                <Text mt={2} color={'#707274'} fontSize={'xs'} width={'98%'}>{item?.productName}</Text>
                <Text fontWeight={'bold'} fontSize={'md'}>{item?.pricePoints} {t("points")}</Text>
                <Text onPress={() => navigation.navigate("ProductDetails", { details: item })} color={colorTheme?.normal} underline>{t('Details')}</Text>
            </Box>
        )
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t('Rewards')}
                suffixIcon={'options-outline'}
                colorTheme={colorTheme}
                onPressSuffix={() => onOpen()}
                showCart={true}
                cartCount={inCart}
            />
            <Box flex={1} px={4} bg={"#F1F1F1"}>
                {dataFound == "notfound" ?
                    <Stack space={5} style={[styles.productbox, { height: 350, width: '100%', marginHorizontal: 0, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                        <Icon name="hourglass-outline" size={80} color="#999999" />
                        <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                        <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                    </Stack>
                    :
                    <FlatList
                        data={allProducts}
                        keyExtractor={(item, index) => index}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
                        style={{ marginBottom: 10 }}
                    />
                }
                {isLoadMore && allProducts.length > 9 && (
                    <HStack paddingY="3" paddingX="6" justifyContent="center">
                        <Button variant="outline" backgroundColor={"#ffffff"} size={'xs'} rounded={30} onPress={() => loadMore()}>
                            <Text color="#bbbbbb">{t("Load More")}</Text>
                        </Button>
                    </HStack>
                )}
                <Actionsheet isOpen={isOpen} onClose={onClose}>
                    <Actionsheet.Content>
                        <ScrollView style={{ width: '100%', paddingHorizontal: 15 }}>
                            <Text textAlign="center" mt="5" mb={2} fontWeight="bold">{t("Category By")}</Text>
                            <View style={styles.inputbox}>
                                <Select variant="underlined" size="md" placeholder={t("Select Category")} w="100%"
                                    InputLeftElement={<Icon name="funnel-outline" size={20} color="#666666" style={{ width: 25, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />}
                                    selectedValue={cateId}
                                    onValueChange={value => setCateId(value)}
                                    _selectedItem={{
                                        backgroundColor: '#eeeeee',
                                        endIcon: <Icon name="checkmark-circle" size={22} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                    }}>
                                    {allCategory.map((item, index) =>
                                        <Select.Item key={index} label={item.categoryName} value={item.categoryId} />
                                    )}
                                </Select>
                            </View>
                            <Text textAlign="center" mt="5" fontWeight="bold">{t("Points Range")} ({fromValue} - {toValue})</Text>
                            <HStack justifyContent="space-between" alignItems="center">
                                <RangeSlider min={Number(pointRange.min)} max={Number(pointRange.max)} step={500}
                                    fromValueOnChange={value => setFromValue(value)}
                                    toValueOnChange={value => setToValue(value)}
                                    initialFromValue={fromValue}
                                    initialToValue={toValue}
                                    fromKnobColor={'#444444'}
                                    toKnobColor={'#444444'}
                                    knobSize={25}
                                    barHeight={8}
                                    showValueLabels={false}
                                    valueLabelsBackgroundColor='#444444'
                                    inRangeBarColor={colorTheme.normal}
                                />
                            </HStack>
                        </ScrollView>
                        <HStack paddingY="3" paddingX="6" mt={5} space={3} justifyContent="space-between">
                            <Button style={styles.outlineBtn} borderColor={colorTheme.normal} onPress={() => onClear()}>
                                <Text color={colorTheme.normal} fontSize="md" fontWeight="medium">{t("Reset")}</Text>
                            </Button>
                            <Button style={styles.solidBtn} backgroundColor={colorTheme.normal} borderColor={colorTheme.normal} onPress={() => onApply()}>
                                <Text color="#ffffff" fontSize="md" fontWeight="medium">{t("Apply")}</Text>
                            </Button>
                        </HStack>
                    </Actionsheet.Content>
                </Actionsheet>
            </Box>
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
    )
};

const styles = StyleSheet.create({
    solidBtn: { width: '48%', borderWidth: 1, borderRadius: 8 },
    outlineBtn: { width: '48%', borderWidth: 1, backgroundColor: 'none', borderRadius: 8 },
    inputbox: { borderColor: '#cccccc', borderWidth: 1, borderRadius: 8, width: '100%', overflow: 'hidden', marginVertical: 7 },
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    productbox: { borderRadius: 20, width: '46%', margin: '2%', backgroundColor: '#f6f6f6', padding: 10, borderColor: '#eeeeee', borderWidth: 2, overflow: 'hidden' },
    productimage: { borderColor: '#EFEFEF', backgroundColor: '#EFEFEF', marginBottom: 10, borderWidth: 5, borderRadius: 10, width: '100%', height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default RewardScreen;