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

const CommentsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [commentList, setCommentList] = React.useState([]);

    const [isImageLoading, setIsImageLoading] = React.useState(false);

    const [commentTerm, setCommentTerm] = React.useState("");

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
            console.log(route.params.seriesId, route.params.episodeId);
        });
        return unsubscribe;
    }, []);

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("episodeId", "");
                formdata.append("seriesId", route.params.seriesId);
                apiClient
                    .post(`${BASE_URL}/fetch-comment`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {

                        console.log("comment:", responseJson);
                        if (responseJson.status == true) {
                            setCommentList(responseJson.details);
                            setLoading(false);
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
                        console.log("Story Error:", error);
                    });
            }
        })
    }

    const onLike = (itemID) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("commentId", itemID);
                apiClient
                    .post(`${BASE_URL}/like-comment`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Like comment:", responseJson);
                        if (responseJson.status == true) {
                            getAllData();
                            setLoading(false);
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
                        console.log("Story Error:", error);
                    });
            }
        })
    }

    const onDisLike = (itemID) => {
        setLoading(true);
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("commentId", itemID);
                apiClient
                    .post(`${BASE_URL}/dislike-comment`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Dislike comment:", responseJson);
                        if (responseJson.status == true) {
                            getAllData();
                            setLoading(false);
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
                        console.log("Story Error:", error);
                    });
            }
        })
    }

    const onSend = () => {
        if (commentTerm.trim() == '') {
            Toast.show({ description: t("Please enter Comment") });
        } else {
            setLoading(true);
            AsyncStorage.getItem('userToken').then(val => {
                if (val != null) {
                    let formdata = new FormData();
                    formdata.append("comment", commentTerm);
                    formdata.append("seriesId", route.params.seriesId);
                    formdata.append("episodeId", route.params.episodID);
                    console.log(formdata);
                    apiClient
                        .post(`${BASE_URL}/make-comment-in-episode`, formdata, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                authtoken: `${AuthToken}`,
                                accesstoken: JSON.parse(val).access_token
                            },
                        }).then(response => {
                            return response.data;
                        })
                        .then((responseJson) => {
                            console.log("Make comment:", responseJson);
                            if (responseJson.status == true) {
                                Toast.show({ description: responseJson.message });
                                getAllData();
                                setLoading(false);
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
                            console.log("Story Error:", error);
                        });
                }
            })
        }
    }

    /* Make comment in episode: 
    URL :  /make-comment-in-episode
    Headers : 
        authtoken:!RetroFM@2023!=&audio$
        accesstoken: a350337d2fa0b007c1fa7a0ec293e0b8:OEVBb3NMbG13NFlVb3cxMkRIUFZKQU0rUkx5N1lnN1RuSm1Tc3VzTWZjVT0=
    Payload :
        episodeId:3
        seriesId:12
        comment:Wowww
 */
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
                    <CommonHeader showBack={true} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <Stack padding={5} space={5}>
                            <VStack space={2}>
                                <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                    <Text color={"#ffffff"} fontSize="lg">Comments</Text>
                                </HStack>
                                <VStack flexWrap={'wrap'} justifyContent={'center'}>
                                    {commentList.map((item, index) =>
                                        <Pressable key={index} style={{ width: '100%', paddingVertical: 15, borderBottomWidth: commentList.length == index + 1 ? 0 : 1, borderColor: '#555555' }}>
                                            <HStack space={4}>
                                                <VStack style={{ width: '25%' }}>
                                                    <Box width={'100%'} style={{ borderWidth: 2, borderColor: '#666666', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                                                        <FastImage
                                                            style={{
                                                                width: '100%',
                                                                height: 80,
                                                            }}
                                                            source={{
                                                                uri: item.profile_image,
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
                                                <VStack style={{ width: '65%' }} space={1}>
                                                    <Text color={"#ffffff"} fontSize="sm">{item.comment}</Text>
                                                    <HStack space={2} justifyContent={'space-between'} alignItems={'center'}>
                                                        <Text color={"#999999"} fontSize="xs">Commented By: {item.name}</Text>
                                                        <Text color={"#999999"} fontSize="xs">{item.date}</Text>
                                                    </HStack>
                                                    <HStack marginTop={2} space={2} justifyContent={'space-between'} alignItems={'center'}>
                                                        <HStack space={2} justifyContent={'center'} alignItems={'center'} style={{ paddingVertical: 1, paddingHorizontal: 5, width: 60, backgroundColor: 'green', overflow: 'hidden', borderRadius: 10 }}>
                                                            <Text color={"#ffffff"} fontSize="sm" fontWeight={'bold'}>{item.rating}</Text>
                                                            <Icon name="star" size={16} color="yellow" />
                                                        </HStack>
                                                        <HStack space={2} justifyContent={'center'} alignItems={'center'}>
                                                            <Pressable onPress={() => onLike(item.id)}>
                                                                <HStack space={1} alignItems={'center'}>
                                                                    <Icon name={item.like == true ? "thumbs-up" : "thumbs-up-outline"} size={20} color="#fc030b" />
                                                                    <Text color={"#ffffff"} fontSize="xs">{item.total_like} Like</Text>
                                                                </HStack>
                                                            </Pressable>
                                                            <Pressable onPress={() => onDisLike(item.id)}>
                                                                <HStack space={1} alignItems={'center'}>
                                                                    <Icon name={item.dislike == true ? "thumbs-down" : "thumbs-down-outline"} size={20} color="#fc030b" />
                                                                    <Text color={"#ffffff"} fontSize="xs">{item.total_dislike} Dislike</Text>
                                                                </HStack>
                                                            </Pressable>
                                                        </HStack>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </Pressable>
                                    )}
                                </VStack>
                            </VStack>

                        </Stack>

                    </ScrollView>
                    {route.params.episodID !== "" && (
                        <View style={[styles.inputbox, { width: '94%', margin: '3%' }]}>
                            <Input
                                size="md"
                                multiline
                                style={{ height: 60, color: '#ffffff' }}
                                value={commentTerm}
                                onChangeText={(text) => setCommentTerm(text)}
                                InputRightElement={<Pressable onPress={() => onSend()}><Icon name="send" size={20} color={'#fc030b'} /></Pressable>}
                                variant="unstyled"
                                placeholder={t("Enter Comments")}
                            />
                        </View>
                    )}
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
    inputbox: { borderRadius: 10, overflow: 'hidden', height: 60, paddingHorizontal: 10, borderWidth: 1, borderColor: '#444444' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }
});

export default CommentsScreen;