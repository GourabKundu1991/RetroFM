import { HStack, Stack, Text, VStack } from "native-base";
import { Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from 'react-native-vector-icons/Ionicons';

export const HeadingBox = ({ colorTheme, prefixIcon, title, desc, suffixIcon }) => {
    return (
        <LinearGradient
            start={{ x: 0, y: 0.5 }}    // start from left-center
            end={{ x: 1, y: 0.5 }}      // end at right-center
            colors={colorTheme ? [colorTheme?.dark, colorTheme?.normal, colorTheme?.light] : ['#0b353b', '#107b3f', '#16c151', '#117845']}
            style={{ paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, elevation: 4, justifyContent: 'center', width: '100%' }}
        >
            <HStack justifyContent={'space-between'} alignItems={'center'}>
                <HStack alignItems={'center'}>
                    <Image source={prefixIcon} style={{ width: 70, height: 70, resizeMode: 'contain' }} />
                    <Stack mx={1} />
                    <VStack>
                        {(title) && (
                            <Text color={'white'} fontWeight={'bold'} fontSize={"lg"}>{title}</Text>
                        )}
                        {(desc) && (
                            <Text color={'white'}>{desc}</Text>
                        )}
                    </VStack>
                </HStack>
                {(suffixIcon) && (
                    <Icon name={suffixIcon} size={40} color={'white'} />
                )}
            </HStack>
        </LinearGradient>
    );
}