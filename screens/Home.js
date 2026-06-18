import { Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import Events from '../auth_provider/Events';
import moment from 'moment';

import PushControllerService from '../auth_provider/PushController';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';

const HomeScreen = ({ navigation }) => {

    PushControllerService({ navigation });

    const BannerWidth = Dimensions.get('window').width;
    const { width, height } = Dimensions.get('window');
    const BannerHeight = 200;

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [totalcart, setTotalcarte] = React.useState(0);
    const [allBanners, setAllBanners] = React.useState([]);
    const [allcategories, setAllcategories] = React.useState([]);
    const [homeMenu, setHomeMenu] = React.useState([]);
    const [voucherPop, setVoucherPop] = React.useState(false);
    const [awareCheck, setAwareCheck] = React.useState(false);

    const [isPending, setIsPending] = React.useState(false);
    const [isKYC, setIsKYC] = React.useState(false);

    const [profileDetails, setProfileDetails] = React.useState("");

    const [selectedORG, setSelectedORG] = React.useState("");

    const [orgName, setOrgName] = React.useState("");
    const [duplicateAccount, setDuplicateAccount] = React.useState([]);

    const [tierUrl, setTierUrl] = React.useState("");

    const [imageBase, setImageBase] = React.useState("");

    const goBannerDetails = (dataValue) => {
        if (dataValue.open_type == 1) {
            if (Platform.OS == "android") {
                Linking.openURL(dataValue.android_target_link);
            } else {
                Linking.openURL(dataValue.ios_target_link);
            }
        }
    }

    const renderBanner = ({ item, index }) => {
        return (
            <View key={index} style={styles.sliderbanner}>
                <TouchableOpacity onPress={() => goBannerDetails(item)}>
                    <Image style={{ width: '100%', height: 150, resizeMode: 'stretch', marginLeft: 0, borderRadius: 10 }} source={item.image ? { uri: item.image } : require('../assets/images/noimage.png')} />
                </TouchableOpacity>
            </View>
        );
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
                    getAllData(JSON.parse(val).org_id);
                }
            });
        });
        return unsubscribe;
    }, []);

    const getAllData = (selectedORG) => {
        AsyncStorage.getItem('userToken').then(val => {
            setColorTheme(JSON.parse(val).info.theme_color);
            setImageBase(JSON.parse(val).BaseUrl);
            Events.publish('colorTheme', JSON.parse(val).info.theme_color);
            setDuplicateAccount(JSON.parse(val).has_duplicate_account);
            setOrgName(JSON.parse(val).org_name);
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", selectedORG);
                apiClient
                    .post(`${BASE_URL}/get_dashboard_info`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("Dashboard:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setTierUrl(responseJson.data.tier_url);
                            if (responseJson.data.have_location_info == 0) {
                                navigation.navigate('TakeStorePicture');
                                Events.publish('mainMenu', []);
                            } else {
                                setAllBanners(responseJson.data.banners);
                                setHomeMenu(responseJson.data.home_menu);
                                setAllcategories(responseJson.data.categories);
                                setTotalcarte(responseJson.data.total_cart_count);
                                if (responseJson.data.is_approved == 2) {
                                    Events.publish('mainMenu', responseJson.data.menu);
                                    AsyncStorage.getItem('kycPOPstatus').then(statusvalue => {
                                        if (statusvalue != 'checked') {
                                            setIsKYC(true);
                                        }
                                    })
                                } else {
                                    if (responseJson.is_approved == 0) {
                                        Events.publish('mainMenu', responseJson.data.menu);
                                        AsyncStorage.getItem('kycPOPstatus').then(statusvalue => {
                                            if (statusvalue != 'checked') {
                                                setIsPending(true);
                                            }
                                        })
                                    } else {
                                        if (responseJson.data.voucher_expiry_pop_up_status == true) {
                                            AsyncStorage.getItem('voucher').then(valVou => {
                                                if (valVou != null) {
                                                    if (valVou == moment(new Date()).format('DD, MMMM')) {
                                                        Events.publish('mainMenu', responseJson.data.menu);
                                                    } else {
                                                        setVoucherPop(true);
                                                        Events.publish('mainMenu', []);
                                                    }
                                                } else {
                                                    setVoucherPop(true);
                                                    Events.publish('mainMenu', []);
                                                }
                                            })
                                        } else {
                                            Events.publish('mainMenu', responseJson.data.menu);
                                        }
                                    }
                                }
                            }

                            apiClient
                                .post(`${BASE_URL}/profile`, formdata, {
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
                                    console.log("Profile:", responseJson.data);
                                    if (responseJson.data.bstatus == 1) {
                                        setProfileDetails(responseJson.data.profile);
                                        Events.publish('profileData', JSON.stringify(responseJson.data));
                                    } else {
                                        Toast.show({ description: responseJson.data.message });
                                    }
                                })
                                .catch((error) => {
                                    setLoading(false);
                                    //console.log("Profile Error:", error);
                                    Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                });
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
                        console.log("Dashboard Error:", error);
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

    const onUnlock = () => {
        if (awareCheck == false) {
            Toast.show({ description: t("Please check 'I am aware of'") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("APIkey", `${API_KEY}`);
                    formdata.append("orgId", JSON.parse(val).org_id);
                    apiClient
                        .post(`${BASE_URL}/addVoucherExpiryDetails`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                accesstoken: `${AccessToken}`,
                                useraccesstoken: JSON.parse(val).token
                            },
                        }).then(response => {
                            return response;
                        })
                        .then((responseJson) => {
                            console.log("addVoucherExpiryDetails:", responseJson.data);
                            if (responseJson.data.bstatus == 1) {
                                AsyncStorage.setItem('voucher', moment(new Date()).format('DD, MMMM'));
                                setVoucherPop(false);
                                navigation.navigate('MyGiftVouchers');
                                setLoading(false);
                            }
                        })
                        .catch((error) => {
                            setLoading(false);
                            //console.log("addVoucherExpiryDetails Error:", error);
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

    const onClose = () => {
        AsyncStorage.setItem('kycPOPstatus', 'checked');
        setIsKYC(false);
        setIsPending(false);
    }

    const onSwitchAcct = () => {
        Alert.alert(
            t("Warning"),
            t("Do you want to switch your account") + "?",
            [
                {
                    text: t("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: t("Yes"), onPress: () => {
                        setLoading(true);
                        AsyncStorage.getItem('userToken').then(val => {
                            if (val != null) {
                                let formdata = new FormData();
                                formdata.append("APIkey", `${API_KEY}`);
                                apiClient
                                    .post(`${BASE_URL}/switch_account`, formdata, {
                                        headers: {
                                            'Content-Type': 'multipart/form-data',
                                            accesstoken: `${AccessToken}`,
                                            useraccesstoken: JSON.parse(val).token
                                        },
                                    }).then(response => {
                                        return response;
                                    })
                                    .then((responseJson) => {
                                        console.log("switch_account:", responseJson.data);
                                        if (responseJson.data.status == 'success') {
                                            AsyncStorage.setItem('userToken', JSON.stringify(responseJson.data));
                                            getAllData(responseJson.data.org_id);
                                        }
                                    })
                                    .catch((error) => {
                                        setLoading(false);
                                        //console.log("switch_account Error:", error);
                                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                                    });
                            } else {
                                setLoading(false);
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        });
                    }
                }
            ],
            { cancelable: false }
        );
    }

    const UserInfoContent = () => {
        return (
            <Box mb={2} borderRadius={10} borderWidth={1} borderColor={'#EEEEEE'} bgColor={'white'} mt={2} overflow={'hidden'} style={{ elevation: 4 }}>
                <HStack px={2} py={2} justifyContent={'space-between'} >
                    <HStack alignItems={'center'} space={4}>
                        <Avatar source={(profileDetails?.profile_pic) ? { uri: profileDetails?.BaseUrl + profileDetails?.profile_pic } : require('../assets/images/avatar.png')} size={75} style={{ borderWidth: 5, borderColor: colorTheme?.dark }} />
                        <VStack>
                            <Text fontSize={'md'} fontWeight={'semibold'}>{profileDetails?.firstName + ' ' + profileDetails?.lastName + ' '}</Text>
                            <Text fontSize={'xs'}><Text fontWeight={'semibold'} color={'grey'}>{t('Member ID')} : </Text>{profileDetails?.ID}</Text>
                            <Text fontSize={'xs'}><Text fontWeight={'semibold'} color={'grey'}>{t('Current Tier')} : </Text>{profileDetails?.tier}</Text>
                        </VStack>
                    </HStack>
                    <Image source={profileDetails.tier_badge ? { uri: imageBase + profileDetails.tier_badge } : require('../assets/images/badge.png')} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
                </HStack>
                <Stack my={2} />
                <LinearGradient
                    colors={["#c48e1c", "#f9e255", "#f9e255", "#c48e1c"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: 70, alignSelf: 'center', alignItems: 'center' }}
                >
                    <HStack flex={1} alignItems={'center'} justifyContent={'space-evenly'}>
                        <VStack width={'50%'} borderRightWidth={0.2} borderColor={"#999999"} space={1} justifyContent={'center'} alignItems={'center'}>
                            <Text color="#000000" fontSize="md" fontWeight="bold">{profileDetails.total_point ? profileDetails.total_point : "0"}</Text>
                            <Text lineHeight={12} textAlign={'center'} color="#222222" fontSize="xs">{t("Total Points")}</Text>
                        </VStack>
                        <VStack width={'50%'} borderLeftWidth={0.2} borderColor={"#999999"} space={1} justifyContent={'center'} alignItems={'center'}>
                            <Text color="#000000" fontSize="md" fontWeight="bold">{profileDetails.available_point ? profileDetails.available_point : "0"}</Text>
                            <Text lineHeight={12} textAlign={'center'} color="#222222" fontSize="xs">{t("Available for Redemption")}</Text>
                        </VStack>
                        {/* <VStack width={'30%'} borderLeftWidth={0.2} borderColor={"#999999"} space={1} justifyContent={'center'} alignItems={'center'}>
                            <Text color="#000000" fontSize="md" fontWeight="bold">{profileDetails.available_reserve_points ? profileDetails.available_reserve_points : "0"}</Text>
                            <Text lineHeight={12} textAlign={'center'} color="#222222" fontSize="xs">{t("Reserve Points")}</Text>
                        </VStack> */}
                    </HStack>
                </LinearGradient>
            </Box>
        );
    }

    const OrgContent = () => {
        return (
            <Box mt={2} px={4} py={5} borderRadius={10} bgColor={'white'}>
                <HStack justifyContent={'space-between'} alignItems={'center'}>
                    <Image source={require('../assets/images/org.png')} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                    <Text fontSize={'sm'}>{t('Switch Organization')}</Text>
                    <HStack alignItems={'center'}>
                        <Text mr={1} color={colorTheme.normal}>{t('DG')}</Text>
                        <Pressable onPress={() => onSwitchAcct()} position="relative">
                            <View style={{ backgroundColor: orgName == "Nuvoco" ? colorTheme?.normal : '#ec2832', display: 'flex', alignItems: orgName == "Nuvoco" ? 'flex-start' : 'flex-end', borderRadius: 30, overflow: 'hidden', width: 70, height: 30, borderColor: '#ffffff', borderWidth: 1, padding: 4 }}>
                                <View style={{ backgroundColor: '#ffffff', width: 20, height: 20, borderRadius: 30, overflow: 'hidden' }}></View>
                            </View>
                        </Pressable>
                        <Text ml={1} color={'gray.800'}>{t('DB')}</Text>
                    </HStack>
                </HStack>
            </Box>
        );
    }

    const BannerContent = () => {
        return (
            <Carousel
                loop
                autoPlay
                width={width}
                height={160}
                data={allBanners}
                style={{ borderRadius: 20, borderWidth: 5, borderColor: '#cccccc', width: '90%', alignSelf: 'center', marginVertical: 15 }}
                renderItem={renderBanner}
            />
        );
    }

    const CategoryContent = () => {
        return (
            <Box >
                <HStack justifyContent={'space-between'} alignItems={'center'}>
                    <Text fontSize={'md'} fontWeight={'medium'}>{t('Shop by Category')}</Text>
                    <Button size="sm" style={styles.custbtn} variant="link" _text={{ color: colorTheme.normal, fontWeight: 'bold', fontSize: 13 }} onPress={() => navigation.navigate('RewardCategory')}>{t("View More")}</Button>
                </HStack>
                <Stack my={1} />
                <HStack py={3} borderRadius={10} overflow={'hidden'} bgColor={'#FFFFFF'} justifyContent={'space-evenly'} flexWrap={'wrap'} width={'100%'}>
                    {allcategories.slice(0, 5).map((item, index) =>
                        <TouchableOpacity activeOpacity={0.5} key={index} onPress={() => navigation.navigate("Rewards", { cateId: item.categoryId })} style={{ width: '18%', alignItems: 'center' }}>
                            <Box bgColor={colorTheme.light} width={45} height={45} borderRadius={30} alignItems={'center'} justifyContent={'center'}>
                                {item.isCategoryImage === 1 ?
                                    <Image style={{ width: 25, height: 25, resizeMode: 'contain' }} source={{ uri: imageBase + item.categoryImage }} />
                                    :
                                    <Icon name={item.categoryImage} size={30} color={colorTheme.normal} />
                                }
                            </Box>
                            <Text mt={0.5} fontSize={11} textAlign={'center'}>{item.categoryName}</Text>
                        </TouchableOpacity>
                    )}
                </HStack>
            </Box>
        );
    }

    const QuickLinkContent = () => {
        return (
            <Box mt={4}>
                <Text fontSize={'md'} fontWeight={'medium'}>{t('Quick Links')}</Text>
                <Stack my={1} />
                <Box borderRadius={10} py={3} bgColor={'#FFFFFF'}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {homeMenu.map((item, index) =>
                            <TouchableOpacity activeOpacity={0.5} key={index} onPress={() => item.url == "TierUrl" ? Linking.openURL(tierUrl) : navigation.navigate(item.url)} style={{ width: 80, alignItems: 'center', marginRight: homeMenu.length - 1 == index ? 0 : 8 }}>
                                <Box bgColor={colorTheme.light} width={45} height={45} borderRadius={30} alignItems={'center'} justifyContent={'center'}>
                                    <Icon name={item.icon + "-outline"} size={30} color={colorTheme.normal} />
                                </Box>
                                {/* <Icon name={item.icon} size={40} color={colorTheme.normal} /> */}
                                <Text mt={0.5} fontSize={11} textAlign={'center'}>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </Box>
            </Box>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                showMenu={true}
                title={t('Welcome')}
                // suffixIcon={'call-outline'}
                colorTheme={colorTheme}
            />
            <Box flex={1} px={2} bg={"#F1F1F1"}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {(profileDetails) && (
                        <UserInfoContent />
                    )}
                    {duplicateAccount.length > 1 && (
                        <OrgContent />
                    )}
                    {(allBanners.length > 0) && (
                        <BannerContent />
                    )}
                    {(allcategories.length > 0) && (
                        <CategoryContent />
                    )}
                    {(homeMenu.length > 0) && (
                        <QuickLinkContent />
                    )}
                    <Stack my={2} />
                </ScrollView>
            </Box>
            <BottomTabs
                selected={0}
                colorTheme={colorTheme}
            />
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
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
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your EKYC is in Pending Mode. Please click continue to use app")}.</Text>
                            <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: 180, borderRadius: 8, overflow: 'hidden' }} onPress={() => onClose()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Continue")}</Text>
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
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your E-KYC Rejected / Not verified. Please click on Update to continue")}.</Text>
                            <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: 180, borderRadius: 8, overflow: 'hidden' }} onPress={() => updateKYC()} marginY={4}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Update")}</Text>
                            </Button>
                            <Button size="sm" style={{ backgroundColor: '#999999', width: 180, borderRadius: 8, overflow: 'hidden' }} onPress={() => onClose()} marginBottom={3}>
                                <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Close")}</Text>
                            </Button>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
            {voucherPop && (
                <View style={styles.spincontainer}>
                    <LinearGradient
                        colors={["#ffffff", "#cccccc"]}
                        start={{ x: 0.5, y: 0 }}
                        style={{ width: 300, borderRadius: 10, overflow: 'hidden' }}
                    >
                        <VStack space={1} w="100%" paddingX="5" paddingY="5" alignItems="center" justifyContent="center">
                            <Icon name="warning-outline" size={100} color={colorTheme.dark}></Icon>
                            <Text mt={8} mb={3} fontSize="xl" fontWeight="bold" color="#111111">{t("Voucher Expiry Reminder")} !</Text>
                            <Text textAlign="center" fontSize="sm" fontWeight="medium" color="#111111" mb={3}>{t("Your Gift Voucher id locked. You can unlock it now and use your gift voucher before it get expired")}.</Text>
                            <Stack marginY="4" flexWrap="wrap" backgroundColor={"rgba(255,255,255,0.7)"} style={{ paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, overflow: 'hidden' }}>
                                <Checkbox colorScheme="orange" shadow={2} onChange={() => setAwareCheck(!awareCheck)} accessibilityLabel="Checkbox">
                                    {t("I am aware of")}
                                </Checkbox>
                            </Stack>
                            <HStack justifyContent={"space-evenly"} width={"100%"}>
                                <Button size="sm" variant="outline" style={{ borderColor: '#111111', width: 120, borderRadius: 8, overflow: 'hidden' }} onPress={() => onLogout()} marginY={4}>
                                    <Text color="#111111" fontSize="sm" fontWeight="medium">{t("Logout")}</Text>
                                </Button>
                                <Button size="sm" style={{ backgroundColor: colorTheme.dark, width: 120, borderRadius: 0, overflow: 'hidden' }} onPress={() => onUnlock()} marginY={4}>
                                    <Text color="#ffffff" fontSize="sm" fontWeight="medium">{t("Unlock Now")}</Text>
                                </Button>
                            </HStack>
                        </VStack>
                    </LinearGradient>
                </View>
            )}
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    sliderbanner: { borderRadius: 20, overflow: 'hidden', borderColor: '#ffffff', borderWidth: 1, elevation: 10, marginVertical: 15, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, height: 240, backgroundColor: '#eeeeee' },
    linkbox: { borderRadius: 20, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
    sliderbanner: {
        width: '96%',
        overflow: 'hidden',
        marginVertical: 15,
        // borderRadius: 5,
        // overflow: 'hidden',
        // borderColor: '#ffffff',
        // borderWidth: 1,
        // elevation: 4,
        // shadowColor: '#000000',
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.4,
        // shadowRadius: 10,
        // height: 1600,
        // backgroundColor: '#eeeeee'
    },
});

export default HomeScreen;