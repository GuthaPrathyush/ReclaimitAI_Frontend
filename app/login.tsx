import { Dimensions, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Animated, StatusBar } from 'react-native';
import Logo from "../assets/logo.png"
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';

const login = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const router = useRouter()
  const backendURI = process.env.EXPO_PUBLIC_BACKEND_URI;
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorColor, setErrorColor] = useState<"red" | "green">("red");
  
  // Email field
  const [emailText, setEmailText] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const animatedEmail = useRef(new Animated.Value(0)).current;

  // Password field
  const [passwordText, setPasswordText] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const animatedPassword = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedEmail, {
      toValue: emailFocused || emailText !== '' ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [emailFocused, emailText]);

  useEffect(() => {
    Animated.timing(animatedPassword, {
      toValue: passwordFocused || passwordText !== '' ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [passwordFocused, passwordText]);

  const emailLabelStyle = {
    position: 'absolute',
    left: 0,
    top: animatedEmail.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedEmail.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: 'white',
  };

  const passwordLabelStyle = {
    position: 'absolute',
    left: 0,
    top: animatedPassword.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedPassword.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: 'white',
  };

  const handleLoginButton = async () => {
    // handling the submission
    //after validation
    //if everythin is valid
    router.replace('/(tabs)');

    const response = null;
    try {
      const response = await axios.post(`${backendURI}/login`, {
        mail: emailText,
        password: passwordText
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }
      });
      if(response.status == 200) {
        console.log(response.data);
        setErrorColor("green");
        setErrorMessage(response.data.message);
        await AsyncStorage.setItem("auth_token", response.data.auth_token);
        setTimeout(() => {
          setErrorMessage("");
          router.replace('/(tabs)');
        }, 2000);
      }
    }
    catch(error) {
      console.log(error);
      if(error.response) {
        setErrorColor("red");
        setErrorMessage(error.response.data.message);
        setTimeout(() => {
          setErrorMessage("");
        }, 2000);
      }
      else {
        setErrorColor("red");
        setErrorMessage("An error occured while logging you, Please wait for sometime and try again!");
        setTimeout(() => {
          setErrorMessage("");
        }, 5000);
      }
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
        <StatusBar barStyle={'light-content'}></StatusBar>
      <View style={[styles.lightSource, { top: -50, left: -50, width: 150, height: 150 }]} />
      <View style={[styles.lightSource, { bottom: -100, right: -80, width: 200, height: 200 }]} />
      <View style={[styles.lightSource, { top: "40%", left: "40%", width: 300, height: 300 }]} />
      
      <Image
        style={styles.logo}
        source={Logo}
        resizeMode="contain"
        onLoad={() => setLogoLoaded(true)}
      />

      {/* Email Input */}
      <View style={{ width: '75%', position: 'relative', paddingTop: 18, marginBottom: 30 }}>
        <Animated.Text style={emailLabelStyle}>
          Email
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={emailText}
          onChangeText={setEmailText}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>

      {/* Password Input */}
      <View style={{ width: '75%', position: 'relative', paddingTop: 18 }}>
        <Animated.Text style={passwordLabelStyle}>
          Password
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={passwordText}
          onChangeText={setPasswordText}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          secureTextEntry={true}
        />
      </View>

      {/* Error Message Box */}
      <View style={styles.errorBox}>
        {/* Error message goes here */}
        <Text style={{textAlign: "center", color: errorColor}}>{errorMessage}</Text>
      </View>

      {/* Register Link */}
      <View style={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: 20 }}>
            <Text style={styles.registerLink}>
                Don't have an account? 
            </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Register here</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>


    </View>
  );
};

export default login

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
    marginBottom: 20
  },
  lightSource: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(62, 138, 241, 0.1)',
    elevation: 80,
  },
  input: {
    height: 35,
    width: "100%",
    borderColor: '#fff',
    borderBottomWidth: 2,
    paddingVertical: 0,
    fontSize: 15,
    backgroundColor: "transparent",
    color: '#3e8af1',
  },
  registerLink: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
  
  registerText: {
    color: '#3e8af1',
    fontWeight: '600'
  },
  errorBox: {
    width: "75%",
    paddingVertical: 8,
    minHeight: 20,
    marginTop: 10,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: '#3e8af1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
});
