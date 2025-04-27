import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NotificationDetails = () => {
  const router = useRouter();
  const { notificationData } = useLocalSearchParams();
  const notification = JSON.parse(notificationData);
  
  // Format the date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle contact actions
  const handleCall = () => {
    Linking.openURL(`tel:${notification.owner_phone}`);
  };
  
  const handleEmail = () => {
    Linking.openURL(`mailto:${notification.owner_mail}`);
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar hidden />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
        
        {/* Matched Item Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matched Item</Text>
          
          <View style={styles.itemContainer}>
            <Image 
              source={{ uri: notification.matched_item_image || 'https://via.placeholder.com/400x200?text=No+Image' }} 
              style={styles.itemImage}
              resizeMode="cover"
            />
            
            <View style={[
              styles.statusBadge, 
              { backgroundColor: notification.matched_item_state ? '#FF6B6B' : '#4CAF50' }
            ]}>
              <Text style={styles.statusText}>
                {notification.matched_item_state ? 'LOST' : 'FOUND'}
              </Text>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{notification.matched_item_name}</Text>
              {notification.matched_item_timestamp && (
                <Text style={styles.dateText}>
                  {formatDate(notification.matched_item_timestamp)}
                </Text>
              )}
              <Text style={styles.descriptionTitle}>Description:</Text>
              <Text style={styles.description}>{notification.matched_item_description || "No description available"}</Text>
            </View>
          </View>
        </View>
        
        {/* Your Item Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Item</Text>
          
          <View style={styles.itemContainer}>
            <Image 
              source={{ uri: notification.item_image || 'https://via.placeholder.com/400x200?text=No+Image' }} 
              style={styles.itemImage}
              resizeMode="cover"
            />
            
            <View style={[
              styles.statusBadge, 
              { backgroundColor: notification.item_state ? '#FF6B6B' : '#4CAF50' }
            ]}>
              <Text style={styles.statusText}>
                {notification.item_state ? 'LOST' : 'FOUND'}
              </Text>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{notification.item_name}</Text>
            </View>
          </View>
        </View>
        
        {/* Owner Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          
          <View style={styles.ownerContainer}>
            <View style={styles.ownerInfoRow}>
              <Text style={styles.ownerInfoLabel}>Name:</Text>
              <Text style={styles.ownerInfoValue}>{notification.owner_name}</Text>
            </View>
            
            <View style={styles.ownerInfoRow}>
              <Text style={styles.ownerInfoLabel}>Email:</Text>
              <Text style={styles.ownerInfoValue}>{notification.owner_mail}</Text>
            </View>
            
            <View style={styles.ownerInfoRow}>
              <Text style={styles.ownerInfoLabel}>Phone:</Text>
              <Text style={styles.ownerInfoValue}>{notification.owner_phone}</Text>
            </View>
            
            <View style={styles.contactButtonsContainer}>
              <TouchableOpacity onPress={handleCall} style={[styles.contactButton, styles.callButton]}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleEmail} style={[styles.contactButton, styles.emailButton]}>
                <Ionicons name="mail" size={20} color="white" />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationDetails;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#050c16",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(62, 138, 241, 0.2)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  container: {
    flex: 1,
    backgroundColor: "#050c16",
  },
  contentContainer: {
    padding: 15,
  },
  lightSource: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(62, 138, 241, 0.1)',
    elevation: 80,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#3e8af1',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemDetails: {
    padding: 15,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  ownerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
  },
  ownerInfoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ownerInfoLabel: {
    width: 80,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ownerInfoValue: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 0.48,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  emailButton: {
    backgroundColor: '#3e8af1',
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});
