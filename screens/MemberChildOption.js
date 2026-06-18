import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, Box, Button, HStack, Input, NativeBaseProvider, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Image, Linking, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import CommonHeader from '../components/CommonHeader';
import BottomTabs from '../components/BottomTabs';

const MemberChildOptionScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");
    const [data, setData] = useState(route.params?.data);
    const [memberType, setMemberType] = useState(route.params?.memberType);

    const [memberList, setMemberList] = React.useState([
        { "name": "Sales\nData", "link": "MemberLifting", "icon": require('../assets/images/sales_data.png') },
        { "name": "Loyalty\nOrders", "link": "MemberOrders", "icon": require('../assets/images/loyalty_orders.png') },
        { "name": "Current\nPoint Balance", "link": "MemberPointStatement", "icon": require('../assets/images/point_balance.png') },
    ]);

    const width = Dimensions.get('window').width;

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
                setLoading(false);
                if (val != null) {
                    setColorTheme(JSON.parse(val).info.theme_color);
                    Events.publish('colorTheme', val.info.theme_color);
                }
            });
            console.log('itemData', JSON.stringify(route.params.data))
        });
        return unsubscribe;
    }, []);

    const LabelValue = ({ label, value }) => {
        return (
            <HStack space={1.5} alignItems={'center'}>
                <Text fontWeight={'bold'} color={'#707274'}>{label}:</Text>
                <Text color={'#707274'}>{value}</Text>
            </HStack>
        )
    }

    const OptionBox = ({ item }) => {
        return (
            <Pressable onPress={() => navigation.navigate(item.link, { memId: route.params.memId })}>
                <Box mr={1} py={4} borderRadius={5} alignItems={'center'} height={width * 0.36} width={width * 0.28} bgColor={'#FFFFFF'}>
                    <Avatar
                        // source={item?.icon}
                        backgroundColor={'#EFEFEF'}
                        size={70}
                    >
                        <Image source={item?.icon} style={{ width: 35, height: 35, resizeMode: 'contain' }} />
                    </Avatar>
                    <Text my={1} textAlign={'center'} fontSize={'sm'}>{item?.name}</Text>
                </Box>
            </Pressable>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t("Select List Option")}
                colorTheme={colorTheme}
            />
            <Box flex={1} bg={"#F1F1F1"}>
                {/* <HStack style={{ height: 60 }} bg={colorTheme.normal} justifyContent="space-between" alignItems="center" paddingX="4" paddingY="3" space={2}>
                    <HStack alignItems={'center'} space={8}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="chevron-back" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <Text color="#ffffff" fontSize="16" textAlign="center" fontWeight="bold" textTransform="capitalize">{t("Select List Option")}</Text>
                    </HStack>
                </HStack> */}
                <ScrollView>
                    <Box padding={5}>
                        <Box mb={6} px={8} py={6} borderRadius={10} bgColor={'#FFFFFF'}>
                            <Text fontWeight={'bold'}>{data?.company_name}</Text>
                            <LabelValue label={t('Member Role')} value={memberType} />
                            <LabelValue label={t('Member Code')} value={data?.id_extern01} />
                            <LabelValue label={t('Phone')} value={data?.phone_number} />
                        </Box>
                        <Stack style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {memberList.map((item, index) =>
                                <OptionBox key={index} item={item} />
                            )}
                        </Stack>
                        <Stack mt={4} />
                        {/* <VStack space={3}>
                            {memberList.map((item, index) =>
                                <Pressable key={index} style={styles.productbox} onPress={() => navigation.navigate(item.link, { memId: route.params.memId })}>
                                    <HStack justifyContent={"space-between"} alignItems={"center"}>
                                        <Text fontSize='lg' fontWeight="bold" color={colorTheme.dark}>{item.name}</Text>
                                        <Icon name="arrow-forward-circle-outline" size={28} color={colorTheme.dark} />
                                    </HStack>
                                </Pressable>
                            )}
                        </VStack> */}
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
        </NativeBaseProvider>

    )
}

const styles = StyleSheet.create({
    productbox: { borderRadius: 20, backgroundColor: '#f6f6f6', padding: 15, borderColor: '#eeeeee', borderWidth: 2, overflow: 'hidden' },
    inputbox: { backgroundColor: '#ffffff', borderRadius: 30, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 2 },
    custbtn: { width: '100%', borderRadius: 30, overflow: 'hidden', height: 48 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default MemberChildOptionScreen;
