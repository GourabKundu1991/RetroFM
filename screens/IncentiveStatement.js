import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Box,
  HStack,
  NativeBaseProvider,
  Text,
  VStack,
  Toast,
  Button,
  Stack,
} from "native-base";
import React, { useEffect } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from "react-native";
import {
  AccessToken,
  API_KEY,
  APP_VERSION,
  BASE_URL,
  OS_TYPE,
} from "../auth_provider/Config";
import Events from "../auth_provider/Events";
import LinearGradient from "react-native-linear-gradient";
import { useTranslation } from "react-i18next";
import i18n from "../assets/language/i18n";
import CommonHeader from "../components/CommonHeader";
import BottomTabs from "../components/BottomTabs";
import { HeadingBox } from "../components/CommonComponent";
import ReactNativeBlobUtil from "react-native-blob-util";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import apiClient from '../api/apiClient';

const IncentiveStatementScreen = ({ navigation }) => {

  const { t } = useTranslation();
  const [currentLanguage, setLanguage] = React.useState("Eng");
  const [loading, setLoading] = React.useState(false);
  const [colorTheme, setColorTheme] = React.useState("");

  const [allPoints, setAllPoints] = React.useState([]);

  const [currentPoints, setCurrentPoints] = React.useState("");

  const [pageNumber, setPageNumber] = React.useState(1);
  const [isLoadMore, setIsLoadMore] = React.useState(true);

  const [pop, setPop] = React.useState(true);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const [dateType, setDateType] = React.useState("");

  // For generating Incentive Statement
  const showDatePicker = (val) => {
    setDatePickerVisibility(true);
    setDateType(val);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    hideDatePicker();
    if (dateType == "startdate") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setLoading(true);
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
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getAllData = () => {
    AsyncStorage.getItem("userToken").then((val) => {
      if (val != null) {
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("orgId", JSON.parse(val).org_id);
        formdata.append("os_type", `${OS_TYPE}`);
        formdata.append("app_ver", `${APP_VERSION}`);
        formdata.append("from_date", moment(startDate).format("YYYY-MM-DD"));
        formdata.append("to_date", moment(endDate).format("YYYY-MM-DD"));
        formdata.append("transaction_type", "");
        formdata.append("pageNumber", 1);
        console.log("Incentive Statement Request:", formdata);
        apiClient
          .post(`${BASE_URL}/incentivestatements`, formdata, {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
              accesstoken: `${AccessToken}`,
              useraccesstoken: JSON.parse(val).token,
            },
          })
          .then((response) => {
            setLoading(false);
            return response.data;
          })
          .then((responseJson) => {
            console.log("Incentive Statements:", responseJson);
            if (responseJson.bstatus == 1) {
              setAllPoints(responseJson.trnasc_list);
              setCurrentPoints(responseJson.current_balance);
            } else {
              setAllPoints([]);
              setCurrentPoints("");
              setLoading(false);
              Toast.show({ description: responseJson.message });
              setTimeout(function () {
                setLoading(false);
                if (responseJson.msg_code == "msg_1000") {
                  AsyncStorage.clear();
                  navigation.navigate("Welcome");
                }
              }, 1000);
            }
          })
          .catch((error) => {
            setLoading(false);
            //console.log("Point Statements Error:", error);
            Toast.show({
              description: t(
                "Sorry! Something went Wrong. Maybe Network request Failed",
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

  const loadMore = () => {
    let num = pageNumber + 1;
    setLoading(true);
    AsyncStorage.getItem("userToken").then((val) => {
      if (val != null) {
        let formdata = new FormData();
        // formdata.append("token", JSON.parse(val).token);
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("orgId", JSON.parse(val).org_id);
        formdata.append("from_date", moment(startDate).format("YYYY-MM-DD"));
        formdata.append("to_date", moment(endDate).format("YYYY-MM-DD"));
        formdata.append("transaction_type", "");
        formdata.append("pageNumber", num);
        console.log("Incentive Statement Request:", formdata);
        apiClient
          .post(`${BASE_URL}/incentivestatements`, formdata, {
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
            console.log("Load More Response:", responseJson);
            if (responseJson.bstatus == 1) {
              setLoading(false);
              let newArrya = allPoints.concat(responseJson.trnasc_list);
              setAllPoints(newArrya);
              setPageNumber(num);
            } else {
              setLoading(false);
              setIsLoadMore(false);
              setPageNumber(1);
            }
          })
          .catch((error) => {
            setLoading(false);
            //console.log("Point Statements Error:", error);
            Toast.show({
              description: t(
                "Sorry! Something went Wrong. Maybe Network request Failed",
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

  const onSubmit = () => {
    let oneYear = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (startDate == "") {
      Toast.show({ description: t("Please select Start Date") });
    } else if (endDate == "") {
      Toast.show({ description: t("Please select End Date") });
    } else if (oneYear > 365) {
      Toast.show({ description: t("You can download Maximum 1 year data") });
    } else {
      setLoading(true);
      hideDatePicker();
      setPop(false);
      getAllData();
    }
  };

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <CommonHeader
        navigation={navigation}
        showBack={true}
        title={t("Incentive Statement")}
        colorTheme={colorTheme}
      />
      <Box flex={1} px={5} py={5} bg={"#F1F1F1"}>
        <Box backgroundColor={"#ffffff"} style={styles.productbox} padding={3}>
          <Stack space={3} alignItems="center">
            <Text color="#444444" fontSize="sm" fontWeight="bold">
              {t("Select Statement Date")}
            </Text>
            <HStack
              width={"100%"}
              justifyContent={"space-between"}
              alignContent={"center"}
            >
              <View style={{ width: "48%" }}>
                <Pressable
                  style={styles.inputbox}
                  onPress={() => showDatePicker("startdate")}
                >
                  <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                    <Icon
                      name="calendar-outline"
                      size={20}
                      color="#f04e23"
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        textAlign: "center",
                      }}
                    />
                    <Text
                      color={startDate != "" ? "#111111" : "#999999"}
                      fontSize="sm"
                    >
                      {startDate != ""
                        ? moment(startDate).format("DD-MM-YYYY")
                        : t("Start Date") + " *"}
                    </Text>
                  </HStack>
                </Pressable>
              </View>
              <View style={{ width: "48%" }}>
                <Pressable
                  style={styles.inputbox}
                  onPress={() => showDatePicker("enddate")}
                >
                  <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                    <Icon
                      name="calendar-outline"
                      size={20}
                      color="#f04e23"
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        textAlign: "center",
                      }}
                    />
                    <Text
                      color={endDate != "" ? "#111111" : "#999999"}
                      fontSize="sm"
                    >
                      {endDate != ""
                        ? moment(endDate).format("DD-MM-YYYY")
                        : t("End Date") + " *"}
                    </Text>
                  </HStack>
                </Pressable>
              </View>
            </HStack>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              maximumDate={new Date()}
            />
          </Stack>
          <HStack space={1} alignItems="center" justifyContent="space-evenly">
            {colorTheme.dark && colorTheme.normal && (
              <LinearGradient
                colors={[colorTheme.dark, colorTheme.normal]}
                start={{ x: 0.5, y: 0 }}
                style={[
                  styles.optionbtn,
                  {
                    width: "100%",
                    borderColor: colorTheme.dark,
                    borderWidth: 1,
                  },
                ]}
              >
                <Button
                  size="xs"
                  variant="link"
                  _text={{
                    color: colorTheme.light,
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                  onPress={() => onSubmit()}
                >
                  {t("Search")}
                </Button>
              </LinearGradient>
            )}
          </HStack>
        </Box>

        <ScrollView showsVerticalScrollIndicator={false}>
          {currentPoints != "" && (
            <HeadingBox
              // colorTheme={colorTheme}
              prefixIcon={require("../assets/images/star.png")}
              title={currentPoints}
              desc={t("Available Points")}
              /* downloadIcon={'download-outline'} */
            />
          )}
          <VStack>
            <Box style={styles.productbox} mt="3">
              {allPoints.length == 0 ? (
                <HStack
                  padding="10"
                  backgroundColor={"#ffffff"}
                  justifyContent="center"
                >
                  <Text fontSize="sm" color="#888888">
                    ----- {t("No Data Available")} -----
                  </Text>
                </HStack>
              ) : (
                <VStack>
                  <VStack space="3">
                    {allPoints.map((item, index) => (
                      <Box key={index} borderRadius="10" overflow="hidden">
                        <VStack
                          justifyContent="space-evenly"
                          bg="#ffffff"
                          padding={3}
                        >
                          <HStack
                            marginBottom={2}
                            width={"100%"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                          >
                            <HStack
                              space={2}
                              justifyContent={"space-between"}
                              alignItems={"center"}
                            >
                              <Icon
                                name={
                                  item.transaction_type == "Debit"
                                    ? "arrow-down-outline"
                                    : "arrow-up-outline"
                                }
                                size={20}
                                color={
                                  item.transaction_type == "Debit"
                                    ? "#D52D0F"
                                    : "#00915D"
                                }
                              />
                              <Text
                                fontSize="md"
                                color="#111111"
                                fontWeight="bold"
                              >
                                {item.transaction_type == "Debit" ? "-" : "+"}{" "}
                                {item.incentive_amount}
                              </Text>
                            </HStack>
                            <HStack
                              backgroundColor={
                                item.transaction_type == "Debit"
                                  ? "#fdebee"
                                  : "#E5F4EF"
                              }
                              paddingX={3}
                              borderRadius={4}
                              overflow={"hidden"}
                            >
                              <Text
                                fontSize="sm"
                                color={
                                  item.transaction_type == "Debit"
                                    ? "#D52D0F"
                                    : "#00915D"
                                }
                                fontWeight="medium"
                              >
                                {item.transaction_type} {t("Points")}
                              </Text>
                            </HStack>
                          </HStack>
                          <HStack space={3}>
                            <Text
                              color="#707274"
                              fontSize="sm"
                              fontWeight="medium"
                              textTransform="capitalize"
                            >
                              {t("ID")}:
                            </Text>
                            <Text
                              color="#707274"
                              fontSize="sm"
                              textTransform="capitalize"
                            >
                              {item.id}
                            </Text>
                          </HStack>
                          <HStack space={3}>
                            <Text
                              color="#707274"
                              fontSize="sm"
                              fontWeight="medium"
                              textTransform="capitalize"
                            >
                              {t("Date")}:
                            </Text>
                            <Text
                              color="#707274"
                              fontSize="sm"
                              textTransform="capitalize"
                            >
                              {item.created_at}
                            </Text>
                          </HStack>
                          <HStack space={3}>
                            <Text
                              color="#707274"
                              fontSize="sm"
                              fontWeight="medium"
                              textTransform="capitalize"
                            >
                              {t("Description")}:
                            </Text>
                            <Text
                              color="#707274"
                              fontSize="sm"
                              textTransform="capitalize"
                            >
                              {item.transaction_desc}
                            </Text>
                          </HStack>
                          {item.comment != "" && (
                            <HStack space={3} flexWrap={"wrap"}>
                              <Text
                                color="#707274"
                                fontSize="sm"
                                fontWeight="medium"
                                textTransform="capitalize"
                              >
                                {t("Narration")}:
                              </Text>
                              <Text
                                color="#707274"
                                fontSize="sm"
                                textTransform="capitalize"
                              >
                                {item.comment}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                  {isLoadMore && allPoints.length > 7 && (
                    <HStack
                      pb="3"
                      paddingX="6"
                      justifyContent="center"
                      marginTop={5}
                    >
                      <Button
                        variant="outline"
                        backgroundColor={"#ffffff"}
                        size={"xs"}
                        rounded={30}
                        onPress={() => loadMore()}
                      >
                        <Text color="#999999">{t("Load More")}</Text>
                      </Button>
                    </HStack>
                  )}
                </VStack>
              )}
            </Box>
          </VStack>
        </ScrollView>
      </Box>

      {pop && colorTheme && colorTheme.dark && (
        <VStack style={styles.spincontainer} padding={10}>
          <Box
            backgroundColor={"#ffffff"}
            style={styles.productbox}
            padding={3}
          >
            <Stack space={5} alignItems="center">
              <Text color="#444444" fontSize="md" fontWeight="bold">
                {t("Select Statement Date")}
              </Text>
              <Pressable
                style={styles.inputbox}
                onPress={() => showDatePicker("startdate")}
              >
                <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color="#f04e23"
                    style={{
                      width: 25,
                      marginLeft: 10,
                      marginRight: 10,
                      textAlign: "center",
                    }}
                  />
                  <Text
                    color={startDate != "" ? "#111111" : "#999999"}
                    fontSize="md"
                  >
                    {startDate != ""
                      ? moment(startDate).format("DD-MM-YYYY")
                      : t("Start Date") + " *"}
                  </Text>
                </HStack>
              </Pressable>
              <Pressable
                style={styles.inputbox}
                onPress={() => showDatePicker("enddate")}
              >
                <HStack paddingY={Platform.OS == "ios" ? "1.5" : "2.5"}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color="#f04e23"
                    style={{
                      width: 25,
                      marginLeft: 10,
                      marginRight: 10,
                      textAlign: "center",
                    }}
                  />
                  <Text
                    color={endDate != "" ? "#111111" : "#999999"}
                    fontSize="md"
                  >
                    {endDate != ""
                      ? moment(endDate).format("DD-MM-YYYY")
                      : t("End Date") + " *"}
                  </Text>
                </HStack>
              </Pressable>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                maximumDate={new Date()}
              />
            </Stack>
            <HStack
              space={1}
              alignItems="center"
              justifyContent="space-evenly"
              mt="3"
            >
              <LinearGradient
                colors={[colorTheme.dark, colorTheme.normal]}
                start={{ x: 0.5, y: 0 }}
                style={[styles.optionbtn, {width: '100%'}]}
              >
                <Button
                  size="xs"
                  variant="link"
                  _text={{
                    color: colorTheme.light,
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                  onPress={() => onSubmit()}
                >
                  {t("Search")}
                </Button>
              </LinearGradient>
            </HStack>
          </Box>
        </VStack>
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
  note: {
    color: "#ffffff",
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 19,
    textAlign: "center",
  },
  productbox: {
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
    borderColor: "#eeeeee",
    borderWidth: 2,
    overflow: "hidden",
  },
  inputbox: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#cccccc",
    width: "100%",
    overflow: "hidden",
    marginVertical: 0,
  },
  optionbtn: {
    backgroundColor: "none",
    width: "46%",
    borderRadius: 8,
    overflow: "hidden",
  },
  custbtn: { backgroundColor: "none", width: 80, borderRadius: 10 },
  spincontainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
});

export default IncentiveStatementScreen;
