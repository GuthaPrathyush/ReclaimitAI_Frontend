import { Dimensions, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Animated, StatusBar, ActivityIndicator } from 'react-native';
import Logo from "../assets/logo.png"
import { useEffect, useState, useRef } from 'react'
import React from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';

const register = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const router = useRouter();

  const [nameText, setNameText] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const animatedName = useRef(new Animated.Value(0)).current;

  const [emailText, setEmailText] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const animatedEmail = useRef(new Animated.Value(0)).current;

  const [phoneText, setPhoneText] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const animatedPhone = useRef(new Animated.Value(0)).current;

  const [passwordText, setPasswordText] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const animatedPassword = useRef(new Animated.Value(0)).current;

  const [confirmText, setConfirmText] = useState('');
  const [confirmFocused, setConfirmFocused] = useState(false);
  const animatedConfirm = useRef(new Animated.Value(0)).current;

  // Added states for handling registration process
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const useAnimateLabel = (animatedValue, focused, text) => {
    useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: focused || text !== '' ? 1 : 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }, [focused, text]);
  };

  useAnimateLabel(animatedName, nameFocused, nameText);
  useAnimateLabel(animatedEmail, emailFocused, emailText);
  useAnimateLabel(animatedPhone, phoneFocused, phoneText);
  useAnimateLabel(animatedPassword, passwordFocused, passwordText);
  useAnimateLabel(animatedConfirm, confirmFocused, confirmText);

  const getLabelStyle = (animatedValue) => ({
    position: 'absolute',
    left: 0,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: 'white',
  });

  // Registration function that connects to the backend
  const handleRegister = async () => {
    // Reset error state
    setErrorMessage('');
    setShowError(false);
    
    // Form validation
    if (!nameText.trim()) {
      setErrorMessage('Name cannot be empty');
      setShowError(true);
      return;
    }
    
    if (!emailText.trim()) {
      setErrorMessage('Email cannot be empty');
      setShowError(true);
      return;
    }
    
    // Validate email format using the same regex as backend
    const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@srmap\.edu\.in$/;
    if (!emailRegex.test(emailText)) {
      setErrorMessage('Please use a valid SRM AP email address');
      setShowError(true);
      return;
    }
    
    if (!phoneText.trim()) {
      setErrorMessage('Phone number cannot be empty');
      setShowError(true);
      return;
    }
    
    // Validate phone format using the same regex as backend
    const phoneRegex = /^\+?[1-9]\d{0,2}\d{6,14}$/;
    if (!phoneRegex.test(phoneText)) {
      setErrorMessage('Please enter a valid phone number');
      setShowError(true);
      return;
    }
    
    if (!passwordText) {
      setErrorMessage('Password cannot be empty');
      setShowError(true);
      return;
    }
    
    // Validate password strength using the same regex as backend
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W\_])[A-Za-z\d\W\_]+$/;
    if (!passwordRegex.test(passwordText)) {
      setErrorMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      setShowError(true);
      return;
    }
    
    if (passwordText !== confirmText) {
      setErrorMessage('Passwords do not match');
      setShowError(true);
      return;
    }
    
    // All validations passed, proceed with registration
    setIsLoading(true);
    
    try {
      const backendURI = process.env.EXPO_PUBLIC_BACKEND_URI;
      const response = await axios.post(`${backendURI}/register`, {
        name: nameText.trim(),
        mail: emailText.trim(),
        phone: phoneText.trim(),
        password: passwordText,
        socket_id: "" // Empty as required by the backend
      });
      
      setIsLoading(false);
      
      if (response.data && response.data.message) {
        // Registration email sent successfully
        alert("Registration email sent! Please check your email to complete registration.");
        router.push('/login');
      }
    } catch (error) {
      setIsLoading(false);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        
        if (status === 409) {
          setErrorMessage('Email already exists. Please login instead.');
        } else if (status === 406) {
          setErrorMessage(error.response.data.message || 'Invalid input data');
        } else {
          setErrorMessage('Registration failed. Please try again later.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        setErrorMessage('Network error. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorMessage('An error occurred. Please try again.');
      }
      
      setShowError(true);
    }
  };

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

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Animated.Text style={getLabelStyle(animatedName)}>Name</Animated.Text>
        <TextInput
          style={styles.input}
          value={nameText}
          onChangeText={setNameText}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Animated.Text style={getLabelStyle(animatedEmail)}>Email</Animated.Text>
        <TextInput
          style={styles.input}
          value={emailText}
          onChangeText={setEmailText}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Animated.Text style={getLabelStyle(animatedPhone)}>Phone</Animated.Text>
        <TextInput
          style={styles.input}
          value={phoneText}
          onChangeText={setPhoneText}
          onFocus={() => setPhoneFocused(true)}
          onBlur={() => setPhoneFocused(false)}
          keyboardType='phone-pad'
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Animated.Text style={getLabelStyle(animatedPassword)}>Password</Animated.Text>
        <TextInput
          style={styles.input}
          value={passwordText}
          onChangeText={setPasswordText}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          secureTextEntry
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Animated.Text style={getLabelStyle(animatedConfirm)}>Confirm Password</Animated.Text>
        <TextInput
          style={styles.input}
          value={confirmText}
          onChangeText={setConfirmText}
          onFocus={() => setConfirmFocused(true)}
          onBlur={() => setConfirmFocused(false)}
          secureTextEntry
        />
      </View>

      {/* Error Message Box */}
      <View style={styles.errorBox}>
        {showError && <Text style={styles.errorMessage}>{errorMessage}</Text>}
      </View>

      {/* Register Link */}
      <View style={styles.registerRow}>
        <Text style={styles.registerLink}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.registerText}>Login here</Text>
        </TouchableOpacity>
      </View>

      {/* Signup Button */}
      <TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.disabledButton]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.loginButtonText}>Signup</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default register;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#050c16",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  logo: {
    height: 100,
    width: 200, // Setting a default width
    marginBottom: 20,
  },
  lightSource: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(62, 138, 241, 0.1)',
    elevation: 80,
  },
  inputContainer: {
    width: '75%',
    position: 'relative',
    paddingTop: 18,
    marginBottom: 30,
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
  errorBox: {
    width: "75%",
    paddingVertical: 8,
    minHeight: 20,
    marginTop: -10,
    marginBottom: 10,
  },
  errorMessage: {
    color: "red",
    textAlign: "center"
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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
  loginButton: {
    marginTop: 20,
    backgroundColor: '#3e8af1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#3e8af1aa', // Semi-transparent to indicate disabled state
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
});
