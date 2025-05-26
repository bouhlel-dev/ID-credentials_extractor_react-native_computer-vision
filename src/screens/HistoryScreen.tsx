import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { getAllIDScans, deleteIDScan, IDScanData } from '../utils/database';
import { exportToExcel } from '../utils/excelExport';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [scans, setScans] = useState<IDScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load all scans from the database
  const loadScans = async () => {
    try {
      const allScans = await getAllIDScans();
      setScans(allScans);
    } catch (error) {
      console.error('Error loading scans:', error);
      Alert.alert('Error', 'Failed to load scan history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Load scans when the component mounts
  useEffect(() => {
    loadScans();
    
    // Add a listener to refresh data when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadScans();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Handle refreshing the list
  const handleRefresh = () => {
    setRefreshing(true);
    loadScans();
  };
  
  // Delete a scan from the database
  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIDScan(id);
              // Refresh the list after deletion
              loadScans();
            } catch (error) {
              console.error('Error deleting scan:', error);
              Alert.alert('Error', 'Failed to delete scan.');
            }
          } 
        },
      ]
    );
  };
  
  // Export all scans to Excel
  const handleExportAll = async () => {
    if (scans.length === 0) {
      Alert.alert('No Data', 'There are no scans to export.');
      return;
    }
    
    try {
      await exportToExcel(scans);
      Alert.alert('Success', 'All data exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Render each scan item
  const renderItem = ({ item }: { item: IDScanData }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id!)}>
          <Ionicons name="trash-outline" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID Number:</Text>
          <Text style={styles.infoValue}>{item.idNumber}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date of Birth:</Text>
          <Text style={styles.infoValue}>{item.dateOfBirth}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scan Date:</Text>
          <Text style={styles.infoValue}>{formatDate(item.scanDate)}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('Review', { idData: item })}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No scanned IDs yet</Text>
      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.scanButtonText}>Scan an ID</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading scan history...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        {scans.length > 0 && (
          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={handleExportAll}
          >
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.exportButtonText}>Export All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContent: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  viewButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default HistoryScreen;