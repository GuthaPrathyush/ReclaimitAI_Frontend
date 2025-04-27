import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9; // 90% of screen width
const MAX_DESCRIPTION_LENGTH = 100; // Characters to show before "Show More"

const NotificationCard = ({ notification }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();
  
  // Safely check if description exists and needs truncation
  const needsTruncation = notification.matched_item_description && 
                         notification.matched_item_description.length > MAX_DESCRIPTION_LENGTH;
  
  // Get the display description based on showFullDescription state
  const displayDescription = !notification.matched_item_description 
    ? "No description available" 
    : showFullDescription 
      ? notification.matched_item_description 
      : needsTruncation 
        ? `${notification.matched_item_description.substring(0, MAX_DESCRIPTION_LENGTH)}...` 
        : notification.matched_item_description;
  
  // Format the date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle card click to navigate to details page
  const handleCardPress = () => {
    router.push({
      pathname: '/notificationDetails',
      params: { 
        notificationData: JSON.stringify(notification)
      }
    });
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <Image 
        source={{ uri: notification.matched_item_image || 'https://via.placeholder.com/400x200?text=No+Image' }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Match Badge */}
      <View style={styles.matchBadge}>
        <Text style={styles.matchText}>MATCH FOUND</Text>
      </View>
      
      {/* Status Badge */}
      <View style={[
        styles.statusBadge, 
        { backgroundColor: notification.matched_item_state ? '#FF6B6B' : '#4CAF50' }
      ]}>
        <Text style={styles.statusText}>
          {notification.matched_item_state ? 'LOST' : 'FOUND'}
        </Text>
      </View>
      
      {/* Content Section with Blur Effect */}
      <BlurView intensity={80} tint="dark" style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.itemName}>{notification.matched_item_name || "Unnamed Item"}</Text>
          {notification.matched_item_timestamp && (
            <Text style={styles.dateText}>{formatDate(notification.matched_item_timestamp)}</Text>
          )}
        </View>
        
        <Text style={styles.matchedWithText}>
          Matched with your item: <Text style={styles.highlightText}>{notification.item_name}</Text>
        </Text>
        
        <View style={styles.ownerInfoContainer}>
          <Text style={styles.ownerInfoLabel}>Owner: </Text>
          <Text style={styles.ownerInfoValue}>{notification.owner_name}</Text>
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
        
        <Text style={styles.tapForMoreText}>Tap for more details</Text>
      </BlurView>
    </TouchableOpacity>
  );
};

export default NotificationCard;

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
  matchBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#3e8af1',
  },
  matchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
  matchedWithText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  highlightText: {
    color: '#3e8af1',
    fontWeight: '600',
  },
  ownerInfoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ownerInfoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ownerInfoValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
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
  tapForMoreText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
