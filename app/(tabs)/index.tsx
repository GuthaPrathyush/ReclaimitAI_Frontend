import { StyleSheet, Text, View, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavBar from '../../components/ui/TopNavBar';
import { useEffect, useState } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';
import ItemCard from '../../components/ItemCard';
import { useItems } from '@/contexts/ItemsContext'; // Import the useItems hook

const index = () => {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'lost', or 'found'
  
  // Use the items context instead of dummy data
  const { items, loading, error, fetchItems } = useItems();

  // Refresh items when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items based on the current filter mode
  const filteredItems = items.filter(item => {
    if (filterMode === 'all') return true;
    if (filterMode === 'lost') return item.state === true;
    if (filterMode === 'found') return item.state === false;
    return true;
  });

  const renderItem = ({ item }) => (
    <ItemCard item={item} />
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
        <TouchableOpacity onPress={() => router.push('/testing')}><Text style={{color: "white"}}>Testing screen</Text></TouchableOpacity>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3e8af1" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchItems}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchItems}
            refreshing={loading}
            extraData={filterMode} // Add this to ensure re-render when filter changes
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items to display</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default index;

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
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 15,
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
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
