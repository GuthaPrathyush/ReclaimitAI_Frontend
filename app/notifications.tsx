import { StyleSheet, Text, View, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavBar from '../components/ui/TopNavBar';
import { useEffect } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import NotificationCard from '../components/NotificationCard';
import { useItems } from '@/contexts/ItemsContext';

const NotificationsScreen = () => {
  const router = useRouter();
  const { notifications, notificationsLoading, notificationsError, fetchNotifications } = useItems();

  // Refresh notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <NotificationCard notification={item} />
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar hidden />
      <TopNavBar />
      <View style={styles.container}>
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
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {notifications.length} {notifications.length === 1 ? 'match' : 'matches'} found
          </Text>
        </View>
        
        {notificationsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3e8af1" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notificationsError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {notificationsError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.item_id}-${item.matched_item_id}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchNotifications}
            refreshing={notificationsLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No notifications to display</Text>
                <Text style={styles.emptySubtext}>When your items match with others, they'll appear here</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
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
  safeAreaContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#050c16",
  },
  lightSource: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(62, 138, 241, 0.1)',
    elevation: 80,
  },
  headerContainer: {
    width: '90%',
    marginTop: 15,
    marginBottom: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 5,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#3e8af1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});
