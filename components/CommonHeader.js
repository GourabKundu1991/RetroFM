import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Box, HStack, Stack, Text } from 'native-base'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons';

const CommonHeader = ({ showBack, onPressBack, showMenu, title, suffixIcon, onPressSuffix, colorTheme, showCart, cartCount }) => {
    const height = Dimensions.get('window').height;
    const navigation = useNavigation();
    return (
        <Box style={{ height: height * 0.08,  justifyContent: 'center', borderColor: '#333333', borderBottomWidth: 1 }}>
            <Stack justifyContent={'center'}>
                <HStack px={4} justifyContent={'space-between'} alignItems={'center'}>
                    <HStack alignItems={'center'}>
                        {(showBack) && (
                            <TouchableOpacity onPress={() => {
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
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Icon name="menu" size={22} color={'#fc030b'} />
                            </TouchableOpacity>
                        )}
                        <View style={{ width: 10 }} />
                        {(title) && (
                            <Text lineHeight={18} fontSize={'lg'} color={'#ffffff'} fontWeight={'semibold'}>{title}</Text>
                        )}
                    </HStack>
                    <HStack alignItems={'center'} space={3}>
                        {(suffixIcon) && (
                            <TouchableOpacity disabled={!onPressSuffix} onPress={() => onPressSuffix()}>
                                <Icon name={suffixIcon} size={22} color={'#fc030b'} />
                            </TouchableOpacity>
                        )}
                        {(showCart) && (
                            <TouchableOpacity onPress={() => navigation.push('MyCart')} style={{ position: 'relative' }}>
                                <Icon name="cart-outline" size={28} color="#ffffff" />
                                {(cartCount != null && cartCount != 0) && (<Text style={[styles.noti, { backgroundColor: '#000000' }]}>{cartCount}</Text>)}
                            </TouchableOpacity>
                        )}
                    </HStack>
                </HStack>
            </Stack>
        </Box>
    )
}

export default CommonHeader

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },

})