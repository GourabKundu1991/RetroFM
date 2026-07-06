import { Avatar, Box, HStack, NativeBaseProvider, Pressable, Stack, Text, VStack, View } from 'native-base';
import React, { useEffect } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import Events from '../auth_provider/Events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { AuthToken, BASE_URL } from '../auth_provider/Config';
import apiClient from '../api/apiClient';

const LeftMenuBarScreen = () => {

    const navigation = useNavigation();

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');

    const [mainMenu, setMainMenu] = React.useState([]);
    const [profileData, setProfileData] = React.useState({});
    const [profilePic, setProfilePic] = React.useState("");

    useEffect(() => {
        Events.subscribe('mainMenu', (data) => {
            setMainMenu(data);
        });
        Events.subscribe('profileData', (data) => {
            console.log('profileData: ', data.name);
            setProfileData(data);
        });
    }, []);

    const onLogout = () => {
        Alert.alert(
            t("Alert"),
            t("Are you sure to logout") + "?",
            [
                {
                    text: t("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: t("Yes"), onPress: () => {
                        let formdata = new FormData();
                        formdata.append("phone", profileData.phone);
                        apiClient
                            .post(`${BASE_URL}/log-out`, formdata, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    authtoken: `${AuthToken}`,
                                    accesstoken: profileData.access_token
                                },
                            }).then(response => {
                                return response.data;
                            })
                            .then((responseJson) => {
                                console.log("Logout:", responseJson);
                                if (responseJson.status == true) {
                                    AsyncStorage.clear();
                                    navigation.dispatch(DrawerActions.closeDrawer());
                                    navigation.navigate('Login');
                                }
                            })
                            .catch((error) => {
                                setLoading(false);
                                console.log("Logout Error:", error);
                            });
                    }
                }
            ],
            { cancelable: false }
        );
    }

    return (
        <NativeBaseProvider>
            <VStack backgroundColor={"#000000"} flex={1}>
                <LinearGradient
                    colors={[
                        '#111111',
                        '#333333'
                    ]}
                    style={{ position: 'relative', flex: 1 }}
                >
                    <ImageBackground source={require('../assets/images/bannerbg.jpeg')}>
                        <VStack backgroundColor={'rgba(0, 0, 0, 0.8)'} style={{ paddingVertical: 30, paddingHorizontal: 20 }}>
                            <HStack alignItems={'center'} space={1}>
                                <Stack width={'35%'}>
                                    <Box justifyContent={'center'} alignItems={'center'} width={90} height={90} borderRadius={45} bgColor={'#FFFFFF'}>
                                        <Image source={{ uri: profileData.image }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: "#cccccc" }} />
                                    </Box>
                                </Stack>
                                <VStack width={'60%'}>
                                    <Text color={'white'} fontSize={'md'} fontWeight={'bold'}>{profileData.name}</Text>
                                    <Text fontSize={'xs'} color={'white'} textTransform={'lowercase'}>{profileData.email}</Text>
                                    <Text color={'white'} fontSize={'xs'}>{profileData.phone}</Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </ImageBackground>
                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <Stack px={4} mt={5} pb={10}>
                            {mainMenu.map((item, index) =>
                                <Pressable key={index} onPress={() => item.type == "logout" ? onLogout() : navigation.navigate(item.page_url, {"pageroot": false})} borderColor="#333333" borderBottomWidth="1" padding={3}>
                                    <Text color="#888888" width={220} fontSize="md" textTransform={"capitalize"}>{item.name}</Text>
                                </Pressable>
                            )}
                        </Stack>
                    </ScrollView>
                    <Box alignItems={'center'} pb={4} pr={2}>
                        <Image source={require('../assets/images/logo.png')} style={{ width: 120, height: 60, resizeMode: 'contain' }} />
                    </Box>
                </LinearGradient>
            </VStack>
            {/* {(colorTheme) && (
                    <Stack backgroundColor={colorTheme.normal}>
                        <ImageBackground source={require('../assets/images/back.png')} style={{ paddingTop: 50, paddingHorizontal: 10, paddingBottom: 30 }}>
                            <VStack>
                                <HStack alignItems={'center'} space={2}>
                                    <Stack>
                                        <Box justifyContent={'center'} alignItems={'center'} width={90} height={90} borderRadius={45} bgColor={'#FFFFFF'}>
                                            <Image source={profilePic ? { uri: profilePic } : require('../assets/images/avatar.png')} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: colorTheme?.dark }} />
                                        </Box>
                                        <Image source={profileData.tier_badge ? { uri: profileData.BaseUrl + profileData.tier_badge } : require('../assets/images/badge.png')} style={{ width: 40, height: 40, position: 'absolute', bottom: -15, left: 27 }} />
                                    </Stack>
                                    <VStack>
                                        <Text color={'white'} fontWeight={'bold'}>{profileData.firstName} {profileData.lastName}</Text>
                                        <Text fontSize={'xs'} color={'white'}>{t("ID")}: {profileData.ID}</Text>
                                        <Text color={'white'} fontSize={'xs'}>{profileData.tier} Tier</Text>
                                    </VStack>
                                </HStack>
                            </VStack>
                        </ImageBackground>
                    </Stack>
                )} */}
            {/* <ScrollView showsVerticalScrollIndicator={false}>
                    <Stack px={4} mt={5} pb={10}>
                        {mainMenu.map((item, index) =>
                            <Pressable key={index} onPress={() => navigation.navigate(item.url)} borderColor="#cccccc" borderBottomWidth="1" paddingY={1.5}>
                                <HStack space={5} alignItems="center">
                                    <Icon name={item.icon} size={16} color="#aaaaaa" />
                                    <Text color="#000000" width={220} fontSize="xs" textTransform={"capitalize"}>{item.title}</Text>
                                </HStack>
                            </Pressable>
                        )}
                        <Pressable onPress={() => onLogout()} paddingY={1.5}>
                            <HStack space={5} alignItems="center">
                                <Icon name="power" size={16} color="#aaaaaa" />
                                <Text color="#000000" width={220} fontSize="xs">{t("Logout")}</Text>
                            </HStack>
                        </Pressable>
                    </Stack>
                    <ImageBackground source={require('../assets/images/background.png')} imageStyle={{ resizeMode: 'cover', opacity: 0.25 }} style={{ height: 150, width: '100%' }}>
                        <Box alignItems={'center'} pb={4} pr={2}>
                            <Image source={require('../assets/images/logo.png')} style={{ width: 120, height: 60, resizeMode: 'contain' }} />
                        </Box>
                    </ImageBackground>
                </ScrollView> */}
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    icon: { width: 60, height: 60, resizeMode: 'cover' },
    okbtn: { backgroundColor: '#f9d162', borderRadius: 50, overflow: 'hidden', width: '80%', justifyContent: 'center', alignItems: 'center', height: 45 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default LeftMenuBarScreen;