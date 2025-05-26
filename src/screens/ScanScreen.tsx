import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as ImagePicker from 'expo-image-picker';
import { IDScanData, ScanStatus } from '../types';

type ScanScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scan'>;
};

const ScanScreen: React.FC<ScanScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFrontSide, setIsFrontSide] = useState(true);
  const cameraRef = useRef<Camera>(null);
  
  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const processImage = async (uri: string) => {
    try {
      setScanStatus('analyzing');
      const processedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      
      // Mock analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scanData: IDScanData = {
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        idNumber: 'ID12345678',
        address: '123 Main St, Anytown, USA',
        scanDate: new Date().toISOString(),
        imageUri: processedImage.uri,
        ...(isFrontSide ? {} : {
          issueDate: '2020-01-01',
          expiryDate: '2025-01-01'
        })
      };

      if (isFrontSide) {
        setIsFrontSide(false);
        setScanStatus('completed');
        Alert.alert(
          'Front Side Scanned',
          'Please scan the back side of the ID',
          [{ text: 'OK', onPress: () => {
            setCapturedImage(null);
            setScanStatus('idle');
          }}]
        );
      } else {
        setScanStatus('completed');
        navigation.navigate('Review', { idData: scanData });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setScanStatus('error');
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    
    try {
      setScanStatus('scanning');
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      await processImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      setScanStatus('error');
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setScanStatus('error');
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          {scanStatus === 'analyzing' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.retakeButton}
                onPress={() => setCapturedImage(null)}
              >
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={styles.overlay}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Ionicons name="images" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
              disabled={!isCameraReady || scanStatus === 'scanning'}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.statusText}>
            {scanStatus === 'scanning' && 'Scanning...'} 
            {scanStatus === 'analyzing' && 'Analyzing...'} 
            {scanStatus === 'completed' && 'Scan complete'}
          </Text>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 30,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: '100%',
    height: '40%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  retakeButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
});

export default ScanScreen;