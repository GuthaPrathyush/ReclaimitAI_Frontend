import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar } from 'react-native';
import Logo from "../assets/logo.png";
import { useEffect, useState } from 'react';
import React from 'react';
import { SplashScreen, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager } from 'react-native';
import axios from 'axios';


const index = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    InteractionManager.runAfterInteractions(async () => {
      let navigated = false;
  
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URI}/checkUser`, {}, {
            headers: {
              Accept: "application/json",
              'Content-Type': "application/json",
              'auth_token': token
            }
          });
  
          if (res.data.valid) {
            navigated = true;
            router.push('/(tabs)');
          }
        }
      } catch (err) {
        console.warn("Error checking user validity", err);
      } finally {
        // Wait a bit to ensure navigation begins smoothly
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, navigated ? 500 : 0); // Delay slightly if navigating
      }
    });
  }, []);
  
  return (
      <View style={styles.container}>
        <StatusBar barStyle={'light-content'} />
        <View style={[styles.lightSource, {
          top: -50,
          left: -50,
          width: 150,
          height: 150,
        }]} />
        <View style={[styles.lightSource, {
          bottom: -100,
          right: -80,
          width: 200,
          height: 200,
        }]}></View>
        <View style={[styles.lightSource, {
          top: "40%",
          left: "40%",
          width: 300,
          height: 300,
        }]}></View>
        
        <Image
          style={styles.logo}
          source={Logo}
          resizeMode="contain" // This ensures the image maintains its aspect ratio
          onLoad={() => setLogoLoaded(true)}
        />
        
        <Text style={[styles.subtitles, {fontWeight: "200"}]}>AI Based Lost & Found</Text>
        <Text style={styles.subtitles}>Matching <Text style={[styles.subtitles, {color: "#3e8af1"}]}>Application</Text></Text>
        
        <TouchableOpacity onPress={() => router.push('/login')}>
          <View style={styles.getStartedButton}>
            <Text style={styles.buttonContent}>Get Started {">>"}</Text>
          </View>
        </TouchableOpacity>
      </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#050c16",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative"
  },
  logo: {
    height: 100,
    width: 200, // Setting a default width
    marginBottom: 100,
  },
  subtitles: {
    color: "white",
    fontSize: 25,
    marginBottom: 5
  },
  getStartedButton: {
    width: 150,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    backgroundColor: "#3e8af1",
    marginTop: 100,
    borderRadius: 100
  },
  buttonContent: {
    color: "white",
    fontSize: 14,
  },
  lightSource: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(62, 138, 241, 0.1)',
    elevation: 80, // creates a soft glow on Android
  }
});