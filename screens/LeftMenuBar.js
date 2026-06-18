import { Avatar, Box, HStack, NativeBaseProvider, Pressable, Stack, Text, VStack, View } from 'native-base';
import React, { useEffect } from 'react';
import { Alert, Image, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import Events from '../auth_provider/Events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const LeftMenuBarScreen = () => {

    const navigation = useNavigation();

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [colorTheme, setColorTheme] = React.useState("");

    const [mainMenu, setMainMenu] = React.useState([]);
    const [profileData, setProfileData] = React.useState([]);
    const [profilePic, setProfilePic] = React.useState("");
    const [pointData, setPointData] = React.useState([]);
    const [userType, setUserType] = React.useState("");

    useEffect(() => {
        Events.subscribe('mainMenu', (data) => {
            setMainMenu(data);
        });
        Events.subscribe('profileData', (data) => {
            setProfileData(JSON.parse(data).profile);
            if (JSON.parse(data).profile.profile_pic) {
                setProfilePic(JSON.parse(data).profile.BaseUrl + JSON.parse(data).profile.profile_pic);
            }
            setPointData(JSON.parse(data).points);
        });
        Events.subscribe('colorTheme', (data) => {
            setColorTheme(data);
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
                        AsyncStorage.clear();
                        navigation.dispatch(DrawerActions.closeDrawer());
                        navigation.navigate('Welcome');
                    }
                }
            ],
            { cancelable: false }
        );
    }

    return (
        <NativeBaseProvider>
            <Box flex={1} bg="white" overflow="hidden">
                {(colorTheme) && (
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
                )}
                <ScrollView showsVerticalScrollIndicator={false}>
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
                    {/* <Box style={{ position: 'absolute', bottom: 5, right: 5 }}> */}
                    <ImageBackground source={require('../assets/images/background.png')} imageStyle={{ resizeMode: 'cover', opacity: 0.25 }} style={{ height: 150, width: '100%' }}>
                        <Box alignItems={'center'} pb={4} pr={2}>
                            <Image source={require('../assets/images/logo.png')} style={{ width: 120, height: 60, resizeMode: 'contain' }} />
                        </Box>
                    </ImageBackground>
                </ScrollView>
            </Box>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    icon: { width: 60, height: 60, resizeMode: 'cover' },
    okbtn: { backgroundColor: '#f9d162', borderRadius: 50, overflow: 'hidden', width: '80%', justifyContent: 'center', alignItems: 'center', height: 45 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
});

export default LeftMenuBarScreen;