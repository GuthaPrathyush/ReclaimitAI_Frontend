import { StyleSheet, Text, View, TouchableOpacity, StatusBar, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavBar from '../../components/ui/TopNavBar';
import { useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import ItemCard from '../../components/ItemCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Profile = () => {
  const router = useRouter();
  const [showItems, setShowItems] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'lost', or 'found'
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const backendURI = process.env.EXPO_PUBLIC_BACKEND_URI;
  
  // Phone validation regex
  const phoneRegex = /^\+?[1-9]\d{0,2}\d{6,14}$/;

  // Fetch user data and items on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        router.replace('/login');
        return;
      }
      
      // Fetch user profile
      const response = await axios.post(
        `${backendURI}/getUserProfile`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'auth_token': token
          }
        }
      );
      
      if (response.data && response.data.user) {
        setUserData(response.data.user);
      } else {
        throw new Error("Failed to get user data");
      }
      
      // Also fetch user items
      await fetchUserItems();
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to load user profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch user items
  const fetchUserItems = async () => {
    setItemsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await axios.post(
        `${backendURI}/getUserItems`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'auth_token': token
          }
        }
      );
      
      if (response.data && response.data.items) {
        setUserItems(response.data.items);
      } else {
        throw new Error("Failed to get user items");
      }
    } catch (error) {
      console.error("Error fetching user items:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to load your items. Please try again."
      );
    } finally {
      setItemsLoading(false);
    }
  };

  // Start editing phone number
  const handleEditPhone = () => {
    setPhoneInput(userData.phone || '');
    setIsEditingPhone(true);
    setPhoneError('');
  };

  // Cancel editing phone number
  const handleCancelEdit = () => {
    setIsEditingPhone(false);
    setPhoneError('');
  };

  // Save updated phone number
  const handleSavePhone = async () => {
    // Validate phone number using regex
    if (!phoneRegex.test(phoneInput)) {
      setPhoneError('Invalid phone number format');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await axios.post(
        `${backendURI}/update-phone`,
        { phone: phoneInput },
        {
          headers: {
            'Content-Type': 'application/json',
            'auth_token': token
          }
        }
      );
      
      // Update local state
      setUserData({
        ...userData,
        phone: phoneInput
      });
      
      setIsEditingPhone(false);
      setPhoneError('');
      
      // Show success message
      Alert.alert("Success", "Phone number updated successfully");
    } catch (error) {
      console.error("Error updating phone:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to update phone number. Please try again."
      );
    }
  };

  // Handle item deletion
  const handleDeleteItem = (itemId) => {
    // Update the local state to remove the deleted item
    setUserItems(userItems.filter(item => item._id !== itemId));
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Clear auth token from AsyncStorage
              await AsyncStorage.removeItem("auth_token");
              // Navigate to login screen
              router.replace('/login');
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Filter items based on the current filter mode
  const filteredItems = userItems.filter(item => {
    if (filterMode === 'all') return true;
    if (filterMode === 'lost') return item.state === true;
    if (filterMode === 'found') return item.state === false;
    return true;
  });

  const renderItem = ({ item }) => (
    <ItemCard 
      item={item} 
      showDate={true} 
      onDelete={handleDeleteItem}
      isUserItem={true}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <StatusBar hidden />
        <TopNavBar />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#3e8af1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar hidden />
      <TopNavBar />
      <View style={styles.container}>
        <View style={[styles.lightSource, { top: -50, left: -50, width: 150, height: 150 }]} />
        <View style={[styles.lightSource, { bottom: -100, right: -80, width: 200, height: 200 }]} />
        <View style={[styles.lightSource, { top: "40%", left: "40%", width: 300, height: 300 }]} />
        
        {/* User Information Section */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{userData?.name || "N/A"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userData?.mail || "N/A"}</Text>
          </View>
          
          {isEditingPhone ? (
            <View style={styles.editPhoneContainer}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  placeholder="Enter phone number"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="phone-pad"
                  autoFocus
                />
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              </View>
              <View style={styles.editButtonsRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSavePhone}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{userData?.phone || "Not set"}</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditPhone}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        
        {/* My Items Button */}
        <TouchableOpacity 
          style={styles.myItemsButton} 
          onPress={() => {
            setShowItems(!showItems);
            if (!showItems && userItems.length === 0) {
              fetchUserItems();
            }
          }}
        >
          <Text style={styles.myItemsButtonText}>
            {showItems ? "Hide My Items" : "Show My Items"}
          </Text>
        </TouchableOpacity>
        
        {/* My Items Section - Expands in place when button is clicked */}
        {showItems && (
          <>
            {/* Toggle Filter Buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  filterMode === 'all' && styles.activeFilterButton
                ]}
                onPress={() => setFilterMode('all')}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterMode === 'all' && styles.activeFilterText
                ]}>All Items</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  filterMode === 'lost' && styles.activeFilterButton
                ]}
                onPress={() => setFilterMode('lost')}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterMode === 'lost' && styles.activeFilterText
                ]}>Lost</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.filterButton, 
                  filterMode === 'found' && styles.activeFilterButton
                ]}
                onPress={() => setFilterMode('found')}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterMode === 'found' && styles.activeFilterText
                ]}>Found</Text>
              </TouchableOpacity>
            </View>
            
            {/* Status indicator */}
            <View style={styles.statusIndicator}>
              <Text style={styles.statusText}>
                {filterMode === 'all' 
                  ? 'Showing all items' 
                  : filterMode === 'lost' 
                    ? 'Showing lost items' 
                    : 'Showing found items'
                }
              </Text>
              <Text style={styles.itemCountText}>
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            
            {/* Items List */}
            {itemsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="medium" color="#3e8af1" />
                <Text style={styles.loadingText}>Loading items...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                onRefresh={fetchUserItems}
                refreshing={itemsLoading}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No items to display</Text>
                  </View>
                }
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#050c16",
  },
  container: {
    backgroundColor: "#050c16",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    position: "relative",
    marginBottom: 30,
  },
  lightSource: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(62, 138, 241, 0.1)',
    elevation: 80,
  },
  userInfoContainer: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#3e8af1',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    width: 70,
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  editButton: {
    backgroundColor: '#3e8af1',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editPhoneContainer: {
    marginBottom: 15,
  },
  phoneInputContainer: {
    marginVertical: 10,
  },
  phoneInput: {
    height: 40,
    borderColor: '#3e8af1',
    borderWidth: 1,
    borderRadius: 5,
    color: 'white',
    paddingHorizontal: 10,
    marginLeft: 70,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 70,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)', // Slightly transparent red
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 15,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  myItemsButton: {
    backgroundColor: '#3e8af1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
  },
  myItemsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#3e8af1',
  },
  filterButtonText: {
    color: '#999',
    fontWeight: '600',
  },
  activeFilterText: {
    color: 'white',
  },
  statusIndicator: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  itemCountText: {
    color: '#3e8af1',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  }
});
