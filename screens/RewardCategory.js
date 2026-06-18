import { ActivityIndicator, Dimensions, Image, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { Box, HStack, NativeBaseProvider, ScrollView, Stack, Text, VStack } from 'native-base'
import CommonHeader from '../components/CommonHeader'
import { t } from 'i18next'
import BottomTabs from '../components/BottomTabs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AccessToken, API_KEY, BASE_URL } from '../auth_provider/Config'
import { HeadingBox } from '../components/CommonComponent'
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../api/apiClient'

const RewardCategory = ({ navigation }) => {

    const [loading, setLoading] = React.useState(false);
    const [colorTheme, setColorTheme] = React.useState("");
    const [allcategories, setAllcategories] = React.useState([]);
    const width = Dimensions.get('window').width;
    const height = Dimensions.get('window').height;

    const [imageBase, setImageBase] = React.useState("");

    useEffect(() => {
        setLoading(true);
        getAllData();
    }, [])

    const getAllData = () => {
        AsyncStorage.getItem('userToken').then(val => {
            if (val != null) {
                setImageBase(JSON.parse(val).BaseUrl);
                setColorTheme(JSON.parse(val).info.theme_color);
                let formdata = new FormData();
                formdata.append("APIkey", `${API_KEY}`);
                formdata.append("orgId", JSON.parse(val).org_id);
                apiClient
                    .post(`${BASE_URL}/get_dashboard_info`, formdata, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            accesstoken: `${AccessToken}`,
                            useraccesstoken: JSON.parse(val).token
                        },
                    }).then(response => {
                        return response;
                    })
                    .then((responseJson) => {
                        console.log("responseJson: ",  responseJson.data);
                        if (responseJson.data.bstatus == 1) {
                            setLoading(false);
                            setAllcategories(responseJson.data.categories);
                        } else {
                            setLoading(false);
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.log("default_value_for_vriddhi_sales_revamp Error:", error);
                        Toast.show({ description: t("Sorry! Somthing went Wrong. Maybe Network request Failed") });
                    });
            } else {
                setLoading(false);
                AsyncStorage.clear();
                navigation.navigate('Welcome');
            }
        });
    }

    const Item = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate("Rewards", { cateId: item.categoryId })} activeOpacity={0.5}>
                <VStack mb={4} height={height * 0.11} width={width * 0.2} alignItems={'center'} >
                    <Box bgColor={colorTheme.light} width={60} height={60} borderRadius={30} alignItems={'center'} justifyContent={'center'}>
                        {item.isCategoryImage === 1 ?
                            <Image style={{ width: 30, height: 30, resizeMode: 'contain' }} source={{ uri: imageBase + item.categoryImage }} />
                            :
                            <Icon name={item.categoryImage} size={30} color={colorTheme.normal} />
                        }
                    </Box>
                    <Text noOfLines={2} lineHeight={'xs'} mt={1} fontSize={'xs'} textAlign={'center'}>{item.categoryName}</Text>
                </VStack>
            </TouchableOpacity>
        );
    }

    return (
        <NativeBaseProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <CommonHeader
                navigation={navigation}
                showBack={true}
                title={t('Rewards')}
                colorTheme={colorTheme}
            />
            <Box px={4} flex={1} bgColor={'#F1F1F1'}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Stack my={2} />
                    <Image source={require('../assets/images/rewards.png')} style={{ width: '100%', height: 120, borderRadius: 10 }} />
                    <Stack my={2} />
                    {(allcategories.length > 0) && (
                        <HStack bgColor={'white'} justifyContent={'space-between'} px={3} py={5} borderRadius={10} overflow={'hidden'} flexWrap={'wrap'}>
                            {allcategories.map((item, index) => (
                                <Item key={index} item={item} />
                            ))}
                        </HStack>
                    )}
                    <Stack my={4} />
                </ScrollView>
            </Box>
            <BottomTabs
                selected={1}
                colorTheme={colorTheme}
            />
            {loading && (
                <View style={styles.spincontainer}>
                    <ActivityIndicator animating={loading} size="large" color={colorTheme?.normal} />
                </View>
            )}
        </NativeBaseProvider>
    )
}

export default RewardCategory

const styles = StyleSheet.create({
    spincontainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)'
    },
    listContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        elevation: 4
    }
})