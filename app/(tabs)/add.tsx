import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, StatusBar, ScrollView, Image } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { RadioButton } from 'react-native-paper';
import TopNavBar from '@/components/ui/TopNavBar';

const AddItem = () => {
  const router = useRouter()
  const backendURI = process.env.EXPO_PUBLIC_BACKEND_URI;
  const [errorMessage, setErrorMessage] = useState("");
  const [errorColor, setErrorColor] = useState("red");
  
  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemState, setItemState] = useState('lost'); // 'lost' is true, 'found' is false
  const [itemDescription, setItemDescription] = useState('');
  const [image, setImage] = useState(null);

  // Animation states
  const [nameFocused, setNameFocused] = useState(false);
  const animatedName = useRef(new Animated.Value(0)).current;
  
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const animatedDescription = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedName, {
      toValue: nameFocused || itemName !== '' ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [nameFocused, itemName]);

  useEffect(() => {
    Animated.timing(animatedDescription, {
      toValue: descriptionFocused || itemDescription !== '' ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [descriptionFocused, itemDescription]);

  const nameLabelStyle = {
    position: 'absolute',
    left: 0,
    top: animatedName.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedName.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: 'white',
  };

  const pickImage = async () => {
    // Updated to use the non-deprecated approach
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Using array of MediaTypes instead of MediaTypeOptions
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      // Store the complete asset information
      setImage(result.assets[0]);
    }
  };

  const handleAddItem = async () => {
    // Validation
    if (!itemName.trim()) {
      setErrorColor("red");
      setErrorMessage("Please enter the item name");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!itemDescription.trim()) {
      setErrorColor("red");
      setErrorMessage("Please provide a description");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!image) {
      setErrorColor("red");
      setErrorMessage("Please select an image");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('state', itemState === 'lost' ? 'true' : 'false');
    formData.append('description', itemDescription);
    
    // Improved image handling - using the asset information directly
    formData.append('image', {
      uri: image.uri,
      name: image.fileName || `image-${Date.now()}.jpg`,
      type: image.mimeType || 'image/jpeg',
    });

    try {
      await AsyncStorage.setItem("auth_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2ViN2NhMGQ5MDBhNWRhMjk5ODZmYzAifQ.W8uoTYe6eqg7fTK4by6kFyugHhepbvNKv17QXkVbPwE");
      const token = await AsyncStorage.getItem("auth_token");
      const response = await axios.post(`${backendURI}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': "application/json",
          'auth_token': `${token}`
        }
      });
      
      if (response.status === 200) {
        setErrorColor("green");
        setErrorMessage("Item added successfully!");
        setTimeout(() => {
          setErrorMessage("");
          router.replace('/(tabs)');
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        setErrorColor("red");
        setErrorMessage(error.response.data.message);
      } else {
        setErrorColor("red");
        setErrorMessage("An error occurred while uploading. Please try again later.");
      }
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar barStyle={'light-content'} />
      <TopNavBar></TopNavBar>
      <View style={styles.container}>
        <View style={[styles.lightSource, { top: -50, left: -50, width: 150, height: 150 }]} />
        <View style={[styles.lightSource, { bottom: -100, right: -80, width: 200, height: 200 }]} />
        <View style={[styles.lightSource, { top: "40%", left: "40%", width: 300, height: 300 }]} />
        
        <Text style={styles.headerText}>Lost or Found Valuable Items</Text>

        {/* Item Name Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={nameLabelStyle}>
            Name of the Item
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        {/* Lost or Found Radio Buttons */}
        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>Item Status:</Text>
          <View style={styles.radioGroup}>
            <View style={styles.radioOption}>
              <RadioButton
                value="lost"
                status={itemState === 'lost' ? 'checked' : 'unchecked'}
                onPress={() => setItemState('lost')}
                color="#3e8af1"
              />
              <Text style={styles.radioText}>Lost</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="found"
                status={itemState === 'found' ? 'checked' : 'unchecked'}
                onPress={() => setItemState('found')}
                color="#3e8af1"
              />
              <Text style={styles.radioText}>Found</Text>
            </View>
          </View>
        </View>

        {/* Description Input with placeholder instead of label */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={itemDescription}
            onChangeText={setItemDescription}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Describe the item..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>

        {/* Image Upload */}
        <View style={styles.imageUploadContainer}>
          <Text style={styles.imageLabel}>Item Image</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {image ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>
          {image && (
            <View style={styles.imagePreviewContainer}>
              <ScrollView 
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                style={styles.scrollViewHorizontal}
              >
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  style={styles.scrollViewVertical}
                >
                  <Image 
                    source={{ uri: image.uri }} 
                    style={styles.imagePreview} 
                    resizeMode="contain"
                  />
                </ScrollView>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Error Message Box */}
        <View style={styles.errorBox}>
          <Text style={{textAlign: "center", color: errorColor}}>{errorMessage}</Text>
        </View>

        {/* Add Item Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddItem;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    backgroundColor: "#050c16",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
    paddingVertical: 40,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
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
    marginBottom: 20,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 5,
    borderWidth: 1,
    borderColor: '#3e8af1',
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  radioContainer: {
    width: '75%',
    marginBottom: 20,
  },
  radioLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    color: 'white',
    marginLeft: 5,
  },
  imageUploadContainer: {
    width: '75%',
    marginBottom: 20,
  },
  imageLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: '#3e8af1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  imagePickerText: {
    color: 'white',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#3e8af1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  scrollViewHorizontal: {
    width: '100%',
    height: '100%',
  },
  scrollViewVertical: {
    height: '100%',
  },
  imagePreview: {
    width: 400,
    height: 300,
  },
  errorBox: {
    width: "75%",
    paddingVertical: 8,
    minHeight: 20,
    marginTop: 10,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#3e8af1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 50,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
