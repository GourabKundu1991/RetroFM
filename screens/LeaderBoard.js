import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Linking, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';

const LeaderBoardScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [dataList] = React.useState([
        { "name": "My Leaderboard", "url": "saarthi" },
        { "name": "Sub-Dealer Leaderboard", "url": "navgati" },
        { "name": "Influenncer Leaderboard", "url": "unnati" }
    ]);

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
                }
            });
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        setTimeout(function () {
            setLoading(false);
        }, 1000);
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Leaderboard")}
                colorTheme={colorTheme}
            />
            <Box flex={1} px={5} py={5} bg={"#F1F1F1"}>

                <Stack flex={1} backgroundColor={'#ffffff'} borderRadius={10} overflow={'hidden'}>
                    <HStack padding={10} justifyContent={'center'} flexWrap={'wrap'}>
                        <Image source={require('../assets/images/leaderboard.png')} style={{ width: '100%', height: 200, resizeMode: 'contain' }} />
                    </HStack>
                    <ScrollView>
                        <HStack padding={3} justifyContent={'center'} flexWrap={'wrap'}>
                            {dataList.map((item, index) =>
                                <Pressable style={{ width: '46%', margin: '2%', padding: 10 }} onPress={() => navigation.navigate('BoardDetails', {title: item.name, dataUrl: item.url })} key={index} justifyContent={'center'} alignItems={'center'} height={100} backgroundColor={item.name == "My Leaderboard" ? colorTheme.normal : "#F9F9F9"} borderRadius={10} overflow={'hidden'} borderColor={"#eeeeee"} borderWidth={1}>
                                    <Text textAlign={'center'} color={item.name == "My Leaderboard" ? "#ffffff" : "#111111"} fontSize="md" fontWeight="normal">{item.name}</Text>
                                </Pressable>
                            )}
                        </HStack>
                    </ScrollView>
                </Stack>
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
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default LeaderBoardScreen;
