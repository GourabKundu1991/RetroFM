import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Pressable, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import LinearGradient from 'react-native-linear-gradient';
import apiClient from '../api/apiClient';

const ProfileDetailsScreen = ({ navigation }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [profileDetails, setProfileDetails] = React.useState("");
    const [aadhaarDetails, setAadhaarDetails] = React.useState("");
    const [aadhaarFront, setAadhaarFront] = React.useState("");
    const [aadhaarBack, setAadhaarBack] = React.useState("");
    const [panDetails, setPanDetails] = React.useState("");
    const [panImage, setPanImage] = React.useState("");
    const [gstDetails, setGstDetails] = React.useState("");
    const [gstImage, setGstImage] = React.useState("");

    const [zoomImage, setZoomImage] = React.useState(false);
    const [imagePath, setImagePath] = React.useState("");

    const [personalInfo, setPersonalInfo] = React.useState(true);
    const [addressInfo, setAddressInfo] = React.useState(false);
    const [aadhaarInfo, setAadhaarInfo] = React.useState(false);
    const [PANInfo, setPANInfo] = React.useState(false);
    const [GSTInfo, setGSTInfo] = React.useState(false);

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

    const openClose = (type) => {
        if (type == "personal") {
            setPersonalInfo(!personalInfo);
            setAddressInfo(false);
            setAadhaarInfo(false);
            setPANInfo(false);
            setGSTInfo(false);
        } else if (type == "address") {
            setPersonalInfo(false);
            setAddressInfo(!addressInfo);
            setAadhaarInfo(false);
            setPANInfo(false);
            setGSTInfo(false);
        } else if (type == "aadhaar") {
            setPersonalInfo(false);
            setAddressInfo(false);
            setAadhaarInfo(!aadhaarInfo);
            setPANInfo(false);
            setGSTInfo(false);
        } else if (type == "pan") {
            setPersonalInfo(false);
            setAddressInfo(false);
            setAadhaarInfo(false);
            setPANInfo(!PANInfo);
            setGSTInfo(false);
        } else if (type == "gst") {
            setPersonalInfo(false);
            setAddressInfo(false);
            setAadhaarInfo(false);
            setPANInfo(false);
            setGSTInfo(!GSTInfo);
        }
    }

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/profile`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        //console.log("Profile:", responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setProfileDetails(responseJson.data.profile);
                            setAadhaarDetails(responseJson.data.ekyc.aadhaar);
                            setAadhaarFront(responseJson.data.profile.BaseUrl + responseJson.data.ekyc.aadhaar.front_image);
                            setAadhaarBack(responseJson.data.profile.BaseUrl + responseJson.data.ekyc.aadhaar.back_image);
                            setPanDetails(responseJson.data.ekyc.pan);
                            setPanImage(responseJson.data.profile.BaseUrl + responseJson.data.ekyc.pan.front_image);
                            setGstDetails(responseJson.data.ekyc.gst);
                            setGstImage(responseJson.data.profile.BaseUrl + responseJson.data.ekyc.gst.front_image);
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
                        console.log("Profile Error:", error);
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
        console.log(path);
        setImagePath(path);
        setTimeout(function () {
            setZoomImage(true);
        }, 500);
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Profile Details")}
                colorTheme={colorTheme}
            />
            <Box flex={1} px={5} py={5} bg={"#F1F1F1"}>
                <ScrollView>
                    <Stack space={3}>
                        <VStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'}>
                            <TouchableOpacity onPress={() => openClose("personal")}>
                                <HStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'} paddingY={2} paddingX={5} justifyContent={'space-between'}>
                                    <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Personal Details")}</Text>
                                    {personalInfo ? <Icon name="remove" size={25} color="#111111" /> : <Icon name="add" size={25} color="#111111" />}
                                </HStack>
                            </TouchableOpacity>
                            {personalInfo && (
                                <VStack style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#eeeeee', borderTopWidth: 1 }}>
                                    {profileDetails.firstName != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("First Name")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.firstName}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.lastName != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Last Name")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.lastName}</Text>
                                        </HStack>
                                    )}
                                    <HStack space={3} alignItems="center">
                                        <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Member ID")}:</Text>
                                        <Text color="#707274" fontSize="sm" textAlign="center">{profileDetails.ID}</Text>
                                    </HStack>
                                    {profileDetails.tier != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Tier")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center">{profileDetails.tier}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.mobile != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Mobile")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.mobile}</Text>
                                        </HStack>
                                    )}
                                </VStack>
                            )}
                        </VStack>
                        <VStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'}>
                            <TouchableOpacity onPress={() => openClose("address")}>
                                <HStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'} paddingY={2} paddingX={5} justifyContent={'space-between'}>
                                    <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Address Details")}</Text>
                                    {addressInfo ? <Icon name="remove" size={25} color="#111111" /> : <Icon name="add" size={25} color="#111111" />}
                                </HStack>
                            </TouchableOpacity>
                            {addressInfo && (
                                <VStack style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#eeeeee', borderTopWidth: 1 }}>
                                    {profileDetails.addrLine1 != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Address Line 1")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.addrLine1}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.addrLine2 != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Address Line 2")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.addrLine2}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.addrLine3 != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Address Line 3")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.addrLine3}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.State != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("State")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.State}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.district != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("District")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.district}</Text>
                                        </HStack>
                                    )}
                                    {profileDetails.Pin != "" && (
                                        <HStack space={3} alignItems="center">
                                            <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Pincode")}:</Text>
                                            <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{profileDetails.Pin}</Text>
                                        </HStack>
                                    )}
                                </VStack>
                            )}
                        </VStack>
                        {aadhaarDetails.value != "" && (
                            <VStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'}>
                                <TouchableOpacity onPress={() => openClose("aadhaar")}>
                                    <HStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'} paddingY={2} paddingX={5} justifyContent={'space-between'}>
                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("Aadhaar Details")}</Text>
                                        {aadhaarInfo ? <Icon name="remove" size={25} color="#111111" /> : <Icon name="add" size={25} color="#111111" />}
                                    </HStack>
                                </TouchableOpacity>
                                {aadhaarInfo && (
                                    <VStack style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#eeeeee', borderTopWidth: 1 }}>
                                        <VStack space={2}>
                                            <HStack space={3} alignItems="center">
                                                <Text color="#707274" fontSize="sm" textAlign="center" fontWeight="medium" textTransform="capitalize">{t("Aadhaar No")}:</Text>
                                                <Text color="#707274" fontSize="sm" textAlign="center" textTransform="capitalize">{aadhaarDetails.value}</Text>
                                            </HStack>
                                            <HStack justifyContent={'space-between'} marginTop={1}>
                                                <VStack width={'48%'} space={1}>
                                                    <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Aadhaar Front Image")}</Text>
                                                    <Pressable style={{ width: '100%', borderWidth: 1, borderColor: '#cccccc', borderRadius: 10, overflow: 'hidden', padding: 10, alignItems: 'center' }} onPress={() => openImage(aadhaarFront)}><Image source={aadhaarFront ? { uri: aadhaarFront } : require('../assets/images/noimage.png')} style={{ width: '100%', height: 75, borderRadius: 6, overflow: 'hidden' }} resizeMode='cover' /></Pressable>
                                                </VStack>
                                                <VStack width={'48%'} space={1}>
                                                    <Text color="#666666" fontSize="xs" fontWeight="medium" textTransform="capitalize">{t("Aadhaar Back Image")}</Text>
                                                    <Pressable style={{ width: '100%', borderWidth: 1, borderColor: '#cccccc', borderRadius: 10, overflow: 'hidden', padding: 10, alignItems: 'center' }} onPress={() => openImage(aadhaarBack)}><Image source={aadhaarBack ? { uri: aadhaarBack } : require('../assets/images/noimage.png')} style={{ width: '100%', height: 75, borderRadius: 6, overflow: 'hidden' }} resizeMode='cover' /></Pressable>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    </VStack>
                                )}
                            </VStack>
                        )}
                        {panDetails.value != "" && (
                            <VStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'}>
                                <TouchableOpacity onPress={() => openClose("pan")}>
                                    <HStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'} paddingY={2} paddingX={5} justifyContent={'space-between'}>
                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("PAN Details")}</Text>
                                        {PANInfo ? <Icon name="remove" size={25} color="#111111" /> : <Icon name="add" size={25} color="#111111" />}
                                    </HStack>
                                </TouchableOpacity>
                                {PANInfo && (
                                    <VStack style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#eeeeee', borderTopWidth: 1 }}>
                                        <VStack space={2}>
                                            <HStack space={1} alignItems="center">
                                                <Text color="#707274" fontSize="xs" textAlign="center" fontWeight="medium">{t("PAN No")}:</Text>
                                                <Text color="#707274" fontSize="xs" textAlign="center" textTransform="uppercase">{panDetails.value}</Text>
                                            </HStack>
                                            <VStack space={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium">{t("PAN Image")}</Text>
                                                <Pressable style={{ width: '100%', borderWidth: 1, borderColor: '#cccccc', borderRadius: 10, overflow: 'hidden', padding: 10, alignItems: 'center' }} onPress={() => openImage(panImage)}><Image source={panImage ? { uri: panImage } : require('../assets/images/noimage.png')} style={{ width: '100%', height: 75, borderRadius: 6, overflow: 'hidden' }} resizeMode='cover' /></Pressable>
                                            </VStack>
                                        </VStack>
                                    </VStack>
                                )}
                            </VStack>
                        )}
                        {gstDetails.value != "" && (
                            <VStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'}>
                                <TouchableOpacity onPress={() => openClose("gst")}>
                                    <HStack backgroundColor={"#ffffff"} borderRadius={6} overflow={'hidden'} paddingY={2} paddingX={5} justifyContent={'space-between'}>
                                        <Text color="#111111" fontSize="sm" fontWeight="bold">{t("GST Details")}</Text>
                                        {GSTInfo ? <Icon name="remove" size={25} color="#111111" /> : <Icon name="add" size={25} color="#111111" />}
                                    </HStack>
                                </TouchableOpacity>
                                {GSTInfo && (
                                    <VStack style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#eeeeee', borderTopWidth: 1 }}>
                                        <VStack space={2}>
                                            <HStack space={1} alignItems="center">
                                                <Text color="#707274" fontSize="xs" textAlign="center" fontWeight="medium">{t("GST No")}:</Text>
                                                <Text color="#707274" fontSize="xs" textAlign="center" textTransform="uppercase">{gstDetails.value}</Text>
                                            </HStack>
                                            <VStack space={1}>
                                                <Text color="#666666" fontSize="xs" fontWeight="medium">{t("GST Image")}</Text>
                                                <Pressable style={{ width: '100%', borderWidth: 1, borderColor: '#cccccc', borderRadius: 10, overflow: 'hidden', padding: 10, alignItems: 'center' }} onPress={() => openImage(gstImage)}><Image source={gstImage ? { uri: gstImage } : require('../assets/images/noimage.png')} style={{ width: '100%', height: 75, borderRadius: 6, overflow: 'hidden' }} resizeMode='cover' /></Pressable>
                                            </VStack>
                                        </VStack>
                                    </VStack>
                                )}
                            </VStack>
                        )}
                    </Stack>
                </ScrollView>
            </Box>
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
        </NativeBaseProvider >
    )
}

const styles = StyleSheet.create({
    productbox: { borderRadius: 20, width: '96%', margin: '2%', backgroundColor: '#f6f6f6', padding: 15, borderColor: '#eeeeee', borderWidth: 2, overflow: 'hidden' },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }
});

export default ProfileDetailsScreen;
