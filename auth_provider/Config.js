import { Platform } from "react-native";

export const OS_TYPE = Platform.OS == 'ios' ? "ios" : "android";
export const APP_VERSION = Platform.OS == 'ios' ? "1.0.0" : "8.0";
export const DEVICE_TYPE = Platform.OS == 'ios' ? "2" : "1";

export const URL =  "https://app.retrofm.in";
const BASE_URL =  "https://app.retrofm.in";
export const AuthToken = '!RetroFM@2023!=&audio$';

// UAT base url
/* export const URL =  "https://uatapi.nuvocosaarthi.com";
const BASE_URL =  "https://uatapi.nuvocosaarthi.com/v1/maitree_req";
export const successReturnUrl = 'https://uat.nuvocosaarthi.com/F2A_general_complaint/success_return';
export const errorReturnUrl = 'https://uat.nuvocosaarthi.com/F2A_general_complaint/error_return';
export const AccessToken = 'Br9dxPXb3RyDSShUG7fcsqtYsFelfG6vehXlnJhZGYpkwqX39x3283jcXbCpQtxC81NlSeEqjcZxp6wXeI363x9KOOu4Lrj/DnwCndqD0DPr8v2CdgKpRFXq1UOC0pseQDk1XUWU3GW/FESwsZ49vP6ghtJnfixt'; */

// PRD base url
/* const BASE_URL = "https://prdapi.nuvocosaarthi.com/v1/maitree_req"; //"https://api.nuvocosaarthi.com/nvcl_nvl_maitree/v3/Maitree_req";
export const successReturnUrl = 'https://www.nuvocosaarthi.com/F2A_general_complaint/success_return';  
export const errorReturnUrl = 'https://www.nuvocosaarthi.com/F2A_general_complaint/error_return'; 
export const AccessToken = '1gchwQ74PfMtkqGGivLHXoN/NRxEkWyeUwQXX2Hye2bXyLmUUm3bg2zDDPU1gt1bEpzfALyuuGab5iZ/Qu5V1db51OtaOpezUGEuk7UuQmiCwt9Kv/U1Ig1bhdw/0kb9CrfHCQg1WM2GACv53e0HOXoZDIkyPs3U'; */

// LIVE base url
/* export const URL =  "https://api.nuvocosaarthi.com";
const BASE_URL = "https://api.nuvocosaarthi.com/v1/maitree_req";
export const successReturnUrl = 'https://www.nuvocosaarthi.com/F2A_general_complaint/success_return';  
export const errorReturnUrl = 'https://www.nuvocosaarthi.com/F2A_general_complaint/error_return'; 
export const AccessToken = '1gchwQ74PfMtkqGGivLHXoN/NRxEkWyeUwQXX2Hye2bXyLmUUm3bg2zDDPU1gt1bEpzfALyuuGab5iZ/Qu5V1db51OtaOpezUGEuk7UuQmiCwt9Kv/U1Ig1bhdw/0kb9CrfHCQg1WM2GACv53e0HOXoZDIkyPs3U'; */

export {BASE_URL};