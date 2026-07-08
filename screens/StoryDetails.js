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
import TrackPlayer, {
    Capability,
    AppKilledPlaybackBehavior,
  } from 'react-native-track-player';

const StoryDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [storyDetails, setStoryDetails] = React.useState("");
    const [episodList, setEpisodList] = React.useState([]);

    const [isImageLoading, setIsImageLoading] = React.useState(false);

    const start = async () => {
        try {
          await TrackPlayer.setupPlayer();
      
          await TrackPlayer.updateOptions({
            android: {
              appKilledPlaybackBehavior:
                AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.Stop,
            ],
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
            ],
          });
      
          await TrackPlayer.reset();
      
          await TrackPlayer.add({
            id: 'track1',
            url: 'https://retrofm.s3.ap-south-1.amazonaws.com/Postmaster_113_1778306102.mp3',
            title: 'Postmaster',
            artist: 'Retro FM',
            //artwork: 'https://your-domain.com/logo.png', // optional
            isLiveStream: false,
          });
      
          await TrackPlayer.play();
        } catch (e) {
          console.log('Track Player Error:', e);
        }
      };

      const playEpisode = async (item) => {
        try {
          await TrackPlayer.reset();
      
          await TrackPlayer.add({
            id: item.id.toString(),
            url: item.audio_url, // your episode MP3 URL
            title: item.name,
            artist: storyDetails.name,
            artwork: item.play_image,
          });
      
          await TrackPlayer.play();
        } catch (e) {
          console.log(e);
        }
      };

    useEffect(() => {
        //start();
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
            getADetails();
            console.log("ID:", route.params.storyID);
        });
        return unsubscribe;
    }, []);

    const getADetails = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("page", "");
                formdata.append("seriesId", route.params.storyID);
                apiClient
                    .post(`${BASE_URL}/get-series-details`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authtoken: `${AuthToken}`,
                            accesstoken: JSON.parse(val).access_token
                        },
                    }).then(response => {
                        return response.data;
                    })
                    .then((responseJson) => {
                        console.log("Story Details:", responseJson);
                        if (responseJson.status == true) {
                            setStoryDetails(responseJson.details);
                            setEpisodList(responseJson.details.episodes);
                            setTimeout(() => {
                                setLoading(false);
                            }, 3000);
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
                        console.log("Story Details Error:", error);
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
                    <CommonHeader showBack={true} />

                    <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                        <View style={{ position: 'relative' }}>
                            <Image style={{ width: '100%', height: 260, resizeMode: 'stretch' }} source={storyDetails.image1 ? { uri: storyDetails.image1 } : require('../assets/images/noimage.png')} />
                            <Box style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', top: 0, left: 0 }}>
                                <Icon name="play-circle" size={70} color="#ffffff" />
                            </Box>
                        </View>
                        <HStack paddingHorizontal={10} marginTop={-30} space={3}>
                            <Avatar
                                bgColor={"#c90c16"}
                                size={100} p={1}
                                source={{ uri: storyDetails.author_image }}
                            />
                            <VStack marginTop={39}>
                                <Text color={"#ffffff"} fontSize="md">{storyDetails.name}</Text>
                                <Text color={"#c90c16"} fontSize="xs">{storyDetails.title}</Text>
                                <HStack space={2}>
                                    <View width={80} height={38} justifyContent={'center'} borderRadius={10} backgroundColor={'#333333'} style={{ paddingVertical: 1, paddingHorizontal: 8 }}>
                                        <Text color={"#ffffff"} fontSize="sm" lineHeight={14}>{storyDetails.plays} <Text color={"#888888"} fontSize="xs">Plays</Text></Text>
                                    </View>
                                    <View width={80} height={38} justifyContent={'center'} borderRadius={10} backgroundColor={'#333333'} style={{ paddingVertical: 1, paddingHorizontal: 8 }}>
                                        <Text color={"#ffffff"} fontSize="sm" lineHeight={14}>{storyDetails.followers} <Text color={"#888888"} fontSize="xs">Followers</Text></Text>
                                    </View>
                                    <Button size={'xs'} width={85} height={38} borderRadius={10} backgroundColor={'#fc030b'} onPress={() => ""}>
                                        <Text color="#ffffff" fontSize="md" fontWeight="bold" lineHeight={14}>{t("Follow")}</Text>
                                    </Button>
                                </HStack>

                            </VStack>
                        </HStack>
                        <Stack padding={5} space={5}>
                            <VStack space={2}>
                                <HStack justifyContent={'space-between'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                    <Text color={"#ffffff"} fontSize="lg">{t("Stories")}</Text>
                                </HStack>
                                <VStack flexWrap={'wrap'} justifyContent={'center'}>
                                    {episodList.map((item, index) =>
                                        <Pressable key={index} style={{ width: '100%', paddingVertical: 15, borderBottomWidth: episodList.length == index + 1 ? 0 : 1, borderColor: '#555555' }}>
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

export default StoryDetailsScreen;