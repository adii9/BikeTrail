import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './utils/supabaseClient';

const UserIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z" />
  </Svg>
);

const CameraIcon = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    bloodType: '',
    emergencyContact: '',
    emergencyPhone: '',
    profilePicture: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;

      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const handleChange = (name, value) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfile(prevProfile => ({
        ...prevProfile,
        profilePicture: result.assets[0].uri,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <UserIcon style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>

        <View style={styles.profilePictureContainer}>
          <Image
            source={profile.profilePicture ? { uri: profile.profilePicture } : require('./assets/icon.png')}
            style={styles.profilePicture}
          />
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleImagePick}>
            <CameraIcon style={styles.changePhotoIcon} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={profile.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={profile.age}
            onChangeText={(text) => handleChange('age', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={profile.weight}
            onChangeText={(text) => handleChange('weight', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={profile.height}
            onChangeText={(text) => handleChange('height', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Blood Type"
            value={profile.bloodType}
            onChangeText={(text) => handleChange('bloodType', text)}
          />

          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Name"
            value={profile.emergencyContact}
            onChangeText={(text) => handleChange('emergencyContact', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact Phone"
            value={profile.emergencyPhone}
            onChangeText={(text) => handleChange('emergencyPhone', text)}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    marginRight: 10,
    color: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changePhotoIcon: {
    marginRight: 5,
    color: '#ffffff',
  },
  changePhotoText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfilePage;

