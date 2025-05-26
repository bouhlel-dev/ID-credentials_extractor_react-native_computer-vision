import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import { saveIDScan, IDScanData } from '../utils/database';
import { exportToExcel } from '../utils/excelExport';

type ReviewScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Review'>;
  route: RouteProp<RootStackParamList, 'Review'>;
};

const ReviewScreen: React.FC<ReviewScreenProps> = ({ navigation, route }) => {
  const { idData } = route.params;
  
  // State to store editable ID data
  const [formData, setFormData] = useState<IDScanData>(idData);
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle text input changes
  const handleChange = (field: keyof IDScanData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save the ID scan data to the database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.name || !formData.idNumber) {
        Alert.alert('Missing Information', 'Name and ID Number are required.');
        setIsSaving(false);
        return;
      }
      
      // Save to database
      const insertId = await saveIDScan(formData);
      
      setIsSaving(false);
      Alert.alert(
        'Success',
        'ID information saved successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Error saving ID scan:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save ID information. Please try again.');
    }
  };
  
  // Export the current ID data to Excel
  const handleExport = async () => {
    try {
      await exportToExcel([formData]);
      Alert.alert('Success', 'Data exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review ID Information</Text>
        <Text style={styles.subtitle}>Please verify and correct the extracted information</Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Full Name"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(text) => handleChange('dateOfBirth', text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ID Number</Text>
          <TextInput
            style={styles.input}
            value={formData.idNumber}
            onChangeText={(text) => handleChange('idNumber', text)}
            placeholder="ID Number"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            placeholder="Address"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Issue Date</Text>
          <TextInput
            style={styles.input}
            value={formData.issueDate}
            onChangeText={(text) => handleChange('issueDate', text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={styles.input}
            value={formData.expiryDate}
            onChangeText={(text) => handleChange('expiryDate', text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Information</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.additionalInfo}
            onChangeText={(text) => handleChange('additionalInfo', text)}
            placeholder="Additional Information"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Ionicons name="save" size={24} color="white" />
          <Text style={styles.buttonText}>
            {isSaving ? 'Saving...' : 'Save Information'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.exportButton]} 
          onPress={handleExport}
        >
          <Ionicons name="download" size={24} color="white" />
          <Text style={styles.buttonText}>Export to Excel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.scanButton]} 
          onPress={() => navigation.navigate('Scan')}
        >
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#444',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  exportButton: {
    backgroundColor: '#FF9800',
  },
  scanButton: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ReviewScreen;