import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Box, Center, HStack, Icon, Pressable, Text } from 'native-base';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';

const BottomTabs = ({ selected = 0 }) => {

    const navigation = useNavigation();

    return (
        <HStack alignItems="center" /* safeAreaBottom */ style={{ borderColor: '#444444', borderTopWidth: 1 }}>
            <MenuItem
                name={t('Home')}
                icon={'home-outline'}
                selectedIcon={'home-outline'}
                isSelected={selected == 0}
                color={"#fc030b"}
                onPress={() => {
                    if (selected != 0) {
                        navigation.navigate('Home');
                    }
                }}
            />
            <MenuItem
                name={t('My Library')}
                icon={'book-outline'}
                selectedIcon={'book-outline'}
                isSelected={selected == 1}
                color={"#fc030b"}
                onPress={() => {
                    if (selected != 1) {
                        navigation.navigate('MyLibrary');
                    }
                }}
            />
            <MenuItem
                name={t('Language')}
                icon={'language-outline'}
                selectedIcon={'language-outline'}
                isSelected={selected == 2}
                color={"#fc030b"}
                onPress={() => {
                    if (selected != 2) {
                        navigation.navigate('MyCart');
                    }
                }}
            />
            <MenuItem
                name={t('Premium')}
                icon={'diamond-outline'}
                selectedIcon={'diamond-outline'}
                isSelected={selected == 3}
                color={"#fc030b"}
                onPress={() => {
                    if (selected != 3) {
                        navigation.navigate('Profile');
                    }
                }}
            />
        </HStack>
    )
}

const MenuItem = ({ isSelected, name, selectedIcon, icon, onPress, color }) => {
    return (
        <Pressable cursor="pointer" opacity={isSelected ? 1 : 0.5} py="3" flex={1} onPress={() => onPress()}>
            <Center>
                <Icon mb="1" as={<IonIcons name={isSelected ? selectedIcon : icon} />} color={isSelected ? color ?? color : "#cccccc"} size="lg" />
                <Text color={isSelected ? color ?? color : "#cccccc"} fontSize="xs">{name}</Text>
            </Center>
        </Pressable>
    );
}

export default BottomTabs

const styles = StyleSheet.create({})