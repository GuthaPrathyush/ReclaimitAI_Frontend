// ItemsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';

// Create the context
const ItemsContext = createContext({});

// Custom hook to use the context
export const useItems = () => useContext(ItemsContext);

// Provider component
export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationsError, setNotificationsError] = useState(null);
  const backendURI = process.env.EXPO_PUBLIC_BACKEND_URI;

  useEffect(() => {
    fetchItems();
    fetchNotifications();
  }, []);

  // Function to fetch items from the backend
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API request with the token
      const response = await axios.post(
        `${backendURI}/getItems`, 
        {page: 1}, // Page parameter for pagination
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'auth_token': token
          }
        }
      );
      
      // Handle the response
      if (response.status === 200) {
        setItems(response.data);
      }
    } catch (error) {
      console.log('Error fetching items:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred while fetching items');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch notifications from the backend
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API request with the token
      const response = await axios.post(
        `${backendURI}/getNotifications`, 
        {}, // Empty body for POST request
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'auth_token': token
          }
        }
      );
      
      // Handle the response
      if (response.status === 200 && response.data.status === 'success') {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
      setNotificationsError(error.response?.data?.message || error.message || 'An error occurred while fetching notifications');
    } finally {
      setNotificationsLoading(false);
    }
  };

  
async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      // Save token to backend
      try {
        const authToken = await AsyncStorage.getItem('auth_token');
        if (authToken && token) {
          await axios.post(
            `${backendURI}/update-fcm-token`,
            { token },
            {
              headers: {
                'Content-Type': 'application/json',
                'auth_token': authToken,
              },
            }
          );
        }
      } catch (err) {
        console.log('Error sending push token to backend:', err);
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
    // No return value
  }
  // Value to be provided to consumers
  const value = {
    items,
    loading,
    error,
    fetchItems,
    notifications,
    notificationsLoading,
    notificationsError,
    fetchNotifications,
    registerForPushNotificationsAsync,
  };

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
};
