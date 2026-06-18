import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actionsheet, Avatar, Box, Center, Divider, HStack, NativeBaseProvider, Stack, Text, Toast, VStack, useDisclose } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const ProfileScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [profileDetails, setProfileDetails] = React.useState("");
    const [profilePic, setProfilePic] = React.useState("");
    const [pointDetails, setPointDetails] = React.useState("");

    const { isOpen, onOpen, onClose } = useDisclose();

    const [imageBase, setImageBase] = React.useState("");

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
                    setImageBase(JSON.parse(val).BaseUrl);
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
                        console.log("Profile:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setProfileDetails(responseJson.data.profile);
                            setProfilePic(responseJson.data.profile.BaseUrl + responseJson.data.profile.profile_pic);
                            setPointDetails(responseJson.data.points);
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
                        console.log("Profile Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }


    const openProfilePicker = (type) => {
        onClose();
        if (type == "library") {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response);
                    if (response.assets != undefined) {
                        saveProfileImage(response.assets[0].base64);
                    }
                },
            )
        } else if (type == "camera") {
            launchCamera(
                {
                    mediaType: 'photo',
                    includeBase64: true,
                    maxHeight: 1500,
                    maxWidth: 1500,
                },
                (response) => {
                    //console.log(response.assets);
                    if (response.assets != undefined) {
                        saveProfileImage(response.assets[0].base64);
                    }
                },
            )
        }
    }

    const saveProfileImage = (imageBase) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("profileimage", imageBase);
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/change_profile_image`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        //console.log("Profile Pic:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            Toast.show({ description: responseJson.data.message });
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
                        //console.log("Profile Pic Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Login');
            }
        });
    }
    const pfSize = 110;

    const LabelValue = ({ label, value }) => {
        return (
            <HStack space={1.5} alignItems={'center'}>
                <Text fontSize={'xs'} fontWeight={'bold'} color={'#707274'}>{label}:</Text>
                <Text fontSize={'xs'} color={'#707274'}>{value}</Text>
            </HStack>
        )
    }

    const LabelValueNew = ({ label, value }) => {
        return (
            <HStack space={1.5} alignItems={'center'}>
                <Text fontSize={'xs'} color={'#707274'}>{label}:</Text>
                <Text fontSize={'xs'} fontWeight={'bold'} color={'#707274'}>{value}</Text>
            </HStack>
        )
    }

    const HeaderContent = () => {
        return (
            <Box>
                <Box height={150} bgColor={colorTheme?.normal}>
                    <Box style={{ position: 'absolute', bottom: -pfSize * 0.4, alignSelf: 'center' }}>
                        <Avatar
                            bgColor={'#FFFFFF'}
                            size={pfSize}
                        >
                            <Avatar
                                bgColor={colorTheme?.dark}
                                size={pfSize - 10} p={1.5}
                                source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')}
                            />
                        </Avatar>
                        <Pressable onPress={onOpen} style={{ position: 'absolute', bottom: 10, right: 0 }}>
                            <Avatar size={28} bgColor={colorTheme?.normal}>
                                <Icon name='camera' size={16} color='#FFFFFF' />
                            </Avatar>
                        </Pressable>
                    </Box>
                </Box>
                <Center>
                    <Text fontSize={'md'} fontWeight={'bold'} mt={12}>{profileDetails?.firstName + ' ' + profileDetails?.lastName}</Text>
                    <LabelValue label={t('Member ID')} value={profileDetails?.ID} />
                    <LabelValueNew label={t('Current Tire')} value={profileDetails?.tier} />
                </Center>
            </Box>
        );
    }

    const CountItem = ({ label, value }) => {
        return (
            <VStack width={'50%'} minHeight={60}>
                <Text fontSize={'md'} fontWeight={'bold'} textAlign={'center'}>{value}</Text>
                <Text fontSize={'xs'} textAlign={'center'}>{label}</Text>
            </VStack>
        );
    }

    const CountContent = () => {
        return (
            <LinearGradient
                colors={['#d29b24', '#f9e053', '#d29b24']}
                style={{ marginTop: 10, width: '98%', marginHorizontal: '1%', padding: 5, borderRadius: 10, paddingVertical: 15, position: 'relative' }}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <Text style={{left: 20}} fontWeight={'bold'} fontSize={'lg'} >{profileDetails?.tier}</Text>
                <Divider my={1} thickness={1} bgColor={'#d29b24'} />
                <Image source={profileDetails.tier_badge ? { uri: imageBase + profileDetails.tier_badge } : require('../assets/images/badge.png')} style={{ width: 45, height: 45, resizeMode: 'contain', position: 'absolute', right: 20, top: 5 }} />
                <HStack mt={1} width={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                    <CountItem label={t('Total Points')} value={profileDetails?.total_point} />
                    <Divider orientation='vertical' thickness={1} bgColor={'#d29b24'} />
                    <CountItem label={t('"Available for Redemption')} value={pointDetails?.available_point} />
                </HStack>
            </LinearGradient>
        );
    }

    const menuList = [
        { id: 1, label: t('Profile Details'), icon: require('../assets/images/profile_details.png'), route: 'ProfileDetails' },
        { id: 2, label: t('Point Statement'), icon: require('../assets/images/state_ment.png'), route: 'PointStatement' },
        { id: 2, label: t('Incentive Statement'), icon: require('../assets/images/sales_data.png'), route: 'IncentiveStatement' },
        { id: 3, label: t('TDS Certificate'), icon: require('../assets/images/state_ment.png'), route: 'From16List' },
        { id: 4, label: t('Gift Vouchers'), icon: require('../assets/images/voucher.png'), route: 'MyGiftVouchers' },
        { id: 6, label: t('Language Change'), icon: require('../assets/images/language_new.png'), route: 'Language' },
    ];

    const MenuItem = ({ item }) => {
        return (
            <Pressable onPress={() => navigation.navigate(item?.route)}>
                <Box width={110} px={6} py={3} mb={4} borderRadius={10} justifyContent={'center'} alignItems={'center'} bgColor={'#FFFFFF'} >
                    <Avatar size={60} backgroundColor={'#EEEEEE'}>
                        <Image source={item?.icon} style={{ width: 30, height: 30, tintColor: colorTheme?.normal }} />
                    </Avatar>
                    <Text mt={2} fontSize={'xs'} lineHeight={'xs'} textAlign={'center'} width={70}>{item?.label}</Text>
                </Box>
            </Pressable>
        )
    }

    const MenuContent = () => {
        return (
            <HStack mt={6} style={{ flexWrap: 'wrap', paddingHorizontal: 20 }} justifyContent={'center'} space={2}>
                {menuList.map((item, index) => (
                    <MenuItem key={index} item={item} />
                ))}
            </HStack>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("My Profile")}
                colorTheme={colorTheme}
            />
            <Box flex={1} bg={"#F1F1F1"}>
                <ScrollView>
                    {(profileDetails) && (
                        <>
                            <HeaderContent />
                            <CountContent />
                            <MenuContent />
                        </>
                    )}
                </ScrollView>
            </Box>
            <BottomTabs
                selected={3}
                colorTheme={colorTheme}
            />
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#42bb52" />
                </View>
            )}
            <Actionsheet isOpen={isOpen} onClose={onClose}>
                <Actionsheet.Content>
                    <Text color="#666666" fontSize="md" textAlign="center">{t("Select Image Source")}</Text>
                    <Actionsheet.Item onPress={() => openProfilePicker("library")}>{t("Load from Library")}</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => openProfilePicker("camera")}>{t("Use Camera")}</Actionsheet.Item>
                    <Actionsheet.Item onPress={() => openProfilePicker("cancel")}>{t("Cancel")}</Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>
        </NativeBaseProvider>
    )
}

const styles = StyleSheet.create({
    avatar: { elevation: 10, marginVertical: 20, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 10, borderColor: "#ffffff", borderWidth: 4, backgroundColor: '#ffffff' },
    avatarCamera: { position: 'absolute', bottom: 18, right: 0, width: 38, height: 38, borderRadius: 40, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    listview: { marginVertical: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 30, overflow: 'hidden', borderColor: '#cccccc', borderWidth: 2 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default ProfileScreen;
