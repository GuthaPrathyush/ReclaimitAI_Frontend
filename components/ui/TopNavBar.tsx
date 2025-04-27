import { StyleSheet, Text, View, Image, TextInput, Animated, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { IconSymbol } from '@/components/ui/IconSymbol';
import Logo from '../../assets/logo.png';
import { navigate } from 'expo-router/build/global-state/routing';
import { useRouter } from 'expo-router';

const TopNavBar = () => {
  const [searchText, setSearchText] = useState('');
  const [imgWidth, setImgWidth] = useState(null);
  const [imgHeight, setImgHeight] = useState(50);
  const [searchActive, setSearchActive] = useState(false);

  const router = useRouter();
  
  // Animation values
  const logoAnimation = useRef(new Animated.Value(1)).current;
  const searchInputWidth = useRef(new Animated.Value(0)).current;
  const notificationOpacity = useRef(new Animated.Value(1)).current;
  const searchIconPosition = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Use Image.getSize instead of resolveAssetSource
    // For local images, we can use a predetermined aspect ratio or default width
    // The standard approach is to set a default width and use resizeMode="contain"
    setImgWidth(120); // Setting a reasonable default width
    
    // If you need to get the actual dimensions, you could use this pattern with remote images:
    // Image.getSize(imageUrl, (width, height) => {
    //   const desiredHeight = imgHeight || 50;
    //   const scaleFactor = desiredHeight / height;
    //   const scaledWidth = width * scaleFactor;
    //   setImgWidth(scaledWidth + 50);
    // });
  }, []);
  
  const toggleSearch = () => {
    if (searchActive) {
      // Animate back to original state
      Animated.parallel([
        Animated.timing(logoAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchInputWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchIconPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
      setSearchText('');
    } else {
      // Animate to search state
      Animated.parallel([
        Animated.timing(logoAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchInputWidth, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchIconPosition, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Focus the input after animation completes
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    }
    
    setSearchActive(!searchActive);
  };
  
  // Interpolate values for animations
  const logoScale = logoAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  const logoTranslateX = logoAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0]
  });
  
  // Changed to exact pixel values for more control
  const inputWidthInterpolate = searchInputWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250] // Adjust based on your screen size
  });
  
  const searchIconTranslateX = searchIconPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30]
  });

  return (
    <View style={styles.navBar}>
      <Animated.View style={{
        transform: [
          { scale: logoScale },
          { translateX: logoTranslateX }
        ],
        opacity: logoAnimation
      }}>
        <Image
          style={[
            {height: imgHeight}, 
            imgWidth !== null ? { width: imgWidth } : {},
            { resizeMode: 'contain' } // Add this to maintain aspect ratio
          ]}
          source={Logo}
        />
      </Animated.View>
      
      <View style={styles.expandingSection}>
        <Animated.View style={[
          styles.searchContainer, 
          { 
            width: inputWidthInterpolate,
            display: searchActive ? 'flex' : 'none'  // Hide completely when not active
          }
        ]}>
          <TextInput
            ref={inputRef}
            placeholder='Search...'
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            placeholderTextColor="#fff"
          />
        </Animated.View>
        
        <View style={styles.iconsPanelNavBar}>
          <TouchableOpacity onPress={toggleSearch}>
            <Animated.View style={{
              transform: [{ translateX: searchIconTranslateX }]
            }}>
              <IconSymbol size={28} name="search" color="#FFF" />
            </Animated.View>
          </TouchableOpacity>
          
          <Animated.View style={{ opacity: notificationOpacity }}>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <IconSymbol size={28} name="notifications" color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default TopNavBar;

const styles = StyleSheet.create({
  navBar: {
    width: '100%',
    flexDirection: 'row',         
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#050c16',
  },
  expandingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  searchContainer: {
    overflow: 'hidden',
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 35,
    color: "#fff"
  },
  logo: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold'
  },
  iconsPanelNavBar: {
    display: "flex",
    flexDirection: "row",
    width: 70,
    justifyContent: "space-between"
  }
});