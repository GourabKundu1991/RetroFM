import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Text, VStack, Toast, Button, Stack } from 'native-base';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import { FlatList } from 'react-native';
import apiClient from '../api/apiClient';

const PointStatementScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [allPoints, setAllPoints] = React.useState([]);
    const [allTDSPoints, setAllTDSPoints] = React.useState([]);

    const [currentPoints, setCurrentPoints] = React.useState("");

    const [pageNumber, setPageNumber] = React.useState(1);
    const [isLoadMore, setIsLoadMore] = React.useState(true);

    const [pageNumberTDS, setPageNumberTDS] = React.useState(1);
    const [isLoadMoreTDS, setIsLoadMoreTDS] = React.useState(true);

    const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

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
                formdata.append("pageNumber", 1);
                apiClient
                    .post(`${BASE_URL}/pointstatements`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Point Statements:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setAllPoints(responseJson.data.trnasc_list);
                            setCurrentPoints(responseJson.data.current_balance);
                            apiClient
                                .post(`${BASE_URL}/tds_points_statement`, formdata, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                        accesstoken: `${AccessToken}`,
                                        useraccesstoken: JSON.parse(val).token
                                    },
                                }).then(response => {
                                    return response;
                                })
                                .then((responseTdsJson) => {
                                    console.log("TDS Point Statements:", responseTdsJson.data);
                                    if (responseTdsJson.data.bstatus == 1) {
                                        setLoading(false);
                                        setAllTDSPoints(responseTdsJson.data.trnasc_list);
                                    } else {
                                        Toast.show({ description: responseTdsJson.data.message });
                                        setTimeout(function () {
                                            setLoading(false);
                                            if (responseTdsJson.data.msg_code == "msg_1000") {
                                                AsyncStorage.clear();
                                                navigation.navigate('Welcome');
                                            }
                                        }, 1000);
                                    }
                                })
                                .catch((error) => {
                                    setLoading(false);
                                    //console.log("TDS Point Statements Error:", error);
                                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                });
                        } else {
                            Toast.show({ description: responseJson.data.message });
                            setTimeout(function () {
                                setLoading(false);
                                if (responseJson.data.msg_code == "msg_1000") {
                                    AsyncStorage.clear();
                                    navigation.navigate('Welcome');
                                }
                            }, 1000);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Point Statements Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const loadMore = () => {
        let num = pageNumber + 1;
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("pageNumber", num);
                apiClient
                    .post(`${BASE_URL}/pointstatements`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Point Statements:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            let newArrya = allPoints.concat(responseJson.data.trnasc_list);
                            setAllPoints(newArrya);
                            setPageNumber(num);
                        } else {
                            setLoading(false);
                            setIsLoadMore(false);
                            setPageNumber(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("Point Statements Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    };

    const loadMoreTDS = () => {
        let num = pageNumberTDS + 1;
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("pageNumber", num);
                apiClient
                    .post(`${BASE_URL}/tds_points_statement`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("TDS Point Statements:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            let newArrya = allTDSPoints.concat(responseJson.data.trnasc_list);
                            setAllTDSPoints(newArrya);
                            setPageNumberTDS(num);
                        } else {
                            setLoading(false);
                            setIsLoadMoreTDS(false);
                            setPageNumberTDS(1);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        //console.log("TDS Point Statements Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    };

    const TopTabContent = () => {
        return (
            <Box px={8} pt={4} pb={1.5} bg={colorTheme?.normal}>
                <HStack justifyContent={'space-between'}>
                    <Pressable onPress={() => setSelectedTabIndex(0)}>
                        <Box py={2} px={2} borderBottomWidth={selectedTabIndex == 0 ? 2 : 0} borderColor={'#FFFFFF'} >
                            <Text fontWeight={'bold'} textAlign={'center'} color={selectedTabIndex == 0 ? '#FFFFFF' : '#746b6bff'} fontSize={'md'}>{t('Point Statement')}</Text>
                        </Box>
                    </Pressable>
                    <Pressable onPress={() => setSelectedTabIndex(1)}>
                        <Box py={2} px={2} borderBottomWidth={selectedTabIndex != 0 ? 2 : 0} borderColor={'#FFFFFF'} >
                            <Text fontWeight={'bold'} textAlign={'center'} color={selectedTabIndex != 0 ? '#FFFFFF' : '#746b6bff'} fontSize={'md'}>{t('TDS Point Statement')}</Text>
                        </Box>
                    </Pressable>
                </HStack>
            </Box>
        );
    }

    const LabelValue = ({ label, value }) => {
        return (
            <HStack space={1.5} alignItems={'center'}>
                <Text fontWeight={'bold'} color={'#707274'}>{label}:</Text>
                <Text color={'#707274'}>{value}</Text>
            </HStack>
        )
    }

    const RenderPointItem = ({ item }) => {
        const isDebit = item?.transaction_type == 'Debit';
        return (
            <Box px={4} mb={4} py={3} bgColor={'#FFFFFF'} borderRadius={10} style={{ elevation: 2.0, overflow: 'hidden' }}>
                <HStack space={2}>
                    <Icon name={isDebit ? "arrow-up-outline" : "arrow-down-outline"} size={22} color={isDebit ? 'red' : 'green'} />
                    <Text fontWeight={'bold'} fontSize={'md'}>{isDebit ? '-' : '+'} {item?.reward_points}</Text>
                </HStack>
                <VStack mt={1}>
                    <LabelValue label={t("Id")} value={item?.id} />
                    <LabelValue label={t("Date")} value={item?.created_at} />
                    <LabelValue label={t("Type")} value={item?.transaction_type} />
                    <LabelValue label={t("Description")} value={item?.transaction_desc} />
                </VStack>
                <Box px={4} py={1} bgColor={isDebit ? '#f11818ff' : '#126c0fff'} style={{ position: 'absolute', right: 0, borderBottomLeftRadius: 10 }}>
                    <Text fontSize={'xs'} color={'#FFFFFF'}>{item?.transaction_type}</Text>
                </Box>
            </Box>
        );
    }

    const RenderTdsItem = ({ item }) => {
        const isDebit = item?.type == 'TDS Deposit';
        return (
            <Box px={4} mb={4} py={3} bgColor={'#FFFFFF'} borderRadius={10} style={{ elevation: 2.0, overflow: 'hidden' }}>
                <HStack space={2}>
                    <Icon name={isDebit ? "arrow-up-outline" : "arrow-down-outline"} size={22} color={isDebit ? 'red' : 'green'} />
                    <Text fontWeight={'bold'} fontSize={'md'}>{isDebit ? '-' : '+'} {item?.debited_points}</Text>
                </HStack>
                <VStack mt={1}>
                    {/* <LabelValue label={t("Id")} value={item?.id} /> */}
                    <LabelValue label={t("Date")} value={item?.created_at} />
                    <LabelValue label={t("Type")} value={item?.type} />
                    <LabelValue label={t("Description")} value={item?.comment} />
                </VStack>
                <Box px={4} py={1} bgColor={isDebit ? '#f11818ff' : '#126c0fff'} style={{ position: 'absolute', right: 0, borderBottomLeftRadius: 10 }}>
                    <Text fontSize={'xs'} color={'#FFFFFF'}>{item?.type}</Text>
                </Box>
            </Box>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Point History")}
                colorTheme={colorTheme}
            />
            <TopTabContent />
            <Box py={4} px={4} flex={1} bg={"#F1F1F1F1"}>
                {(selectedTabIndex == 0) && (
                    <>
                        {allPoints.length == 0 ?
                            <HStack padding="10" justifyContent="center">
                                <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                            </HStack>
                            :
                            <FlatList
                                data={allPoints}
                                keyExtractor={(item, index) => index}
                                renderItem={({ item }) => <RenderPointItem item={item} />}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={
                                    <>
                                        {isLoadMore && allPoints.length > 7 && (
                                            <HStack pb="3" paddingX="6" justifyContent="center">
                                                <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                                    <Text color="#bbbbbb">{t("Load More")}</Text>
                                                </Button>
                                            </HStack>
                                        )}
                                    </>
                                }
                            />
                        }
                    </>
                )}
                {(selectedTabIndex == 1) && (
                    <>
                        {allTDSPoints.length == 0 ?
                            <HStack padding="10" justifyContent="center">
                                <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                            </HStack>
                            :
                            <FlatList
                                data={allTDSPoints}
                                keyExtractor={(item, index) => index}
                                renderItem={({ item }) => <RenderTdsItem item={item} />}
                                showsVerticalScrollIndicator={false}
                                ListFooterComponent={
                                    <>
                                        {isLoadMoreTDS && allTDSPoints.length > 7 && (
                                            <HStack pb="3" paddingX="6" justifyContent="center">
                                                <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMoreTDS()}>
                                                    <Text color="#bbbbbb">{t("Load More")}</Text>
                                                </Button>
                                            </HStack>
                                        )}
                                    </>
                                }
                            />
                        }
                    </>
                )}
            </Box>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>
    )

    return (
        <NativeBaseProvider>
            {/* <StatusBar barStyle="light-content" backgroundColor={colorTheme.normal} /> */}
            <StatusBar translucent hidden />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Point History")}
                colorTheme={colorTheme}
            />
            <Box flex={1} bg={"#ffffff"}>
                {/* <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Point History")}</Text>
                    </HStack>
                </HStack> */}
                <ScrollView>
                    <Box padding="5">
                        <VStack>
                            <Box style={styles.productbox}>
                                <VStack alignItems="center" w="100%" space={4} padding={5}>
                                    <Stack borderWidth={1} borderColor="#444444" borderRadius={15} w="100%" padding="1" overflow="hidden">
                                        <Text color="#111111" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Available for Redemption")}</Text>
                                        <HStack space={1} justifyContent="center" alignItems="center">
                                            <Text color={colorTheme.dark} fontSize="lg" textAlign="center" fontWeight="bold" textTransform="capitalize">{currentPoints != "" ? currentPoints : 0}</Text>
                                            <Text color={colorTheme.dark} fontSize="sm" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Points")}</Text>
                                        </HStack>
                                    </Stack>
                                </VStack>
                            </Box>
                            <Box style={[styles.productbox, { borderColor: colorTheme.light }]}>
                                <View style={{ padding: 12, backgroundColor: colorTheme.light }}>
                                    <Text color={colorTheme.dark} fontSize="md" textAlign="center" fontWeight="bold">{t("TDS Point Statement")}</Text>
                                </View>
                                {allTDSPoints.length == 0 ?
                                    <HStack padding="10" justifyContent="center">
                                        <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                    </HStack>
                                    :
                                    <ScrollView style={{ maxHeight: 380 }} nestedScrollEnabled={true}>
                                        <VStack padding="4" space="3">
                                            {allTDSPoints.map((item, index) =>
                                                <Box key={index} borderWidth="1" borderColor="#aaaaaa" borderRadius="10" overflow="hidden">
                                                    <HStack justifyContent="space-evenly" alignItems="center" bg="#ffffff" borderTopRadius="10">
                                                        <VStack padding="2" w="33%">
                                                            <Text fontSize='xs' color="#666666">{t("Date")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.created_at}</Text>
                                                        </VStack>
                                                        <VStack padding="2" w="33%">
                                                            <Text fontSize='xs' color="#666666">{t("Type")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.type}</Text>
                                                        </VStack>
                                                        <VStack padding="2" w="33%">
                                                            <Text fontSize='xs' color="#666666">{t("Points")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.debited_points}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    <HStack alignItems="center" bg="#f6f6f6">
                                                        <VStack padding="2">
                                                            <Text fontSize='xs' color="#666666">{t("Description")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.comment}</Text>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            )}
                                        </VStack>
                                        {isLoadMoreTDS && allTDSPoints.length > 7 && (
                                            <HStack pb="3" paddingX="6" justifyContent="center">
                                                <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMoreTDS()}>
                                                    <Text color="#bbbbbb">{t("Load More")}</Text>
                                                </Button>
                                            </HStack>
                                        )}
                                    </ScrollView>
                                }
                            </Box>
                            <Box style={[styles.productbox, { borderColor: colorTheme.light }]} mt="5">
                                <View style={{ padding: 12, backgroundColor: colorTheme.light }}>
                                    <Text color={colorTheme.dark} fontSize="md" textAlign="center" fontWeight="bold">{t("Point Statement")}</Text>
                                </View>
                                {allPoints.length == 0 ?
                                    <HStack padding="10" justifyContent="center">
                                        <Text fontSize='sm' color="#888888">----- {t("No Data Available")} -----</Text>
                                    </HStack>
                                    :
                                    <ScrollView style={{ maxHeight: 380 }} nestedScrollEnabled={true}>
                                        <VStack padding="4" space="3">
                                            {allPoints.map((item, index) =>
                                                <Box key={index} borderWidth="1" borderColor="#aaaaaa" borderRadius="10" overflow="hidden">
                                                    <HStack justifyContent="space-evenly" alignItems="center" bg="#ffffff" borderTopRadius="10">
                                                        <VStack padding="2" w="33%">
                                                            <Text fontSize='xs' color="#666666">{t("Date")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.created_at}</Text>
                                                        </VStack>
                                                        <VStack padding="2" w="33%">
                                                            <Text fontSize='xs' color="#666666">{t("Type")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.transaction_type}</Text>
                                                        </VStack>
                                                        <VStack padding="2" w="33%">
                                                            <Text fontSize='xs' color="#666666">{t("Points")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.reward_points}</Text>
                                                        </VStack>
                                                    </HStack>
                                                    <HStack alignItems="center" bg="#f6f6f6">
                                                        <VStack padding="2">
                                                            <Text fontSize='xs' color="#666666">{t("Description")}:</Text>
                                                            <Text fontSize='sm' color="#111111" fontWeight="medium">{item.transaction_desc}</Text>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            )}
                                        </VStack>
                                        {isLoadMore && allPoints.length > 7 && (
                                            <HStack pb="3" paddingX="6" justifyContent="center">
                                                <Button variant="outline" size={'xs'} rounded={30} onPress={() => loadMore()}>
                                                    <Text color="#bbbbbb">{t("Load More")}</Text>
                                                </Button>
                                            </HStack>
                                        )}
                                    </ScrollView>
                                }
                            </Box>
                        </VStack>
                    </Box>
                </ScrollView>
            </Box>
            <BottomTabs
                selected={5}
                colorTheme={colorTheme}
            />
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    note: { color: '#ffffff', width: 20, height: 20, borderRadius: 10, overflow: 'hidden', fontWeight: 'bold', fontSize: 16, lineHeight: 19, textAlign: 'center' },
    productbox: { borderRadius: 20, width: '96%', margin: '2%', borderColor: '#eeeeee', borderWidth: 2, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default PointStatementScreen;
