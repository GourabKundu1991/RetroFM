import { Avatar, Box, Button, Checkbox, HStack, Input, NativeBaseProvider, ScrollView, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, Keyboard, Linking, Platform, Pressable, StatusBar, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
import RenderHTML from 'react-native-render-html';

const AboutDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);

    const [details, setDetails] = React.useState("");

    const { width } = useWindowDimensions();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
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
            setDetails(route.params.detailsItem);
        });
        return unsubscribe;
    }, []);


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
                                <Text color={"#ffffff"} fontSize="lg">{details.name}</Text>
                            </HStack>
                            <VStack style={{ width: '100%', padding: 20, backgroundColor: '#111111', borderRadius: 20, overflow: 'hidden' }}>
                                {details.type == "array" ?
                                    <VStack space={5} overflow={'hidden'}>
                                        <HStack space={5}>
                                                <Icon name="location-outline" size={30} color={"#fc030b"} />
                                                <Text fontSize='md' color={"#ffffff"}>{details.details.address}</Text>
                                            </HStack>
                                        <Pressable onPress={() => Linking.openURL(`mailto:${details.details.email}`)}>
                                            <HStack space={5}>
                                                <Icon name="mail-unread-outline" size={30} color={"#fc030b"} />
                                                <Text fontSize='lg'  color={"#ffffff"}>{details.details.email}</Text>
                                            </HStack>
                                        </Pressable>
                                        <Pressable onPress={() => Linking.openURL(`tel:${details.details.phone}`)}>
                                            <HStack space={5}>
                                                <Icon name="call-outline" size={30} color={"#fc030b"} />
                                                <Text fontSize='lg' color={"#ffffff"}>{details.details.phone}</Text>
                                            </HStack>
                                        </Pressable>
                                    </VStack>
                                    :
                                    <RenderHTML contentWidth={width} baseStyle={{ color: '#999999', fontSize: 14 }} source={{ html: details.description }} />
                                }
                            </VStack>
                        </VStack>
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
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    linkbox: { borderRadius: 20, width: '30.33%', margin: '1.5%', height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default AboutDetailsScreen;