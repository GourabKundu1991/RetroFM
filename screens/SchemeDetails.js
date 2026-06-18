import {
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  HStack,
  Input,
  NativeBaseProvider,
  Popover,
  ScrollView,
  Stack,
  Text,
  Toast,
  VStack,
} from "native-base";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import CommonHeader from "../components/CommonHeader";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../assets/language/i18n";
import { AccessToken, API_KEY, BASE_URL } from "../auth_provider/Config";
import apiClient from "../api/apiClient";
import Icon from 'react-native-vector-icons/Ionicons';

const SchemeDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { item } = route.params;
  const [colorTheme, setColorTheme] = React.useState("");
  const [currentLanguage, setLanguage] = React.useState("Eng");
  const [loading, setLoading] = React.useState(false);
  const schemeId = item.id;

  const [schemeLevel, setSchemeLevel] = React.useState([]);
  const [leftDays, setLeftDays] = React.useState("");
  const [schemeDetails, setSchemeDetails] = React.useState("");
  const [userEligibleBenefit, setUserEligibleBenefit] = React.useState("");
  const [userSaleDetails, setUserSaleDetails] = React.useState("");
  const [schemeType, setSchemeType] = React.useState("");
  const [kindBenefits, setKindBenefits] = React.useState([]);
  const [expanded, setExpanded] = React.useState(false);
  const [schemePop, setSchemePop] = React.useState(false);

  const [tierType, setTierType] = React.useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      AsyncStorage.getItem("language").then((val) => {
        if (val != null) {
          setLanguage(val);
          i18n
            .changeLanguage(val)
            .then(() => console.log(val))
            .catch((err) => console.log(err));
        } else {
          i18n
            .changeLanguage(currentLanguage)
            .then(() => console.log())
            .catch((err) => console.log());
        }
      });
      AsyncStorage.getItem("userToken").then((val) => {
        if (val != null) {
          setColorTheme(JSON.parse(val).info.theme_color);
          Events.publish("colorTheme", val.info.theme_color);
        }
      });
      setLoading(true);
      getAllData();
    });
    return unsubscribe;
  }, []);

  const getAllData = () => {
    AsyncStorage.getItem("userToken").then((val) => {
      if (val != null) {
        console.log('Tokeennn', JSON.parse(val).token);
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("orgId", JSON.parse(val).org_id);
        formdata.append("scheme_id", Number(schemeId));
        console.log(formdata);
        apiClient
          .post(`${BASE_URL}/get_scheme_data`, formdata, {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
              accesstoken: `${AccessToken}`,
              useraccesstoken: JSON.parse(val).token,
            },
          })
          .then((response) => {
            return response.data;
          })
          .then((responseJson) => {
            console.log("get_Scheme_benefits:", responseJson.scheme_benifits.scheme_details);
            if (responseJson.bstatus == 1) {
              setLoading(false);
              setSchemeLevel(responseJson.scheme_benifits.scheme_details.benefits);
              setLeftDays(responseJson.scheme_benifits.scheme_details.remaining_days);
              setSchemeDetails(responseJson.scheme_benifits.scheme_details);
              setUserEligibleBenefit(responseJson.scheme_benifits.user_eligible_benefit);
              setUserSaleDetails(responseJson.scheme_benifits.user_sale_details);
              setSchemeType(responseJson.scheme_benifits.scheme_type);
              setKindBenefits(responseJson.scheme_benifits.scheme_details.kinds_benefits);
              setTierType(responseJson.scheme_benifits.scheme_details.tier_or_volume_wise);
            } else {
              Toast.show({ description: responseJson.message });
              setTimeout(function () {
                setLoading(false);
                if (responseJson.message == "Session is expired") {
                  AsyncStorage.clear();
                  navigation.navigate("Welcome");
                }
              }, 1000);
            }
          })
          .catch((error) => {
            setLoading(false);
            Toast.show({
              description: t(
                "Sorry! Something went Wrong. Maybe Network request Failed dfdfddsf"
              ),
            });
          });
      } else {
        setLoading(false);
        AsyncStorage.clear();
        navigation.navigate("Welcome");
      }
    });
  };

  const IconBox = ({ children, bg }) => (
    <Box bg={bg} p={2} borderRadius="full">
      {children}
    </Box>
  );

  const Card = ({ children }) => (
    <Box
      bg="white"
      borderRadius="xl"
      p={4}
      flex={1}
      mx={1}
      borderWidth={0.5}
      borderColor="#999999"
    >
      {children}
    </Box>
  );

  const firstLockedIndex = schemeLevel.findIndex(item => item.remaining);
  const lastAchievedIndex = schemeLevel.map(item => item.achieved).lastIndexOf(true);

  const currentIndexKindBenefits = kindBenefits.map((item) => item.level_status).lastIndexOf('current');

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <CommonHeader
        navigation={navigation}
        showBack={true}
        title={t(schemeDetails.scheme_title)}
        colorTheme={colorTheme}
      />

      {schemeType == "Others" ?
        <Box flex={1}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Box p={4}>

              {/* <HStack mb={3}>
                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#E8F5E9">
                        <Image
                          source={require("../assets/images/achievement.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="xs" color="black">
                          Last {tierType != "tier_wise" ? 'Achievement' : 'Tier'}
                        </Text>
                        <Text bold fontSize="lg" color="#2E7D32">
                          {userEligibleBenefit.total_benefit_earn == 0 ? "N/A" :
                            tierType != "tier_wise" ?
                              userEligibleBenefit.total_benefit_earn
                              :
                              schemeLevel[lastAchievedIndex].tier_title
                          }
                        </Text>
                      </VStack>
                    </HStack>
                    {userEligibleBenefit.total_benefit_earn != 0 && (
                      <Badge bg="#E0F2F1" borderRadius="md">
                        <Text>+ {Number(userSaleDetails.total_sales - userEligibleBenefit.cumulative_qty)} {userEligibleBenefit.product_classification_unit_reward}</Text>
                      </Badge>
                    )}
                  </VStack>
                </Card>

                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#E3F2FD">
                        <Image
                          source={require("../assets/images/level.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="xs" color="black">
                          Current {tierType != "tier_wise" ? 'Level' : 'Tier'}
                        </Text>
                        {firstLockedIndex < 0 ?
                          <Text bold fontSize="lg" color="#1565C0">N/A</Text>
                          :
                          tierType != "tier_wise" ?
                            <Text bold fontSize="lg" color="#1565C0">
                              Level {firstLockedIndex + 1}
                            </Text>
                            :
                            <Text bold fontSize="lg" color="#1565C0">
                              {schemeLevel[firstLockedIndex].tier_title}
                            </Text>
                        }
                      </VStack>
                    </HStack>
                    {firstLockedIndex >= 0 && (
                      <Badge bg="#E3F2FD"><Text>{schemeLevel[firstLockedIndex].remaining_volume} Target</Text></Badge>
                    )}
                  </VStack>
                </Card>
              </HStack>

              <HStack mb={3}>
                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#FFF3E0">
                        <Image
                          source={require("../assets/images/target.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="xs" color="black">
                          Next {tierType != "tier_wise" ? 'Target' : 'Tier'}
                        </Text>
                        {(firstLockedIndex < 0 || firstLockedIndex == schemeLevel.length -1) ?
                          <Text bold fontSize="lg" color="#eab676">N/A</Text>
                          :
                          tierType != "tier_wise" ?
                            <Text bold fontSize="lg" color="#eab676">{schemeLevel[firstLockedIndex + 1].cumulative_qty} {schemeLevel[firstLockedIndex + 1].product_classification_unit_reward}</Text>
                            :
                            <Text bold fontSize="lg" color="#eab676">
                              {schemeLevel[firstLockedIndex + 1].tier_title}
                            </Text>
                        }
                      </VStack>
                    </HStack>
                    {(firstLockedIndex >= 0 && firstLockedIndex !== schemeLevel.length -1 ) && (
                      <Badge bg="#FFF3E0"><Text>{schemeLevel[firstLockedIndex + 1].remaining_volume} to {tierType != "tier_wise" ? 'level' : 'tier'} up</Text></Badge>
                    )}
                  </VStack>
                </Card>

                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#FFEBEE">
                        <Image
                          source={require("../assets/images/calendar.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="xs" color="black">
                          Days Remaining
                        </Text>
                        <Text bold fontSize="lg" color="#D32F2F">
                          {leftDays}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge bg="#FFCDD2"><Text fontSize={13}>Remaining in this scheme</Text></Badge>
                  </VStack>
                </Card>
              </HStack> */}

              <HStack mb={3}>
                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="orange.100">
                        <Image
                          source={require("../assets/images/level.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="10" color="black">
                          Current {tierType != "tier_wise" ? 'Level' : 'Tier'}
                        </Text>
                        {firstLockedIndex < 1 && lastAchievedIndex < 0 ?
                          <Text bold fontSize="lg" color="orange.500">N/A</Text>
                          :
                          tierType != "tier_wise" ?
                            <Text bold fontSize="lg" color="orange.500">
                              Level {firstLockedIndex > 1 ? firstLockedIndex : lastAchievedIndex + 1}
                            </Text>
                            :
                            <Text bold fontSize="lg" color="orange.500">
                              {schemeLevel[firstLockedIndex].tier_title}
                            </Text>
                        }
                      </VStack>
                    </HStack>
                    {/* {firstLockedIndex >= 1 && (
                      <Badge bg="orange.100"><Text>{schemeLevel[firstLockedIndex - 1].remaining_volume} Target</Text></Badge>
                    )} */}
                  </VStack>
                </Card>
                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#E8F5E9">
                        <Image
                          source={require("../assets/images/achievement.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="10" color="black">
                          Current {tierType != "tier_wise" ? 'Achievement' : 'Tier'}
                        </Text>
                        <Text bold fontSize="lg" color="#2E7D32">
                          {userEligibleBenefit.total_benefit_earn == 0 ? "N/A" :
                            tierType != "tier_wise" ?
                              userEligibleBenefit.total_benefit_earn
                              :
                              schemeLevel[lastAchievedIndex].tier_title
                          }
                          {userEligibleBenefit.total_benefit_earn != 0 && (
                            <Text bold fontSize="xs">
                              ({schemeType == "Incentive" ? "INR" : "Points"})
                            </Text>
                          )}
                        </Text>
                      </VStack>
                    </HStack>
                    {/* {userEligibleBenefit.total_benefit_earn != 0 && (
                      <Badge bg="#E0F2F1" borderRadius="md">
                        <Text>+ {Number(userSaleDetails.total_sales - userEligibleBenefit.cumulative_qty)} {userEligibleBenefit.product_classification_unit_reward}</Text>
                      </Badge>
                    )} */}
                  </VStack>
                </Card>
              </HStack>

              <HStack mb={3}>
                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#E3F2FD">
                        <Image
                          source={require("../assets/images/target.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="10" color="black">
                          Next {tierType != "tier_wise" ? 'Target' : 'Tier'}
                        </Text>
                        {(firstLockedIndex < 0) ?
                          <Text bold fontSize="lg" color="#1565C0">N/A</Text>
                          :
                          tierType != "tier_wise" ?
                            <Text bold fontSize="lg" color="#1565C0">{schemeLevel[firstLockedIndex].cumulative_qty} {schemeLevel[firstLockedIndex].product_classification_unit_reward}</Text>
                            :
                            <Text bold fontSize="lg" color="#1565C0">
                              {schemeLevel[firstLockedIndex].tier_title}
                            </Text>
                        }
                      </VStack>
                    </HStack>
                    {(firstLockedIndex >= 0) && (
                      <Badge bg="#E3F2FD"><Text>{schemeLevel[firstLockedIndex].remaining_volume} to {tierType != "tier_wise" ? 'level' : 'tier'} up</Text></Badge>
                    )}
                  </VStack>
                </Card>

                <Card>
                  <VStack space={3}>
                    <HStack alignItems="center" space={2}>
                      <IconBox bg="#FFEBEE">
                        <Image
                          source={require("../assets/images/calendar.png")}
                          style={{ width: 20, height: 20 }}
                          resizeMode="contain"
                        />
                      </IconBox>
                      <VStack>
                        <Text bold fontSize="10" color="black">
                          Days Remaining
                        </Text>
                        <Text bold fontSize="lg" color="#D32F2F">
                          {leftDays}
                        </Text>
                      </VStack>
                    </HStack>
                    {/* <Badge bg="#FFCDD2"><Text fontSize={13}>Remaining in this scheme</Text></Badge> */}
                  </VStack>
                </Card>
              </HStack>

              <Box
                bg="#F5E6C8"
                borderRadius="xl"
                p={5}
                mb={4}
                overflow="hidden"
                borderWidth={0.5}
                borderColor={"#999999"}
              >
                <Image
                  source={require("../assets/images/trophy.png")}
                  position="absolute"
                  right={20}
                  bottom={5}
                  size="32"
                  resizeMode="contain"
                  opacity={0.7}
                />
                {firstLockedIndex >= 0 ?
                  <Box>
                    <Text bold fontSize="lg">
                      You are in the right track!
                    </Text>
                    <Text fontSize="md" mt={1}>
                      Only {schemeLevel[firstLockedIndex].remaining_volume} left to reach {tierType != "tier_wise" ? 'Level ' + (firstLockedIndex + 1) : schemeLevel[firstLockedIndex].tier_title} and Unlock Exciting Rewards!
                    </Text>
                  </Box>
                  :
                  <Box>
                    <Text bold fontSize="lg">
                      Many Many Congratulations!
                    </Text>
                    <Text fontSize="md" mt={1}>
                      You have achieved the final milestone!
                    </Text>
                  </Box>
                }
              </Box>

              <Box
                borderRadius="xl"
                overflow="hidden"
                borderWidth={0.5}
                borderColor="#999999"
                bg="white"
              >
                <LinearGradient colors={[colorTheme.normal, colorTheme.normal]}>
                  <Box p={3}>
                    <Text bold textAlign="center" color={'#ffffff'}>
                      Scheme Level Overview
                    </Text>
                  </Box>
                </LinearGradient>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Box>

                    <HStack mb={2} backgroundColor={"#eeeeee"} paddingX={5} paddingY={3}>
                      <Text bold w={tierType != "tier_wise" ? "90px" : "140"} fontSize="xs">
                        {tierType != "tier_wise" ? 'Levels' : 'Tiers'}
                      </Text>
                      <Text bold w="100px" fontSize="xs" textAlign={'center'}>
                        Status
                      </Text>
                      <Text bold w="120px" fontSize="xs" textAlign={'center'}>
                        Target
                      </Text>
                      <Text bold w="80px" fontSize="xs" textAlign={'center'}>
                        Achieved
                      </Text>
                      <Text bold w="120px" fontSize="xs" textAlign={'center'}>
                        Remaining
                      </Text>
                      <Text bold w="140px" fontSize="xs" textAlign={'center'}>
                        Benifits  <Text fontSize="9">({schemeType == "Incentive" ? "INR" : "Points"} per Bag)</Text>
                      </Text>
                    </HStack>

                    {schemeLevel.map((item, index) => {
                      const isNextTarget = index === firstLockedIndex;
                      const isLastAchieved = index === lastAchievedIndex;
                      return (
                        <HStack key={index} paddingX={5} paddingY={3} alignItems={'center'} opacity={item.achieved ? isLastAchieved && schemeLevel.length == index + 1 ? 1 : 0.5 : 1} backgroundColor={item.achieved ? isLastAchieved && schemeLevel.length == index + 1 ? "#ffffff" : "#eeeeee" : 1}>
                          <HStack w={tierType != "tier_wise" ? "90px" : "140"} space={1} alignItems={'center'}>
                            {item.achieved ?
                              <Image source={require("../assets/images/achieved.png")} resizeMode="contain" />
                              :
                              <View>
                                {!isNextTarget ?
                                  <Image source={require("../assets/images/locked.png")} resizeMode="contain" />
                                  :
                                  <Image source={require("../assets/images/inprogress.png")} resizeMode="contain" />
                                }
                              </View>
                            }
                            {tierType != "tier_wise" ?
                              <Text>Level {index + 1}</Text>
                              :
                              <Text>{item.tier_title}</Text>
                            }
                          </HStack>
                          <Box w="100px" alignSelf={'center'}>
                            {item.achieved ?
                              <Badge bg="green.600" borderRadius={5}>
                                <Text color={"#ffffff"}>Achieved</Text>
                              </Badge>
                              :
                              <Badge bg={isNextTarget ? "blue.500" : "gray.500"} borderRadius={5}>
                                <Text color={"#ffffff"}>{isNextTarget ? "Ongoing" : "Locked"}</Text>
                              </Badge>
                            }
                          </Box>
                          <Text w="120px" textAlign={'center'}>{item.cumulative_qty} {item.product_classification_unit_reward}</Text>
                          <Text w="80px" textAlign={'center'}>{item.total_sales} {item.product_classification_unit_reward}</Text>
                          <Text w="120px" textAlign={'center'}>{item.remaining_volume}</Text>
                          <Stack w="140px" alignItems={'center'}>
                            {item.mbm_reward != null ?
                              <Text textAlign={'center'}>{item.mbm_reward}</Text>
                              :
                              <Box>
                                {(item.premium_reward != 0 && item.premium_reward != null) && (
                                  <Text textAlign={'center'} fontSize={10} color={"#666666"}>Premium Reward: <Text fontSize={12} color={"#000000"}>{item.premium_reward}</Text></Text>
                                )}
                                {(item.regular_reward != 0 && item.regular_reward != null) && (
                                  <Text textAlign={'center'} fontSize={10} color={"#666666"}>Regular Reward: <Text fontSize={12} color={"#000000"}> {item.regular_reward}</Text></Text>
                                )}
                                {(item.fpp_reward != 0 && item.fpp_reward != null) && (
                                  <Text textAlign={'center'} fontSize={10} color={"#666666"}>FPP Reward: <Text fontSize={12} color={"#000000"}>{item.fpp_reward}</Text></Text>
                                )}
                              </Box>
                            }
                          </Stack>
                        </HStack>
                      );
                    })}
                  </Box>
                </ScrollView>
              </Box>

              <Box
                mt={4}
                bg="#E8F5E9"
                borderRadius="xl"
                p={4}
                borderWidth={0.5}
                borderColor={"#999999"}
              >
                <HStack space={2} alignItems="center">
                  <Image
                    source={require("../assets/images/calendar_big.png")}
                    size="3"
                    resizeMode="contain"
                    style={{width: 55, height: 55}}
                  />
                  {firstLockedIndex >= 0 ?
                    <VStack>
                      <Text bold fontSize="sm">{leftDays} left to reach {tierType != "tier_wise" ? 'Level-' + [schemeLevel.length] : schemeLevel[schemeLevel.length - 1].tier_title} Target!</Text>
                      <Text fontSize="xs">
                        You are on track to reach your target!
                      </Text>
                    </VStack>
                    :
                    <VStack>
                      <Text bold>{leftDays} left to complete the scheme.</Text>
                      <Text fontSize="sm">
                        You have achieved the final milestone!
                      </Text>
                    </VStack>
                  }
                </HStack>
              </Box>
            </Box>
          </ScrollView>
        </Box>
        :
        <Box flex={1}>
          {kindBenefits.length !== 0 && (
            <ImageBackground
              source={require("../assets/images/whitebgscheme.png")}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false} width={"100%"}>
                <VStack space={3} px={3} mt={3}>
                  <HStack justifyContent="space-between" w="100%">
                    <Box w="48%">
                      <Pressable
                        style={{ flex: 1 }}
                        onPress={() => setExpanded(!expanded)}
                      >
                        <Box
                          p={4}
                          bg="#E8F5E9"
                          borderWidth={0.5}
                          borderRadius="xl"
                          borderColor="#3B3D3F"
                          flex={1}
                        >
                          <Box mr={1}>
                            <Text bold>Last Achievements</Text>
                            {userEligibleBenefit.total_benefit_earn == 0 ?
                              <Text bold fontSize="2xl">N/A</Text>
                              :
                              <View>
                                <Text fontSize={"xs"}>Cumulative Volume: {userEligibleBenefit.cumulative_volume}</Text>
                                <Text fontSize={"xs"}>Percentage: : {userEligibleBenefit.flat_or_percentage}</Text>
                                <Text fontSize={"xs"}>Premium Value: {userEligibleBenefit.premium_value}</Text>
                                {expanded && (
                                  <Box mr={1}>
                                    <Text fontSize={"xs"}>Minimum Volume: {userEligibleBenefit.minimum_volume_in_certain_period_month_count}</Text>
                                    <Text fontSize={"xs"}>Period(Months): {userEligibleBenefit.period_in_month}</Text>
                                    <Text fontSize={"xs"}>Minimum Existence: {userEligibleBenefit.minimum_existence_in_the_system}</Text>
                                  </Box>
                                )}
                              </View>
                            }
                            <Image source={require("../assets/images/achievement1.png")} style={{ width: 60, height: 60, position: "absolute", right: -15, bottom: -10 }} />
                          </Box>
                        </Box>
                      </Pressable>
                    </Box>

                    <Box w="48%">
                      <Box
                        flex={1}
                        bg="#E8F5E9"
                        p={4}
                        borderWidth={0.5}
                        borderRadius="xl"
                        borderColor="#3B3D3F"
                      >
                        <Text bold>Current Level</Text>

                        {currentIndexKindBenefits < 0 ?
                          <Text bold fontSize="2xl">N/A</Text>
                          :
                          <Text bold fontSize="2xl">
                            Level {kindBenefits[currentIndexKindBenefits].level}
                          </Text>
                        }
                        <Image
                          source={require("../assets/images/level1.png")}
                          style={{
                            width: 60,
                            height: 60,
                            position: "absolute",
                            right: 10,
                            bottom: 10,
                          }}
                        />
                      </Box>
                    </Box>
                  </HStack>

                  <HStack space={4}>
                    <Box
                      flex={1}
                      bg="#E8F5E9"
                      borderRadius="xl"
                      p={4}
                      borderWidth={0.5}
                      borderColor="#3B3D3F"
                    >
                      <Text bold>Next Target</Text>
                      {currentIndexKindBenefits < 0 || !kindBenefits[currentIndexKindBenefits + 1] ?
                        <Text bold fontSize="2xl">N/A</Text>
                        :
                        <Text bold fontSize="2xl">
                          Level {kindBenefits[currentIndexKindBenefits + 1].level}
                        </Text>
                      }
                      <Image
                        source={require("../assets/images/target1.png")}
                        style={{
                          width: 60,
                          height: 60,
                          position: "absolute",
                          right: 10,
                          bottom: 10,
                        }}
                      />
                    </Box>

                    <Box
                      flex={1}
                      bg="#E8F5E9"
                      borderRadius="xl"
                      p={4}
                      borderWidth={0.5}
                      borderColor="#3B3D3F"
                    >
                      <Text bold>Days Remaining</Text>
                      <Text bold fontSize="2xl">
                        {leftDays}
                      </Text>

                      <Image
                        source={require("../assets/images/calendar1.png")}
                        style={{
                          width: 60,
                          height: 60,
                          position: "absolute",
                          right: 10,
                          bottom: 10,
                        }}
                      />
                    </Box>
                  </HStack>
                </VStack>

                <Box style={{ marginTop: 80 }}>
                  <Box alignSelf={'center'} style={{ width: 300, height: 450, paddingTop: 30, position: 'relative' }}>
                    <Image
                      source={require("../assets/images/curveline.png")}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                    {kindBenefits.map((item, index) =>
                      <HStack key={index} style={[styles.pointblock, index + 1 == kindBenefits.length ? { top: -25, left: 103 } : index == 3 ? { top: 50, left: 8 } : index == 2 ? { top: 130, right: -37 } : index == 1 ? { bottom: 110, left: -8 } : { bottom: 8, right: 0 }]} space={2}>
                        {(index + 1 != kindBenefits.length && (index == 0 || index == 1)) && (
                          <VStack marginTop={3} width={60}>
                            <Text bold fontSize={'sm'}>Lavel {item.level}</Text>
                            <Text bold fontSize={'xs'} color={"#666666"} textTransform={'capitalize'}>{item.level_status}</Text>
                          </VStack>
                        )}
                        {item.level_status == 'current' ?
                          <Popover trigger={triggerProps => {
                            return <TouchableOpacity {...triggerProps}>
                              <Image style={index + 1 == kindBenefits.length ? { width: 35, height: 60 } : index == 3 ? { width: 50, height: 80 } : index == 2 ? { width: 50, height: 90 } : index == 1 ? { width: 55, height: 100 } : { width: 65, height: 120 }} source={item.level_status == "upcoming" ? require("../assets/images/upcoming.png") : item.level_status == "current" ? require("../assets/images/current.png") : item.level_status == "achieved" ? require("../assets/images/achievedmarker.png") : require("../assets/images/completed.png")} resizeMode={"contain"} />
                            </TouchableOpacity>;
                          }}>
                            <Popover.Content>
                              <Popover.Arrow />
                              <Popover.Header>{item.kind_title}</Popover.Header>
                            </Popover.Content>
                          </Popover>
                          :
                          <Image style={index + 1 == kindBenefits.length ? { width: 35, height: 60 } : index == 3 ? { width: 50, height: 80 } : index == 2 ? { width: 50, height: 90 } : index == 1 ? { width: 55, height: 100 } : { width: 65, height: 120 }} source={item.level_status == "upcoming" ? require("../assets/images/upcoming.png") : item.level_status == "current" ? require("../assets/images/current.png") : item.level_status == "achieved" ? require("../assets/images/achievedmarker.png") : require("../assets/images/completed.png")} resizeMode={"contain"} />
                        }
                        {(index + 1 == kindBenefits.length || (index != 0 && index != 1)) && (
                          <VStack marginTop={index == 3 ? 10 : 0} width={60}>
                            <Text bold fontSize={'sm'}>Lavel {item.level}</Text>
                            <Text bold fontSize={'xs'} color={"#666666"} textTransform={'capitalize'}>{item.level_status}</Text>
                          </VStack>
                        )}
                      </HStack>
                    )}
                  </Box>
                </Box>
              </ScrollView>
              <Button size="sm" variant="link" onPress={() => setSchemePop(true)}>
                <Icon name="information-circle" size={40} color="orange" />
              </Button>
            </ImageBackground>
          )}
        </Box>
      }

      {schemePop && (
        <View style={styles.spincontainer}>
          <LinearGradient
            colors={["#ffffff", "#ffffff"]}
            start={{ x: 0.5, y: 0 }}
            style={{ width: '90%', borderRadius: 10, overflow: 'hidden', paddingBottom: 15 }}
          >
            <Box p={3} backgroundColor={colorTheme.normal}>
              <HStack justifyContent={'space-between'} alignItems={'center'}>
                <Text bold textAlign="center" paddingLeft={4} fontSize={'lg'} color={'#ffffff'}>
                  Scheme Level Overview
                </Text>
                <Button size="sm" variant="link" onPress={() => setSchemePop(false)}>
                  <Icon name="close" size={30} color="#ffffff" />
                </Button>
              </HStack>
            </Box>
            <VStack w="100%">
              <HStack mb={2} width={'100%'} backgroundColor={"#eeeeee"} paddingX={5} paddingY={3} justifyContent={'space-between'}>
                <Text bold w="30%" fontSize="sm">
                  Levels
                </Text>
                <Text bold w="30%" fontSize="sm" textAlign={'center'}>
                  Benifits
                </Text>
                <Text bold w="30%" fontSize="sm" textAlign={'center'}>
                  My Status
                </Text>
              </HStack>
              {schemeLevel.map((item, index) => {
                const isNextTarget = index === firstLockedIndex;
                const isLastAchieved = index === lastAchievedIndex;
                return (
                  <HStack key={index} mb={2} width={'100%'} paddingX={5} paddingY={3} alignItems={'center'} justifyContent={'space-between'} opacity={item.achieved ? isLastAchieved && schemeLevel.length == index + 1 ? 1 : 0.5 : 1} backgroundColor={item.achieved ? isLastAchieved && schemeLevel.length == index + 1 ? "#ffffff" : "#eeeeee" : 1}>
                    <HStack w="30%" space={1} alignItems={'center'}>
                      {item.achieved ?
                        <Image source={require("../assets/images/achieved.png")} resizeMode="contain" />
                        :
                        <View>
                          {!isNextTarget ?
                            <Image source={require("../assets/images/locked.png")} resizeMode="contain" />
                            :
                            <Image source={require("../assets/images/inprogress.png")} resizeMode="contain" />
                          }
                        </View>
                      }
                      <Text fontSize="sm">Level {index + 1}</Text>
                    </HStack>
                    <Text bold w="30%" fontSize="sm" textAlign={'center'}>
                      {item.kind_title}
                    </Text>
                    <HStack bold w="30%" justifyContent={'center'}>
                      {item.achieved ?
                        <Badge bg="green.600" borderRadius={5} width={90}>
                          <Text color={"#ffffff"}>Achieved</Text>
                        </Badge>
                        :
                        <Badge bg={isNextTarget ? "blue.500" : "gray.500"} borderRadius={5} width={90}>
                          <Text color={"#ffffff"}>{isNextTarget ? "Current" : "Locked"}</Text>
                        </Badge>
                      }
                    </HStack>
                  </HStack>
                )
              })}
            </VStack>
          </LinearGradient>
        </View>
      )}

      {loading && (
        <View style={styles.spincontainer}>
          <ActivityIndicator animating={loading} size="large" color="#42bb52" />
        </View>
      )}
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' },
  pointblock: { position: 'absolute' }
});

export default SchemeDetailScreen;
