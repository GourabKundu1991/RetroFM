import {
  Badge,
  Box,
  Button,
  Checkbox,
  HStack,
  Input,
  NativeBaseProvider,
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
  FlatList,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../assets/language/i18n";
import { useTranslation } from "react-i18next";
import CommonHeader from "../components/CommonHeader";
import { AccessToken, API_KEY, BASE_URL } from "../auth_provider/Config";
import apiClient from "../api/apiClient";

const PointSchemeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [colorTheme, setColorTheme] = React.useState("");
  const [currentLanguage, setLanguage] = React.useState("Eng");
  const [schemeList, setSchemeList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

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
      getAllData();
    });
    return unsubscribe;
  }, []);

  const getAllData = () => {
    AsyncStorage.getItem("userToken").then((val) => {
      if (val != null) {
        let formdata = new FormData();
        formdata.append("APIkey", `${API_KEY}`);
        formdata.append("orgId", JSON.parse(val).org_id);
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
            console.log("get_Scheme_list:", responseJson);
            if (responseJson.bstatus == 1) {
              setSchemeList(responseJson.scheme_list);
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
                "Sorry! Something went Wrong. Maybe Network request Failed"
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

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <CommonHeader
        navigation={navigation}
        showBack={true}
        title={t("Scheme Listing")}
        colorTheme={colorTheme}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box bg="#f5f5f5" p={4}>
          <FlatList
            data={schemeList}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Box borderWidth={0.5} borderColor={"#999999"} bg="white" p={4} borderRadius="xl" mb={3}>
                <VStack space={2}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text bold fontSize="md" flex={1}>
                      {item.scheme_title}
                    </Text>

                    <Pressable
                      onPress={() =>
                        navigation.navigate("SchemeDetails", { item })
                      }
                    >
                      {({ isPressed }) => (
                        <Text
                          fontSize="md"
                          underline
                          color={colorTheme?.normal}
                          style={{
                            opacity: isPressed ? 0.5 : 1,
                          }}
                        >
                          Details
                        </Text>
                      )}
                    </Pressable>
                  </HStack>

                  <HStack justifyContent="space-between">
                    <VStack>
                      <Text fontSize="xs" color="gray.500">
                        Start Date
                      </Text>
                      <Text>{item.scheme_start_date}</Text>
                    </VStack>

                    <VStack>
                      <Text fontSize="xs" color="gray.500">
                        End Date
                      </Text>
                      <Text>{item.scheme_end_date}</Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            )}
          />
        </Box>
      </ScrollView>
      {loading && (
        <View style={styles.spincontainer}>
          <ActivityIndicator animating={loading} size="large" color="#42bb52" />
        </View>
      )}
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  spincontainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)' }
});

export default PointSchemeScreen;
