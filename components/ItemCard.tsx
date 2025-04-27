import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9; // 90% of screen width
const MAX_DESCRIPTION_LENGTH = 100; // Characters to show before "Show More"

const ItemCard = ({ item, showDate = true, onDelete = null, isUserItem = false }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Safely check if description exists and needs truncation
  const needsTruncation = item.description && item.description.length > MAX_DESCRIPTION_LENGTH;
  
  // Get the display description based on showFullDescription state
  const displayDescription = !item.description 
    ? "No description available" 
    : showFullDescription 
      ? item.description 
      : needsTruncation 
        ? `${item.description.substring(0, MAX_DESCRIPTION_LENGTH)}...` 
        : item.description;
  
  // Format the date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setIsDeleting(true);
              const token = await AsyncStorage.getItem('auth_token');
              const backendURI = process.env.EXPO_PUBLIC_BACKEND_URI;
              
              await axios.delete(`${backendURI}/delete-item/${item._id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'auth_token': token
                }
              });
              
              // Call the onDelete callback to update the UI
              if (onDelete) {
                onDelete(item._id);
              }
              
              Alert.alert("Success", "Item deleted successfully");
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert(
                "Error", 
                error.response?.data?.message || "Failed to delete item. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Image Section */}
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/400x200?text=No+Image' }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Status Badge */}
      <View style={[
        styles.statusBadge, 
        { backgroundColor: item.state ? '#FF6B6B' : '#4CAF50' }
      ]}>
        <Text style={styles.statusText}>
          {item.state ? 'LOST' : 'FOUND'}
        </Text>
      </View>
      
      {/* Delete Button (only shown for user's items) */}
      {isUserItem && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      )}
      
      {/* Content Section with Blur Effect */}
      <BlurView intensity={80} tint="dark" style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.itemName}>{item.name || "Unnamed Item"}</Text>
          {showDate && item.timestamp && (
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          )}
        </View>
        
        <Text style={styles.description}>
          {displayDescription}
        </Text>
        
        {needsTruncation && (
          <TouchableOpacity 
            onPress={() => setShowFullDescription(!showFullDescription)}
            style={styles.showMoreButton}
          >
            <Text style={styles.showMoreText}>
              {showFullDescription ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );
};

export default ItemCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 15,
    marginVertical: 10,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  image: {
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
  deleteButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  contentContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(62, 138, 241, 0.2)',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3e8af1',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  description: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  showMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  showMoreText: {
    color: '#3e8af1',
    fontWeight: '600',
    fontSize: 14,
  },
});
