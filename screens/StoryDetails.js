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
    State,
    usePlaybackState,
    RepeatMode,
    useProgress,
    useActiveTrack,
} from 'react-native-track-player';
//import { usePlayer } from '../player/PlayerContext';
import Slider from '@react-native-community/slider';

import { useFocusEffect } from '@react-navigation/native';

const StoryDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [storyDetails, setStoryDetails] = React.useState("");
    const [episodList, setEpisodList] = React.useState([]);

    const [isImageLoading, setIsImageLoading] = React.useState(false);

    let isPlayerInitialized = false;

    const progress = useProgress();

    const [episodID, setEpisodID] = React.useState("");
    const [storyId, setStoryId] = React.useState("");

    const [playType, setPlayType] = React.useState("");

    const sleepTimer = useRef(null);

    /* const {
        loadQueue,
        playTrack,
        previousTrack,
        nextTrack,
    } = usePlayer(); */

    /* const playbackState = TrackPlayer.getPlaybackState();
    const track = TrackPlayer.getActiveTrack(); */

    const playbackState = usePlaybackState();

    const checkCurrentPlayer = async () => {
        try {
            const playbackState = await TrackPlayer.getPlaybackState();
            const track = await TrackPlayer.getActiveTrack();

            console.log("Playback:", playbackState.state);
            console.log("Track:", track);

            if (
                track &&
                (playbackState.state === State.Playing ||
                    playbackState.state === State.Paused)
            ) {
                console.log("Background player already running");

                return;
            } else {
                console.log("No play running");
    
                    return;
            }


        } catch (e) {
            console.log(e);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
                checkCurrentPlayer();
        }, [])
    );

    const togglePlayback = async () => {
        if (playbackState.state === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };


    const start = async (storyData) => {
        try {

            setPlayType("TRAILER");

            await TrackPlayer.reset();

            await TrackPlayer.add({
                id: storyData.id.toString(),
                url: storyData.trailer_audio,
                title: storyData.name,
                artist: storyData.author_name,
                isLiveStream: false,
            });

            await TrackPlayer.play();
        } catch (e) {
            console.log('Track Player Error:', e);
        }
    };

    const playEpisode = async (item) => {
        try {

            setPlayType("EPISODE");
            setEpisodID(item.id);
            setStoryId(route.params.storyID);

            const playData = {
                playType: "EPISODE",
                storyId: route.params.storyID,
                episodId: item.id
            };

            AsyncStorage.setItem('playerData', JSON.stringify(playData));

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

    const seek = async (value) => {

        await TrackPlayer.seekTo(value);

    };

    const formatTime = seconds => {

        if (!seconds) return "00:00";

        const m = Math.floor(seconds / 60);

        const s = Math.floor(seconds % 60);

        return `${m}:${s < 10 ? "0" : ""}${s}`;

    };

    const backward10 = async () => {
        try {
            const { position } = await TrackPlayer.getProgress();

            const newPosition = Math.max(position - 10, 0);

            await TrackPlayer.seekTo(newPosition);
        } catch (error) {
            console.log("Backward Error:", error);
        }
    };

    const forward10 = async () => {
        try {
            const { position, duration } = await TrackPlayer.getProgress();

            const newPosition = Math.min(position + 10, duration);

            await TrackPlayer.seekTo(newPosition);
        } catch (error) {
            console.log("Forward Error:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (playType === "TRAILER") {
                    TrackPlayer.stop().catch(() => { });
                    TrackPlayer.reset().catch(() => { });
                }
            };
        }, [playType])
    );

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
                            AsyncStorage.getItem('playerData').then(playval => {
                                console.log("playerData:", playval);
                                if (playval != null) {
                                    console.log();
                                    setLoading(false);
                                    setPlayType(JSON.parse(playval).playType);
                                    setStoryId(JSON.parse(playval).storyId);
                                    setEpisodID(JSON.parse(playval).episodId);
                                } else {
                                    setTimeout(() => {
                                        setLoading(false);
                                        start(responseJson.details);
                                    }, 500);
                                }
                            });
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
                            {playType === "TRAILER" && (
                                <Box alignItems={'center'} justifyContent={'center'} borderRadius={30} backgroundColor={'#fc030b'} style={{ position: 'absolute', bottom: 15, right: 15, paddingHorizontal: 10, paddingVertical: 3 }}>
                                    <HStack alignItems={'center'}>
                                        <TouchableOpacity
                                            onPress={togglePlayback}
                                        >

                                            <Icon
                                                name={
                                                    playbackState.state === State.Playing
                                                        ? "pause-circle"
                                                        : "play-circle"
                                                }
                                                size={40}
                                                color="#ffffff"
                                            />

                                        </TouchableOpacity>
                                        <Text color="#ffffff" fontSize="md" lineHeight={14}>{t("Trailer")}</Text>
                                    </HStack>
                                </Box>
                            )}
                        </View>

                        {/* Player Controls */}
                        {(playType === "EPISODE" && storyId === route.params.storyID) && (
                            <Stack>
                                <HStack width={200} marginTop={5}
                                    justifyContent="space-between"
                                    alignItems="center"
                                    alignSelf={'center'}
                                >


                                    <TouchableOpacity
                                        onPress={backward10}
                                    >

                                        <Icon
                                            name="play-back-circle-outline"
                                            size={35}
                                            color="#FFF"
                                        />

                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={togglePlayback}
                                    >

                                        <Icon
                                            name={
                                                playbackState.state === State.Playing
                                                    ? "pause-circle"
                                                    : "play-circle"
                                            }
                                            size={75}
                                            color="#FC030B"
                                        />

                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={forward10}
                                    >

                                        <Icon
                                            name="play-forward-circle-outline"
                                            size={35}
                                            color="#FFF"
                                        />

                                    </TouchableOpacity>

                                </HStack>

                                {/* Progress */}

                                <VStack px={5} mt={5}>

                                    <Slider
                                        minimumValue={0}
                                        maximumValue={progress.duration}
                                        value={progress.position}
                                        minimumTrackTintColor="#FC030B"
                                        maximumTrackTintColor="#555"
                                        thumbTintColor="#FC030B"
                                        onSlidingComplete={seek}
                                    />

                                    <HStack
                                        justifyContent="space-between"
                                    >

                                        <Text color="#999">
                                            {formatTime(progress.position)}
                                        </Text>

                                        <Text color="#999">
                                            {formatTime(progress.duration)}
                                        </Text>

                                    </HStack>

                                </VStack>
                            </Stack>
                        )}

                        <Stack padding={5} space={5}>
                            <VStack space={4}>
                                <Text color={"#ffffff"} fontSize="lg">{storyDetails.name}</Text>
                                <HStack justifyContent={'center'} alignItems={'center'} style={{ borderColor: "#444444", borderBottomWidth: 1, borderTopWidth: 1, width: '100%', paddingVertical: 10, marginBottom: 6 }}>
                                    <Stack style={{ paddingHorizontal: 15 }}>
                                        <HStack space={2} justifyContent={'center'} alignItems={'center'} style={{ paddingVertical: 1, paddingHorizontal: 5, width: 60, backgroundColor: 'green', overflow: 'hidden', borderRadius: 10 }}>
                                            <Text color={"#ffffff"} fontSize="sm" fontWeight={'bold'}>{storyDetails.average_rating}</Text>
                                            <Icon name="star" size={16} color="yellow" />
                                        </HStack>
                                        <Text color={"#888888"} fontSize="xs">{storyDetails.total_review} Reviews</Text>
                                    </Stack>
                                    <Stack style={{ borderColor: '#444444', borderLeftWidth: 1, borderRightWidth: 1, paddingHorizontal: 15 }}>
                                        <Text color={"#ffffff"} fontSize="lg" fontWeight={'bold'}>{storyDetails.playes}</Text>
                                        <Text color={"#888888"} fontSize="xs">Plays</Text>
                                    </Stack>
                                    <Stack style={{ borderColor: '#444444', borderRightWidth: 1, paddingHorizontal: 15 }}>
                                        <Text color={"#ffffff"} fontSize="lg" fontWeight={'bold'}>{storyDetails.content_type}</Text>
                                        <Text color={"#888888"} fontSize="xs">Rated</Text>
                                    </Stack>
                                    <HStack space={1} style={{ paddingHorizontal: 15 }}>
                                        <Icon name="heart" size={24} color="#fc030b" />
                                        <Text color={"#ffffff"} fontSize="lg" fontWeight={'bold'}>Like</Text>
                                    </HStack>
                                </HStack>
                                <Text color={"#ffffff"} fontSize="sm">{storyDetails.description}</Text>
                                <HStack space={3} backgroundColor={"#111111"} padding={3}>
                                    <Avatar size={39} source={{ uri: storyDetails.author_image }} />
                                    <VStack>
                                        <Text color={"#ffffff"} fontSize="sm">{storyDetails.author_name}</Text>
                                        <Text color={"#888888"} fontSize="xs">{storyDetails.author_followers} Followers</Text>
                                    </VStack>
                                </HStack>
                                <Box alignItems={'center'} justifyContent={'center'} width={170} height={38} borderRadius={10} backgroundColor={'#fc030b'}>
                                    <Text color="#ffffff" fontSize="md" fontWeight="bold" lineHeight={14}>{t("Episodes")} ({storyDetails.total_episode})</Text>
                                </Box>
                                <VStack flexWrap={'wrap'} justifyContent={'center'}>
                                    {episodList.map((item, index) =>
                                        <Pressable onPress={() => playEpisode(item, index)} key={index} style={{ width: '100%', paddingVertical: 15, borderBottomWidth: episodList.length == index + 1 ? 0 : 1, borderColor: '#555555' }}>
                                            <HStack space={3} alignItems={'center'}>
                                                <VStack style={{ width: '25%' }}>
                                                    <Box width={'100%'} style={{ borderWidth: 2, borderColor: '#666666', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                                                        <FastImage
                                                            style={{
                                                                width: '100%',
                                                                height: 80,
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
                                                        {episodID === item.id && (
                                                            <Box style={{ position: 'absolute', zIndex: 9, alignItems: 'center', justifyContent: 'center', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                                                                <Image style={{ width: 60, height: 60, resizeMode: 'contain' }} source={require('../assets/images/audio.gif')} />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </VStack>
                                                <VStack style={{ width: '60%' }} space={1.5}>
                                                    <Text color={"#ffffff"} fontSize="sm">{item.name}</Text>
                                                    <Text color={"#ffffff"} fontSize="sm">{item.playes} <Text color={"#888888"} fontSize="xs">Plays</Text> <Text color={"#fc030b"} fontSize="xl"> | </Text> {item.duration} <Text color={"#fc030b"} fontSize="xl"> | </Text> <Text color={"#888888"} fontSize="xs">{item.days_ago}</Text></Text>
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

    container: {
        flex: 1,
        backgroundColor: "#121212",
    },


    header: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        backgroundColor: "#1c1c1c",
    },


    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },


    headerTitle: {
        flex: 1,
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginLeft: 10,
    },



    coverImage: {
        width: "100%",
        height: 260,
        resizeMode: "cover",
    },



    infoBox: {
        padding: 15,
    },


    storyTitle: {
        fontSize: 24,
        color: "#fff",
        fontWeight: "700",
        marginBottom: 10,
    },


    description: {
        color: "#bdbdbd",
        fontSize: 15,
        lineHeight: 22,
    },



    metaRow: {
        flexDirection: "row",
        marginTop: 15,
        justifyContent: "space-between",
    },


    metaText: {
        color: "#ff9800",
        fontSize: 14,
        fontWeight: "600",
    },



    trailerButton: {
        marginHorizontal: 15,
        marginTop: 10,
        height: 48,
        borderRadius: 25,
        backgroundColor: "#ff9800",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },


    trailerText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 8,
    },




    episodeContainer: {
        padding: 15,
    },


    sectionTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 15,
    },



    episodeItem: {
        backgroundColor: "#1f1f1f",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },



    activeEpisode: {
        borderWidth: 1,
        borderColor: "#ff9800",
        backgroundColor: "#292929",
    },



    episodeLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },



    numberCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },


    numberText: {
        color: "#fff",
        fontWeight: "700",
    },



    episodeTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },


    duration: {
        color: "#999",
        marginTop: 4,
        fontSize: 13,
    },




    // ======================
    // MINI PLAYER
    // ======================


    playerBox: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,

        height: 75,

        backgroundColor: "#222",

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 12,

        borderTopWidth: 1,

        borderTopColor: "#333",

    },



    playerImage: {
        width: 55,
        height: 55,
        borderRadius: 8,
    },



    playerInfo: {
        flex: 1,
        marginHorizontal: 12,
    },


    playerTitle: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },



    timeText: {
        color: "#aaa",
        fontSize: 12,
        marginTop: 4,
    },





    // ======================
    // FULL PLAYER CONTROLS
    // ======================


    fullPlayer: {
        flex: 1,
        backgroundColor: "#121212",
        padding: 20,
    },



    fullArtwork: {
        width: "100%",
        height: 320,
        borderRadius: 15,
    },


    controlRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 30,
    },



    controlButton: {
        justifyContent: "center",
        alignItems: "center",
    },


    controlText: {
        color: "#fff",
        fontSize: 16,
    },



    slider: {
        width: "100%",
        height: 40,
        marginTop: 20,
    },



    sliderTimeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },


    sliderTime: {
        color: "#aaa",
        fontSize: 12,
    },



    speedButton: {
        backgroundColor: "#ff9800",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },


    speedText: {
        color: "#fff",
        fontWeight: "700",
    },



    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },



    modalBox: {
        backgroundColor: "#222",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },


    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
    },


    optionButton: {
        paddingVertical: 15,
    },


    optionText: {
        color: "#fff",
        fontSize: 16,
    },


});

export default StoryDetailsScreen;