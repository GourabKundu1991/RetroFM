import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import { URL } from '../auth_provider/Config';

const { PS } = NativeModules;

const apiClient = axios.create({
  baseURL: `${URL}`, // Replace with your API base URL
  //timeout: 10000, // Timeout in milliseconds
});

// Add request interceptor
apiClient.interceptors.request.use(
  /* async config => {
    try {
     //Call SSL validation before sending the request
      //console.log('CALLING...', PS.vc);
      await PS.vc(
        config.baseURL, // API URL
        "star_nuvocosaarthi_com.cer" // UAT certificate in assets
        //"star_nuvocosaarthi_com.cer", // Live certificate in assets
      );
      console.log('validation success');
      // Proceed with the request if SSL validation is successful
      return config;
    } catch (error) {
      console.error('SSL Certificate Validation Failed:', error.message);
      //console.log("Calling URL:", "https://ci4uatapi.nuvocosaarthi.com");
      // Cancel the request and throw an error
      throw new axios.Cancel(`Network request failed ${error.message}`);
    }
  },
  error => {
    // Handle request errors
    return Promise.reject(error);
  }, */
);

export default apiClient;
