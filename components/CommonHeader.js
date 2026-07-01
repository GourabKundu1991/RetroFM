import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Box, HStack, Image, Input, Stack, Text } from 'native-base'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next'

const CommonHeader = ({ showBack, onPressBack, showMenu, search, title, suffixIcon, onPressSuffix, colorTheme, showCart, cartCount }) => {
    const { t } = useTranslation();
    const height = Dimensions.get('window').height;
    const navigation = useNavigation();
    return (
        <Box style={{ height: height * 0.08, justifyContent: 'center' }}>
            <Stack justifyContent={'center'}>
                <HStack px={4} justifyContent={'space-between'} alignItems={'center'}>
                    <HStack alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
                        {(showBack) && (
                            <TouchableOpacity style={{ borderRadius: 15, width: 40, height: 40, backgroundColor: '#222222', justifyContent: 'center', alignItems: 'center' }} onPress={() => {
                                if (onPressBack) {
                                    onPressBack();
                                    return;
                                }
                                navigation.goBack()
                            }}>
                                <Icon name="arrow-back-outline" size={22} color="#fc030b" />
                            </TouchableOpacity>
                        )}
                        {(showMenu) && (
                            <TouchableOpacity style={{ borderRadius: 15, width: 40, height: 40, backgroundColor: '#222222', justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.openDrawer()}>
                                <Icon name="menu" size={26} color={'#fc030b'} />
                            </TouchableOpacity>
                        )}
                        {search != false && (
                        <View style={[styles.inputbox, { width: '65%' }]}>
                            <Input
                                size="md"
                                style={{ height: 38, color: '#ffffff' }}
                                //onChangeText={(text) => setEmail(text)}
                                InputRightElement={<Icon name="search" size={18} color={'#ffffff'} />}
                                value={""}
                                keyboardType='email-address'
                                variant="unstyled"
                                placeholder={t("Search ....")}
                            />
                        </View>
                        )}
                        {/* {(title) && (
                            <Text lineHeight={18} fontSize={'md'} color={'#ffffff'}>{title}</Text>
                        )} */}
                        <Box style={{ borderRadius: 15, width: 40, height: 40, backgroundColor: '#222222', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/images/logo.png')} style={{ width: 40, height: 40 }} />
                        </Box>
                        {/* {(suffixIcon) && (
                            <TouchableOpacity disabled={!onPressSuffix} onPress={() => onPressSuffix()}>
                                <Icon name={suffixIcon} size={22} color={'#fc030b'} />
                            </TouchableOpacity>
                        )} */}
                    </HStack>
                </HStack>
            </Stack>
        </Box>
    )
}

export default CommonHeader

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },
    inputbox: { borderRadius: 15, overflow: 'hidden', height: 40, paddingHorizontal: 10, borderWidth: 1, borderColor: '#444444' },
})