import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, HStack, NativeBaseProvider, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import apiClient from '../api/apiClient';

const GalleryScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [allImages, setAllImages] = React.useState([]);

    const [zoomImage, setZoomImage] = React.useState(false);
    const [imagePath, setImagePath] = React.useState("");

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
                console.log('fromdataGallery',formdata);
                apiClient
                .post(`${BASE_URL}/get_gallery`, formdata, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        accesstoken: `${AccessToken}`,
                        useraccesstoken: JSON.parse(val).token
                    },
                }).then(response => {
                    return response;
                })
                .then((responseJson) => {
                        console.log("get_gallery:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setAllImages(responseJson.data.gallery_list);
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
                        console.log("get_gallery Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const openImage = (path) => {
        setLoading(true);
        setImagePath(path);
        setTimeout(function () {
            setLoading(false);
            setZoomImage(true);
        }, 500);
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Gallery")}
                colorTheme={colorTheme}
            />
            <Box flex={1} bg={"#F1F1F1"}>
                {/* <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Gallery")}</Text>
                    </HStack>
                </HStack> */}
                <ScrollView>
                    <Box padding={5}>
                        <VStack backgroundColor={'#ffffff'} p={3} borderRadius={10} overflow={'hidden'}>
                            {allImages.length == 0 ?
                                <Stack space={5} style={[styles.productbox, { height: 350, width: '100%', margin: 0, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
                                    <Icon name="hourglass-outline" size={80} color="#999999" />
                                    <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                    <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                                </Stack>
                                :
                                <HStack flexWrap='wrap'>
                                    {allImages.map((item, index) =>
                                        <Pressable key={index} style={styles.productbox} onPress={() => openImage(item.display_image)}>
                                            <Box style={styles.productimage}>
                                                <Image source={{ uri: item.display_image }} style={{ width: '100%', height: 100 }} resizeMode='cover' />
                                                <Box style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 2, position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                                                    <Text fontSize='xs' color={"#ffffff"} textAlign="center">{item.name}</Text>
                                                </Box>
                                            </Box>
                                        </Pressable>
                                    )}
                                </HStack>
                            }
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
            {zoomImage && (
                <VStack flex={1} style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 99, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: imagePath }} style={{ width: '90%', height: 400, marginBottom: 20, resizeMode: 'contain' }} />
                    <TouchableOpacity onPress={() => setZoomImage(false)}>
                        <Icon name="close-circle-outline" size={32} color="#ffffff" />
                    </TouchableOpacity>
                </VStack>
            )}
        </NativeBaseProvider>

    )
}

const styles = StyleSheet.create({
    productbox: { borderRadius: 8, width: '31.33%', margin: '1%', backgroundColor: '#eeeeee', overflow: 'hidden' },
    productimage: { borderColor: '#dddddd', backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 10, width: '100%', height: 100, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default GalleryScreen;
