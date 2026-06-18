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
        // <LinearGradient
        //     start={{ x: 0, y: 0.5 }}    // start from left-center
        //     end={{ x: 1, y: 0.5 }}      // end at right-center
        //     colors={colorTheme ? [colorTheme?.dark, colorTheme?.normal, colorTheme?.light] : ['#0b353b', '#107b3f', '#16c151', '#117845']}
        //     style={{ height: height * 0.08, elevation: 10, justifyContent: 'center' }}
        // >
        <Box
            bgColor={colorTheme?.normal}
            style={{ height: height * 0.08, elevation: 10, justifyContent: 'center' }}
        >
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
                                <Icon name="arrow-back-outline" size={22} color="#ffffff" />
                            </TouchableOpacity>
                        )}
                        {(showMenu) && (
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Icon name="menu" size={22} color={'white'} />
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
                                <Icon name={suffixIcon} size={28} color={'white'} />
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
            {/* </LinearGradient> */}
        </Box>
    )
}

export default CommonHeader

const styles = StyleSheet.create({
    noti: { color: '#ffffff', width: 18, height: 18, borderRadius: 20, position: 'absolute', top: -5, right: -3, fontSize: 11, lineHeight: 16, paddingTop: 1, textAlign: 'center', overflow: 'hidden' },

})