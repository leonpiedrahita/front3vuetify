import axios from 'axios';

const axiosPlugin = {
  install: (app) => {
    // Set up Axios instance with custom configurations if needed
    const instance = axios.create({
     /*  baseURL: 'https://api.example.com', // Replace with your API base URL
      timeout: 5000, // Set a timeout for requests (optional) */
    });

    // Add the instance to the app as a global property
    app.config.globalProperties.$axios = instance;

    // You can also set up interceptors, etc. here if needed

    // Example interceptor for request logging
    instance.interceptors.request.use((config) => {
      console.log('Making request with Axios:', config);
      return config;
    });

    // Example interceptor for response logging
    instance.interceptors.response.use((response) => {
      console.log('Received response with Axios:', response);
      return response;
    }, (error) => {
      console.error('Error with Axios request:', error);
      return Promise.reject(error);
    });
  },
};

export default axiosPlugin;