import { Avatar, Box, Button, Center, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
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

const SearchScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [storyDetails, setStoryDetails] = React.useState("");
    const [storyList, setStoryList] = React.useState([]);

    const [isImageLoading, setIsImageLoading] = React.useState(false);

    //const [searchText, setSearchText] = React.useState("");

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            //setLoading(true);
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
            //getStory(searchText);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (route.params.searchData != "") {
                setLoading(true);
                getStory(route.params.searchData);
            } else {
                setStoryList([]);
            }
        }, 500); // debounce
    
        return () => clearTimeout(delay);
    }, [route.params.searchData]);

    const getStory = (textTerm) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("page", "1");
                formdata.append("search_text", textTerm);
                apiClient
                    .post(`${BASE_URL}/search-series`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Search:", responseJson);
                        if (responseJson.status == true) {
                            setLoading(false);
                            setStoryList(responseJson.series);
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
                        console.log("Search Error:", error);
                    });
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
                    <CommonHeader showBack={true} page={"Search"} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <Stack padding={5} space={5}>
                            <VStack space={2}>
                                <VStack flexWrap={'wrap'} justifyContent={'center'}>
                                    {storyList.length == 0 && (
                                        <VStack space={10} justifyContent={'center'} alignItems={'center'} style={{width: '100%', height: 300, backgroundColor: '#111111', borderRadius: 20, overflow: 'hidden', marginTop: 50}}>
                                        <Icon name="hourglass-outline" size={50} color="#ffffff" />
                                        <Text color={"#999999"} fontSize="lg">{t("Sorry!, Nothing Found...")}</Text>
                                        </VStack>
                                    )}
                                    {storyList.map((item, index) =>
                                        <Pressable key={index} style={{ width: '100%', paddingVertical: 15, borderBottomWidth: storyList.length == index + 1 ? 0 : 1, borderColor: '#555555' }}>
                                            <HStack space={4}>
                                                <VStack style={{ width: '40%' }}>
                                                    <Box width={'100%'} style={{ borderWidth: 2, borderColor: '#666666', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                                                        <FastImage
                                                            style={{
                                                                width: '100%',
                                                                height: 130,
                                                            }}
                                                            source={{
                                                                uri: item.image1,
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

                        </Stack>

                    </ScrollView>
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
    bg: {
        width: '100%',
        height: 180,
        alignSelf: 'center',
        resizeMode: 'cover',
        position: 'relative',
        opacity: 0.4
    },
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    linkbox: { borderRadius: 20, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default SearchScreen;