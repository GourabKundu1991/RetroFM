import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Box, Center, HStack, Icon, Pressable, Text } from 'native-base';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';

const BottomTabs = ({ selected = 0, colorTheme }) => {
    // const [selected, setSelected] = React.useState(0);
    const navigation = useNavigation();

    return (
        <HStack bg="white" alignItems="center" safeAreaBottom shadow={6}>
            <MenuItem
                name={t('Home')}
                icon={'home-outline'}
                selectedIcon={'home'}
                isSelected={selected == 0}
                color={colorTheme?.normal}
                onPress={() => {
                    if (selected != 0) {
                        navigation.navigate('Home');
                    }
                }}
            />
            <MenuItem
                name={t('Rewards')}
                icon={'gift-outline'}
                selectedIcon={'gift'}
                isSelected={selected == 1}
                color={colorTheme?.normal}
                onPress={() => {
                    if (selected != 1) {
                        navigation.navigate('RewardCategory');
                    }
                }}
            />
            <MenuItem
                name={t('My Cart')}
                icon={'bag-handle-outline'}
                selectedIcon={'bag-handle'}
                isSelected={selected == 2}
                color={colorTheme?.normal}
                onPress={() => {
                    if (selected != 2) {
                        navigation.navigate('MyCart');
                    }
                }}
            />
            <MenuItem
                name={t('My Profile')}
                icon={'person-outline'}
                selectedIcon={'person'}
                isSelected={selected == 3}
                color={colorTheme?.normal}
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
        <Pressable borderBottomWidth={isSelected ? 3 : 0} borderColor={color ?? '#00915D'} cursor="pointer" opacity={isSelected ? 1 : 0.5} py="3" flex={1} onPress={() => onPress()}>
            <Center>
                <Icon mb="1" as={<IonIcons name={isSelected ? selectedIcon : icon} />} color={isSelected ? color ?? color : "gray.700"} size="lg" />
                {(isSelected) && (
                    <Box backgroundColor={color} style={{width: 6, height: 6, marginTop: 5}} borderRadius={20} overflow={'hidden'}></Box>
                )}
            </Center>
        </Pressable>
    );
}

export default BottomTabs

const styles = StyleSheet.create({})