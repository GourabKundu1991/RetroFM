import { Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, AuthToken, BASE_URL } from '../auth_provider/Config';
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import LinearGradient from 'react-native-linear-gradient';
import Events from '../auth_provider/Events';
import moment from 'moment';

//import PushControllerService from '../auth_provider/PushController';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';
import FastImage from 'react-native-fast-image';

import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
const adUnitId = 'ca-app-pub-7993937625809320/8111248986';

const HomeScreen = ({ navigation }) => {

    //PushControllerService({ navigation });

    const BannerWidth = Dimensions.get('window').width;
    const BannerHeight = 250;

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [allCategories, setAllCategories] = React.useState([]);
    const [selectedCate, setSelectedCate] = React.useState("");

    const [subCategories, setSubCategories] = React.useState([]);

    const [allBanners, setAllBanners] = React.useState([]);
    const timerIntervalRef = React.useRef(null);
    const [timeLeft, setTimeLeft] = React.useState('');

    const [allAuthor, setAllAuthor] = React.useState([]);

    const [isImageLoading, setIsImageLoading] = React.useState(false);

    const [showAd, setShowAd] = React.useState(false);

    const [saturdayNight, setSaturdayNight] = React.useState("");
    const [subcriptionPOP, setSubcriptionPOP] = React.useState(true);
    const [subcriptionImage, setSubcriptionImage] = React.useState("");

    const [searchText, setSearchText] = React.useState("");


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
            <View key={index}>
                <TouchableOpacity onPress={() => goBannerDetails(item)} style={{ position: 'relative' }}>
                    <Image style={{ width: '100%', height: 250, resizeMode: 'stretch' }} source={item.banner_image ? { uri: item.banner_image } : require('../assets/images/noimage.png')} />
                    <Box style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', top: 0, left: 0 }}>
                        <Icon name="play-circle" size={70} color="#ffffff" />
                    </Box>
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
            getAllCate();
        });
        return unsubscribe;
    }, []);

    const getAllCate = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("location", "home");
                apiClient
                    .post(`${BASE_URL}/get-all-category`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Category:", responseJson);
                        if (responseJson.status == true) {
                            setAllCategories(responseJson.details);
                            getAuthor();
                        } else {
                            setLoading(false);
                            Toast.show({ description: responseJson.message });
                            if (responseJson.access_token_expired == true) {
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Category Error:", error);
                    });
            }
        })
    }

    const getAuthor = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("page", "");
                formdata.append("authorId", "");
                apiClient
                    .post(`${BASE_URL}/get-authors`, "", {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Author:", responseJson);
                        if (responseJson.status == true) {
                            setAllAuthor(responseJson.details);
                            getHomeData(selectedCate);
                        } else {
                            setLoading(false);
                            Toast.show({ description: responseJson.message });
                            if (responseJson.access_token_expired == true) {
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Author Error:", error);
                    });
            }
        })
    }

    const getHomeData = (cateId) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                Events.publish('profileData', JSON.parse(val));
                let formdata = new FormData();
                formdata.append("page", "");
                formdata.append("category", cateId);
                formdata.append("sub_category_id", "");
                formdata.append("home", cateId == "" ? 1 : 2);
                apiClient
                    .post(`${BASE_URL}/get-home-data`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {

                        console.log("Home:", responseJson);
                        if (responseJson.status == true) {
                            setSubCategories(responseJson.details);
                            Events.publish('mainMenu', responseJson.menu_details);
                            setAllBanners(responseJson.banner_details);
                            setSaturdayNight(responseJson.saturday_night);
                            setLoading(false);
                            const duration = responseJson.totalDuration || (20 * 60 * 1000) + (21 * 1000);
                            liveTimer(duration);
                            setSubcriptionPOP(responseJson.subscribed);
                            setSubcriptionImage(responseJson.home_page_promotional_banner);
                            //getBanner();
                        } else {
                            setLoading(false);
                            Toast.show({ description: responseJson.message });
                            if (responseJson.access_token_expired == true) {
                                AsyncStorage.clear();
                                navigation.navigate('Login');
                            }
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("Home Error:", error);
                    });
            }
        })
    }

    // 1. Updated helper function to receive and use the dynamic duration from the API
    const getNextSaturdayTarget = (audioDurationMs) => {
        const now = new Date();
        const target = new Date();

        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        let daysRemaining = (6 - currentDay + 7) % 7;

        target.setDate(now.getDate() + daysRemaining);
        target.setHours(22, 0, 0, 0); // Base target is Saturday 10:00:00 PM

        const eventEndTimestamp = target.getTime() + audioDurationMs;

        // Advance the anchor forward by 1 week only if we have fully cleared the current playing track window
        if (now.getTime() > eventEndTimestamp) {
            target.setDate(target.getDate() + 7);
        }

        return target.getTime();
    };

    const liveTimer = (timer) => {
        // 2. Clear any old intervals from a previous banner fetch to avoid multiple parallel countdown loops
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        let targetTime = getNextSaturdayTarget(timer);

        const updateTimer = () => {
            const now = new Date().getTime();
            const eventEndTimestamp = targetTime + timer;

            // Roll over to the next week's Saturday target
            if (now > eventEndTimestamp) {
                targetTime = getNextSaturdayTarget(timer);
            }

            let difference = targetTime - now;

            // State management during active playback window
            if (difference <= 0) {
                const audioElapsedMs = now - targetTime;
                const audioRemainingMs = timer - audioElapsedMs;

                if (audioRemainingMs > 0) {
                    const am = Math.floor((audioRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
                    const as = Math.floor((audioRemainingMs % (1000 * 60)) / 1000);

                    const formattedM = String(am).padStart(2, '0');
                    const formattedS = String(as).padStart(2, '0');

                    setTimeLeft(`Audio Ends In: 00:${formattedM}:${formattedS}`);
                    return;
                }
            }

            // Standard countdown calculation logic
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            const d = String(days).padStart(2, '0');
            const h = String(hours).padStart(2, '0');
            const m = String(minutes).padStart(2, '0');
            const s = String(seconds).padStart(2, '0');

            if (days > 0) {
                setTimeLeft('Next Live' + " " + `${d}d ${h}h ${m}m ${s}s`); // 3. Fixed 'hh' typo to prevent reference crash
            } else {
                setTimeLeft('Live');
            }
        };

        updateTimer();
        // Save reference to the active layout loop handler globally
        timerIntervalRef.current = setInterval(updateTimer, 1000);
    };

    // 4. Clean up loop process safely if user leaves or unmounts the view template
    React.useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    const onSelectCate = (id) => {
        setLoading(true);
        setSelectedCate(id);
        getHomeData(id);
    }


    return (
        <NativeBaseProvider>
            <VStack backgroundColor={"#000000"} flex={1}>
                <LinearGradient
                    colors={[
                        '#000000',
                        '#000000',
                        '#333333'
                    ]}
                    style={{ position: 'relative', flex: 1 }}
                >
                    <CommonHeader showMenu={true} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <Stack padding={5} space={5}>
                            <Box width={'100%'}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space={2}>
                                        <TouchableOpacity onPress={() => onSelectCate("")} style={{ backgroundColor: selectedCate == "" ? '#c90c16' : "#000000", borderColor: selectedCate == "" ? '#c90c16' : "#444444", borderWidth: 1, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, overflow: 'hidden' }}>
                                            <Text color={selectedCate == "" ? '#ffffff' : "#666666"} fontSize="sm" fontWeight="medium">All</Text>
                                        </TouchableOpacity>
                                        {allCategories.map((item, index) =>
                                            <TouchableOpacity key={index} onPress={() => onSelectCate(item.categoryId)} style={{ backgroundColor: selectedCate == item.categoryId ? '#c90c16' : "#000000", borderColor: selectedCate == item.categoryId ? '#c90c16' : "#444444", borderWidth: 1, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10, overflow: 'hidden' }}>
                                                <Text color={selectedCate == item.categoryId ? '#ffffff' : "#666666"} fontSize="sm" fontWeight="medium">{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </HStack>
                                </ScrollView>
                            </Box>
                            <Carousel
                                loop
                                autoPlay
                                autoPlayInterval={1500}
                                width={BannerWidth}
                                height={BannerHeight}
                                data={allBanners}
                                style={{ alignSelf: 'center' }}
                                renderItem={renderBanner}
                            />
                            <Box width={'100%'} backgroundColor={"#000000"} style={{ borderWidth: 3, borderColor: '#666666', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                                <Image
                                    style={{ width: '100%', height: 150, resizeMode: 'stretch' }}
                                    source={{ uri: saturdayNight.saturday_night_banner }}
                                />
                                <View style={{ backgroundColor: '#c90c16', position: 'absolute', bottom: 15, left: 15, paddingHorizontal: 15, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' }}>
                                    <Text color={"#ffffff"} fontSize="sm">{timeLeft}{/* {saturdayNight.saturday_night_date} */}</Text>
                                </View>
                            </Box>
                        </Stack>
                        {showAd && (
                            <View style={{ marginTop: 5 }}>
                                <BannerAd
                                    unitId={adUnitId}
                                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                                    requestOptions={{
                                        requestNonPersonalizedAdsOnly: true,
                                    }}
                                    onAdLoaded={() => setShowAd(true)}
                                    onAdFailedToLoad={() => setShowAd(false)}
                                />
                            </View>
                        )}
                        <Stack padding={5} space={5} paddingBottom={10}>
                            <VStack space={2}>
                                <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                    <Text color={"#ffffff"} fontSize="md">{t("Authors")}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('AuthorList')}><Text color={"#c90c16"} fontSize="xs">{t("See More")}</Text></TouchableOpacity>
                                </HStack>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <HStack space={3}>
                                        {allAuthor.slice(0, 10).map((item, index) =>
                                            <TouchableOpacity key={index} style={{ width: 60 }} onPress={() => navigation.navigate("AuthorDetails", { "authorId": item.id })}>
                                                <VStack space={2}>
                                                    <Box width={'100%'} style={{ borderWidth: 2, borderColor: '#666666', borderRadius: 50, overflow: 'hidden', position: 'relative' }}>
                                                        <FastImage
                                                            style={{
                                                                width: '100%',
                                                                height: 60,
                                                            }}
                                                            source={{
                                                                uri: item.image,
                                                                priority: FastImage.priority.high,
                                                            }}
                                                            resizeMode={FastImage.resizeMode.cover}
                                                            onLoadStart={() => setIsImageLoading(true)}
                                                            onLoadEnd={() => setIsImageLoading(false)}
                                                        />
                                                        {isImageLoading && (
                                                            <Box style={{ position: 'absolute', zIndex: 9, alignItems: 'center', justifyContent: 'center', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: '#000000' }}>
                                                                <ActivityIndicator animating={isImageLoading} size="small" color="#fc030b" />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </VStack>
                                            </TouchableOpacity>
                                        )}
                                    </HStack>
                                </ScrollView>
                            </VStack>
                            <Stack width={'100%'} space={5}>
                                {subCategories.map((item, index) =>
                                    <VStack key={index} space={2}>
                                        <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                            <Text color={"#ffffff"} fontSize="md">{item.name}</Text>
                                            {item.see_more && (
                                                <TouchableOpacity onPress={() => navigation.navigate("StoryList", { "CateId": item.id })}><Text color={"#c90c16"} fontSize="xs">{t("See More")}</Text></TouchableOpacity>
                                            )}
                                        </HStack>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <HStack space={3}>
                                                {item.series.map((subitem, subindex) =>
                                                    <TouchableOpacity key={subindex} style={{ width: 100 }}>
                                                        <VStack space={2}>
                                                            <Box width={'100%'} style={{ borderWidth: 2, borderColor: '#666666', borderRadius: 15, overflow: 'hidden', position: 'relative' }}>
                                                                <FastImage
                                                                    style={{
                                                                        width: '100%',
                                                                        height: 100,
                                                                    }}
                                                                    source={{
                                                                        uri: subitem.image1,
                                                                        priority: FastImage.priority.high,
                                                                    }}
                                                                    resizeMode={FastImage.resizeMode.cover}
                                                                    onLoadStart={() => setIsImageLoading(true)}
                                                                    onLoadEnd={() => setIsImageLoading(false)}
                                                                />
                                                                {isImageLoading && (
                                                                    <Box style={{ position: 'absolute', zIndex: 9, alignItems: 'center', justifyContent: 'center', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: '#000000' }}>
                                                                        <ActivityIndicator animating={isImageLoading} size="small" color="#fc030b" />
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                            <Text color={"#ffffff"} fontSize="sm">{subitem.name.slice(0, 10)} {subitem.name.length > 12 && ("...")}</Text>
                                                            <View style={{ backgroundColor: "#333333", width: 80, borderWidth: 0, paddingHorizontal: 10, borderRadius: 8, overflow: 'hidden' }}>
                                                                <Text color={"#ffffff"} fontSize="xs">{subitem.playes} Plays</Text>
                                                            </View>
                                                        </VStack>
                                                    </TouchableOpacity>
                                                )}
                                            </HStack>
                                        </ScrollView>
                                    </VStack>
                                )}
                            </Stack>
                        </Stack>

                    </ScrollView>

                    <BottomTabs selected={0} />
                </LinearGradient>
            </VStack>
            {!subcriptionPOP && (
                <View style={styles.spincontainer}>
                    <Button backgroundColor={"#eeeeee"} style={{ borderRadius: 30, overflow: 'hidden', height: 40, width: 40, position: 'absolute', right: 30, top: 15 }} size="xs" marginTop={5} onPress={() => setSubcriptionPOP(true)}>
                        <Text color="#000000" fontSize="2xl" lineHeight={10}>X</Text>
                    </Button>
                    <Pressable onPress={() => navigation.navigate('MySubscription', { "pageroot": false })}>
                        <Image source={{ uri: subcriptionImage }} width={300} height={480} resizeMode='cover' style={{ borderRadius: 20, overflow: 'hidden' }} />
                    </Pressable>
                </View>
            )}
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#fc030b" />
                </View>
            )}
            {/* <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
            )} */}
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    linkbox: { borderRadius: 20, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
    /* sliderbanner: {
        //width: '96%',
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
    } */
});

export default HomeScreen;