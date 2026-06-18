import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box, Button, HStack, NativeBaseProvider, Select, Stack, Text, Toast, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Pressable, Linking, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config';
import { useTranslation } from 'react-i18next';
import i18n from '../assets/language/i18n';
import BottomTabs from '../components/BottomTabs';
import CommonHeader from '../components/CommonHeader';
import moment from 'moment';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import apiClient from '../api/apiClient';

const BoardDetailsScreen = ({ navigation, route }) => {

    const { t } = useTranslation();
    const [currentLanguage, setLanguage] = React.useState('Eng');
    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");

    const [filterStatus, setFilterStatus] = React.useState("state");

    const [boardList, setBoardList] = React.useState([]);
    const [imageBase, setImageBase] = React.useState("");
    const [unit, setUnit] = React.useState("");
    const [myRank, setMyRank] = React.useState("");

    const [productType, setProductType] = React.useState("");
    const [productList, setProductList] = React.useState([]);

    const [dateFor, setDateFor] = React.useState("");

    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentDate = new Date();

    const [fromDate, setFromDate] = React.useState(firstDayOfMonth);
    const [tillDate, setTillDate] = React.useState(currentDate);

    const [top3, setTop3] = React.useState([]);

    const [locationName, setLocationName] = React.useState("");

    const showDatePicker = (val) => {
        setDatePickerVisibility(true);
        setDateFor(val);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        hideDatePicker();
        if (dateFor == "fromDate") {
            setFromDate(date);
        } else if (dateFor == "toDate") {
            setTillDate(date);
        }

    };

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
            getAllData(productType, filterStatus);
        });
        return unsubscribe;
    }, []);

    const getAllData = (typeId, location) => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                formdata.append("locationType", location);
                formdata.append("startDate", moment(fromDate).format("YYYY-MM-DD"));
                formdata.append("endDate", moment(tillDate).format("YYYY-MM-DD"));
                formdata.append("productTypeId", typeId);
                formdata.append("leaderboard_program", route.params.dataUrl);
                console.log(formdata, JSON.parse(val).token);
                apiClient
                    .post(`${BASE_URL}/get_leaderboard`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("get_leaderboard:", responseJson.data);
                        setLoading(false);
                        if (responseJson.data.bstatus == 1) {
                            setBoardList(responseJson.data.list);
                            setImageBase(responseJson.data.profile_image_base_url);
                            setUnit(responseJson.data.unit);
                            setMyRank(responseJson.data.my_leader_board_rank);
                            setProductList(responseJson.data.product_group_tags);
                            setTop3(responseJson.data.top_3);
                            setLocationName(responseJson.data.geo_location_name);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("get_leaderboard Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const onSelectProductType = (val) => {
        setProductType(val);
        setLoading(true);
        getAllData(val, filterStatus);
    }

    const onSearch = () => {
        setLoading(true);
        getAllData(productType, filterStatus);
    }

    const onSelectFilter = (valFilter) => {
        setFilterStatus(valFilter);
        setLoading(true);
        getAllData(productType, valFilter);
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t(route.params.title)}
                colorTheme={colorTheme}
            />
            <HStack alignItems="center" justifyContent="space-evenly" backgroundColor={colorTheme.normal} paddingX={3} paddingY={1}>
                <Button size="xs" borderRadius={0} variant="link" borderColor={filterStatus == "state" ? '#ffffff' : colorTheme.normal} borderBottomWidth={2} _text={{ color: filterStatus == "state" ? "#ffffff" : "#dddddd", fontWeight: 'bold', fontSize: 12 }} onPress={() => onSelectFilter("state")}>{t("State-Wise")}</Button>
                <Button size="xs" borderRadius={0} variant="link" borderColor={filterStatus == "district" ? '#ffffff' : colorTheme.normal} borderBottomWidth={2} _text={{ color: filterStatus == "district" ? "#ffffff" : "#dddddd", fontWeight: 'medium', fontSize: 12 }} onPress={() => onSelectFilter("district")}>{t("District-Wise")}</Button>
            </HStack>
            <Box flex={1} px={5} py={5} bg={"#F1F1F1"}>
                <Stack flex={1} backgroundColor={'#ffffff'} borderRadius={10} overflow={'hidden'}>
                    <ScrollView>
                        <Stack space={5} padding={5}>
                            <Text color={"#111111"} fontSize="sm" fontWeight="medium" textTransform={'capitalize'}>{filterStatus}: {locationName}</Text>
                            <VStack justifyContent={'center'} space={2}>
                                <HStack justifyContent={'space-between'} alignItems={'center'}>
                                    <VStack space={1} width={'42%'}>
                                        <Text fontSize='sm' fontWeight="bold" color={"#111111"}>{t("From Date")}</Text>
                                        <Pressable style={styles.inputbox} onPress={() => showDatePicker("fromDate")}>
                                            <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"} alignItems={'center'}>
                                                <Icon name="calendar-outline" size={16} color="#666666" style={{ width: 20, marginLeft: 10, marginRight: 6, textAlign: 'center' }} />
                                                <Text color={tillDate != "" ? "#111111" : "#999999"} fontSize="xs">{fromDate != "" ? moment(fromDate).format("DD-MM-YYYY") : t("From Date")}</Text>
                                            </HStack>
                                        </Pressable>
                                    </VStack>
                                    <VStack space={1} width={'42%'}>
                                        <Text fontSize='sm' fontWeight="bold" color={"#111111"}>{t("To Date")}</Text>
                                        <Pressable style={styles.inputbox} onPress={() => showDatePicker("toDate")}>
                                            <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"} alignItems={'center'}>
                                                <Icon name="calendar-outline" size={16} color="#666666" style={{ width: 20, marginLeft: 10, marginRight: 6, textAlign: 'center' }} />
                                                <Text color={tillDate != "" ? "#111111" : "#999999"} fontSize="xs">{tillDate != "" ? moment(tillDate).format("DD-MM-YYYY") : t("To Date")}</Text>
                                            </HStack>
                                        </Pressable>
                                    </VStack>
                                    <VStack space={1} width={'12%'}>
                                        <Button size="xs" style={{ backgroundColor: "#000000", height: 40, marginTop: 25, borderRadius: 6 }} onPress={() => onSearch()}>
                                            <Icon name="search" size={16} color="#ffffff" style={{ width: 20, marginLeft: 10, marginRight: 10, textAlign: 'center' }} />
                                        </Button>
                                    </VStack>
                                </HStack>
                            </VStack>
                            <HStack paddingTop={60} justifyContent={'center'} alignItems={'flex-end'}>
                                <VStack marginTop={12} paddingX={3} width={'33.33%'} alignItems={'center'} justifyContent={'center'} backgroundColor={colorTheme.normal} borderLeftRadius={20} position={'relative'}>
                                    <VStack space={1} top={-50} justifyContent={'center'} alignItems={'center'} position={'absolute'}>
                                        <Image style={{ width: 30, height: 20, resizeMode: 'contain' }} source={require('../assets/images/crown2.png')} />
                                        <Image style={{ width: 50, height: 50, resizeMode: 'contain', backgroundColor: '#cccccc', borderRadius: 50, overflow: 'hidden', borderColor: '#929292', borderWidth: 3 }} source={top3[1] ? { uri: imageBase + top3[1].profile_pic } : require('../assets/images/avatar.png')} />
                                    </VStack>
                                    <VStack paddingTop={6} paddingBottom={3} justifyContent={'space-between'} alignItems={'center'} minHeight={120}>
                                        <Text color={"#ffffff"} fontSize="30" fontWeight="bold">2</Text>
                                        <VStack space={1} alignItems={'center'}>
                                            <Text color={"#ffffff"} fontSize="xs" fontWeight="bold" textAlign={'center'} textTransform={'capitalize'}>{top3[1] ? top3[1].member_name : "NA"}</Text>
                                            {/* {top3[1] && (
                                                <Text color={"#ffffff"} fontSize="xs" fontWeight="normal">{top3[1].total_sold} {unit}</Text>
                                            )} */}
                                        </VStack>
                                    </VStack>
                                </VStack>
                                <VStack paddingX={3} width={'33.33%'} alignItems={'center'} justifyContent={'center'} backgroundColor={colorTheme.dark} borderTopRadius={20} position={'relative'}>
                                    <VStack space={1} top={-65} justifyContent={'center'} alignItems={'center'} position={'absolute'}>
                                        <Image style={{ width: 40, height: 30, resizeMode: 'contain' }} source={require('../assets/images/crown1.png')} />
                                        <Image style={{ width: 65, height: 65, resizeMode: 'contain', backgroundColor: '#cccccc', borderRadius: 50, overflow: 'hidden', borderColor: '#FFAA00', borderWidth: 3 }} source={top3[0] ? { uri: imageBase + top3[0].profile_pic } : require('../assets/images/avatar.png')} />
                                    </VStack>
                                    <VStack paddingTop={6} paddingBottom={3} justifyContent={'space-between'} alignItems={'center'} minHeight={180}>
                                        <Text color={"#ffffff"} fontSize="5xl" fontWeight="bold">1</Text>
                                        <VStack space={1} alignItems={'center'}>
                                            <Text color={"#ffffff"} fontSize="xs" fontWeight="bold" textAlign={'center'} textTransform={'capitalize'}>{top3[0] ? top3[0].member_name : "NA"}</Text>
                                            {/* {top3[0] && (
                                                <Text color={"#ffffff"} fontSize="xs" fontWeight="normal">{top3[0].total_sold} {unit}</Text>
                                            )} */}
                                        </VStack>
                                    </VStack>
                                </VStack>
                                <VStack marginTop={12} paddingX={3} width={'33.33%'} alignItems={'center'} justifyContent={'center'} backgroundColor={colorTheme.normal} borderRightRadius={20} position={'relative'}>
                                    <VStack space={1} top={-50} justifyContent={'center'} alignItems={'center'} position={'absolute'}>
                                        <Image style={{ width: 30, height: 20, resizeMode: 'contain' }} source={require('../assets/images/crown3.png')} />
                                        <Image style={{ width: 50, height: 50, resizeMode: 'contain', backgroundColor: '#cccccc', borderRadius: 50, overflow: 'hidden', borderColor: '#C68346', borderWidth: 3 }} source={top3[2] ? { uri: imageBase + top3[2].profile_pic } : require('../assets/images/avatar.png')} />
                                    </VStack>
                                    <VStack paddingTop={6} paddingBottom={3} justifyContent={'space-between'} alignItems={'center'} minHeight={120}>
                                        <Text color={"#ffffff"} fontSize="30" fontWeight="bold">3</Text>
                                        <VStack space={1} alignItems={'center'}>
                                            <Text color={"#ffffff"} fontSize="xs" fontWeight="bold" textAlign={'center'} textTransform={'capitalize'}>{top3[2] ? top3[2].member_name : "NA"}</Text>
                                            {/* {top3[2] && (
                                                <Text color={"#ffffff"} fontSize="xs" fontWeight="normal">{top3[2].total_sold} {unit}</Text>
                                            )} */}
                                        </VStack>
                                    </VStack>
                                </VStack>
                            </HStack>
                            {/* <Stack paddingTop={7}>
                                <HStack padding={2} minHeight={105} justifyContent={'space-between'} alignItems={'center'} backgroundColor={colorTheme.normal} borderRadius={15} overflow={'hidden'} position={'relative'}>
                                    <VStack paddingX={3} width={'30%'} alignItems={'center'} justifyContent={'center'}>
                                        <Text color={"#ffffff"} fontSize="2xl" fontWeight="bold">2</Text>
                                        <Image style={{ width: 25, height: 25, resizeMode: 'contain' }} source={require('../assets/images/crown2.png')} />
                                        <Text color={"#ffffff"} fontSize="xs" fontWeight="bold" textAlign={'center'}>{top3[1] ? top3[1].member_name : "NA"}</Text>
                                        {top3[1] && (
                                            <Text color={"#ffffff"} fontSize="10" fontWeight="normal">{top3[1].total_sold} {unit}</Text>
                                        )}
                                    </VStack>
                                    <VStack paddingX={3} width={'30%'} alignItems={'center'} justifyContent={'center'}>
                                        <Text color={"#ffffff"} fontSize="2xl" fontWeight="bold">3</Text>
                                        <Image style={{ width: 25, height: 25, resizeMode: 'contain' }} source={require('../assets/images/crown3.png')} />
                                        <Text color={"#ffffff"} fontSize="xs" fontWeight="bold" textAlign={'center'}>{top3[2] ? top3[2].member_name : "NA"}</Text>
                                        {top3[2] && (
                                            <Text color={"#ffffff"} fontSize="10" fontWeight="normal">{top3[1].total_sold} {unit}</Text>
                                        )}
                                    </VStack>
                                </HStack>
                                <HStack width={'100%'} padding={2} justifyContent={'center'} alignItems={'center'} borderRadius={15} overflow={'hidden'} position={'absolute'} top={-2} left={0}>
                                    <VStack backgroundColor={colorTheme.dark} paddingX={3} width={'35%'} alignItems={'center'} justifyContent={'center'} height={150} borderTopRadius={30}>
                                        <Text color={"#ffffff"} fontSize="3xl" fontWeight="bold">1</Text>
                                        <Image style={{ width: 30, height: 30, resizeMode: 'contain' }} source={require('../assets/images/crown1.png')} />
                                        <Text color={"#ffffff"} fontSize="xs" fontWeight="bold" textAlign={'center'}>{top3[0] ? top3[0].member_name : "NA"}</Text>
                                        {top3[0] && (
                                            <Text color={"#ffffff"} fontSize="10" fontWeight="normal">{top3[0].total_sold} {unit}</Text>
                                        )}
                                    </VStack>
                                </HStack>
                            </Stack> */}
                        </Stack>
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />
                        <VStack padding={3} justifyContent={'center'} space={2}>
                            <HStack justifyContent={'space-between'} alignItems={'center'}>
                                <VStack space={1} width={'65%'}>
                                    <Text fontSize='sm' fontWeight="bold" color={"#111111"}>{t("Product Type")}</Text>
                                    <View style={styles.inputbox}>
                                        <Select variant="none" size="md"
                                            placeholder={t("Select Type *")}
                                            selectedValue={productType}
                                            onValueChange={value => onSelectProductType(value)}
                                            style={{ paddingLeft: 20, height: 45 }}
                                            _selectedItem={{
                                                backgroundColor: '#eeeeee',
                                                endIcon: <Icon name="checkmark-circle" size={18} color="#2BBB86" style={{ right: 0, position: 'absolute' }} />
                                            }}>
                                            {productList.map((item, index) =>
                                                <Select.Item key={index} label={item.tag_name} value={item.id} />
                                            )}
                                        </Select>
                                    </View>
                                </VStack>
                                <VStack space={1} width={'32%'}>
                                    <Text fontSize='sm' fontWeight="bold" color={"#111111"}>{t("My Rank")}</Text>
                                    <View style={styles.inputbox} backgroundColor={colorTheme.light}>
                                        <HStack space={2} alignItems={'center'} justifyContent={'center'} style={{ height: 45 }}>
                                            <Image style={{ width: 25, height: 20, resizeMode: 'contain' }} source={require("../assets/images/crown4.png")} />
                                            <Text color={"#111111"} fontSize="md" fontWeight="bold">{myRank}</Text>
                                        </HStack>
                                    </View>
                                </VStack>
                            </HStack>
                        </VStack>
                        {boardList.length != 0 ?
                            <VStack padding={3} justifyContent={'center'} space={2}>
                                {boardList.map((item, index) =>
                                    <HStack key={index} justifyContent={'space-between'} alignItems={'center'} borderColor={"#E2E2E2"} borderWidth={1} backgroundColor={item.rank == myRank ? colorTheme.light : "#FAFAFA"} paddingX={2} paddingY={1}>
                                        <HStack space={2} width={'60%'} alignItems={'center'}>
                                            <Text textAlign={'center'} width={5} color={"#111111"} fontSize="10" fontWeight="bold">{item.rank}</Text>
                                            <Image style={{ width: 30, height: 30, resizeMode: 'contain', backgroundColor: '#cccccc' }} source={{ uri: imageBase + item.profile_pic }} />
                                            <VStack>
                                                <Text color={"#111111"} fontSize="xs" fontWeight="bold" textTransform={'capitalize'}>{item.member_name}</Text>
                                                {/* <Text color={"#111111"} fontSize="11" fontWeight="medium" textTransform={'capitalize'}>{t("Member Id")}: {item.member_code}</Text> */}
                                            </VStack>
                                        </HStack>
                                        <HStack space={1} width={'30%'} alignItems={'center'} justifyContent={'flex-end'}>
                                            <Image style={{ width: 16, height: 10, resizeMode: 'contain' }} source={item.rank == 1 ? require("../assets/images/crown1.png") : item.rank == 2 ? require("../assets/images/crown2.png") : item.rank == 3 ? require("../assets/images/crown3.png") : item.rank == myRank ? require("../assets/images/crown4.png") : ""} />
                                            {/* <Text color={"#111111"} fontSize="xs" fontWeight="bold">{item.total_sold} {unit}</Text> */}
                                        </HStack>
                                    </HStack>
                                )}
                            </VStack>
                            :
                            <Stack space={5} style={[styles.productbox, { justifyContent: 'center', alignItems: 'center', padding: 70 }]}>
                                <Text fontSize='lg' fontWeight="bold" textAlign="center" color="#111111">{t("Result Not Found")}</Text>
                                <Text fontSize='sm' fontWeight="medium" textAlign="center" color="#666666">{t("Whoops... This Information is not available for a moment")}</Text>
                            </Stack>
                        }
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
    inputbox: { backgroundColor: '#ffffff', borderRadius: 6, width: '100%', overflow: 'hidden', borderColor: '#e7e7e9', borderWidth: 1 },
    custbtn: { width: '100%', borderRadius: 6, overflow: 'hidden', height: 48, marginTop: 10 },
    spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
});

export default BoardDetailsScreen;
