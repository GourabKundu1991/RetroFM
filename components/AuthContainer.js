import { View, Text, Image, StyleSheet, Platform, ScrollView } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { VStack } from 'native-base'

const AuthContainer = ({ bgImg, marginTop, children }) => {
    const img = bgImg ?? require('../assets/images/auth_bg.png')
    return (
        <LinearGradient
            colors={['#ffffff', '#ffffff', '#dcece1', '#c0ddc7', '#a8d1b1',]} // define gradient colors
            style={{ flex: 1, justifyContent: 'center' }}
        >
            <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
                <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                <Image source={img} style={styles.bg} />
                <VStack style={styles.content}>
                    {children}
                </VStack>
            </ScrollView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    logo: { width: 120, height: 50, marginTop: 50, resizeMode: 'contain', alignSelf: 'center' },
    bg: {
        width: '90%',
        height: 300,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
    content: {
        marginTop: 0,
        marginBottom: 20,
        backgroundColor: 'white',
        width: '85%',
        alignSelf: 'center',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0,0.5)',
                shadowRadius: 1,
                shadowOpacity: 0.5,
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
            },
            android: {
                shadowColor: 'rgba(0,0,0,0.6)',
                elevation: 4
            }
        }),
    }
});

export default AuthContainer