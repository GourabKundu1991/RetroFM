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
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';
import apiClient from '../api/apiClient';
import FastImage from 'react-native-fast-image';

const DownloadScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [allList, setAllList] = React.useState([]);
    const [isImageLoading, setIsImageLoading] = React.useState(false);

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
            getAllData();
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('downloadData').then(val => {
            if (val != null) {
                console.log("Download Data List:", val);
                setLoading(false);
                setAllList(JSON.parse(val));
            } else {
                setLoading(false);
                setAllList([]);
            }
        })
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
                    <CommonHeader showBack={true} search={false} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <VStack padding={5} space={5}>
                            <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                <Text color={"#ffffff"} fontSize="lg">{t("My Download")}</Text>
                            </HStack>
                            {allList.length == 0 && (
                                <VStack justifyContent={'center'} alignItems={'center'} style={{ width: '100%', height: 300, backgroundColor: '#111111', borderRadius: 20, overflow: 'hidden', paddingVertical: 20 }}>
                                    <Text textAlign={'center'} color={"#666666"} fontSize="sm" fontWeight="medium">{t("No Record Found")}</Text>
                                </VStack>
                            )}
                            <VStack flexWrap={'wrap'} justifyContent={'center'}>
                                {allList.map((item, index) =>
                                    <Pressable key={index} onPress={() => navigation.navigate("PlayDownload", { "story": item })} style={{ width: '100%', paddingVertical: 15, borderBottomWidth: allList.length == index + 1 ? 0 : 1, borderColor: '#555555' }}>
                                        <HStack space={4}>
                                            <VStack style={{ width: '40%' }}>
                                                <Box width={'100%'} style={{ borderWidth: 2, borderColor: '#666666', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                                                    <FastImage
                                                        style={{
                                                            width: '100%',
                                                            height: 130,
                                                        }}
                                                        source={{
                                                            uri: item.play_image,
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
                                            <VStack style={{ width: '50%' }} space={1.5}>
                                                <Text color={"#ffffff"} fontSize="sm">{item.name}</Text>
                                                <HStack space={2} justifyContent={'center'} alignItems={'center'} style={{ paddingVertical: 1, paddingHorizontal: 5, width: 60, backgroundColor: 'green', overflow: 'hidden', borderRadius: 10 }}>
                                                    <Text color={"#ffffff"} fontSize="sm" fontWeight={'bold'}>{item.average_rating}</Text>
                                                    <Icon name="star" size={16} color="yellow" />
                                                </HStack>
                                                <Text color={"#ffffff"} fontSize="sm">{item.playes} <Text color={"#888888"} fontSize="xs">Plays</Text> <Text color={"#fc030b"} fontSize="xl"> | </Text> {item.total_episode} <Text color={"#888888"} fontSize="xs">Episodes</Text></Text>
                                                <Text color={"#ffffff"} lineHeight={18} fontSize="xs">{item.description.slice(0, 90)} {item.description.length > 90 && ("...")}</Text>
                                            </VStack>
                                        </HStack>
                                    </Pressable>
                                )}
                            </VStack>
                        </VStack>
                    </ScrollView>

                    <BottomTabs selected={"-"} />
                </LinearGradient>
            </VStack>
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color="#fc030b" />
                </View>
            )}
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    linkbox: { borderRadius: 20, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default DownloadScreen;