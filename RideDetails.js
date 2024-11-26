import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  FlatList,
  Share
} from "react-native";
import { Svg, Path } from "react-native-svg";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine";
import { supabase } from "./utils/supabaseClient";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";


const BikeIcon = (props) => (
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
    <Path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    <Path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
  </Svg>
);

const MapIcon = (props) => (
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
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Path d="M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
  </Svg>
);

const TrophyIcon = (props) => (
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
    <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <Path d="M4 22h16" />
    <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Svg>
);

export const RideDetails = ({ route }) => {
  const {
    id,
    timeTaken,
    average_speed,
    hault,
    distance_travelled,
    route_data,
  } = route.params;

  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false); // State to track if journey is paused
  const [route1, setRoute1] = useState(route_data); // Array to store route coordinates
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [stats, setStats] = useState({
    distance: 0,
    avgSpeed: 0,
    timeTaken: 0,
    pauseTime: 0, // Track pause time in seconds
  });
  // console.log("Id from Route -> ", route1[route1.length - 1]["latitude"]);
  const [currentLocation, setCurrentLocation] = useState(null); // For showing current position on the map
  const [pauseStartTime, setPauseStartTime] = useState(null); // To record when the pause started
  const [routeDetails, setRouteDetails] = useState();

  const shareJourney = async () => {
    try {
      // Capture the map view as an image
      const snapshotUri = await mapViewRef.current.capture({
        format: "jpg",
        quality: 0.8,
        result: "tmpfile",
      });

      if (!snapshotUri) {
        throw new Error("Snapshot URI is invalid.");
      }

      console.log("Snapshot URI:", snapshotUri);

      const message = `🚴‍♂️ Check out my ride on BikeTrail!
  - Distance: ${distance_travelled} km
  - Time: ${timeTaken} hours
  - Average Speed: ${average_speed} km/h
  - Haults: ${hault} seconds
  Join me on BikeTrail!`;

      const result = await Share.share({
        title: "Share Your Ride",
        message,
        url: snapshotUri, // Attach the captured image directly
      });

      if (result.action === Share.sharedAction) {
        console.log("Shared successfully!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      console.error("Error sharing ride:", error);
      Alert.alert("Error", "Unable to share your ride. Please try again.");
    }
  };

  const mapViewRef = useRef();

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView contentContainerStyle={styles.scrollView}> */}
      {/* <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' }}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.overlay} />
          <Text style={styles.headerTitle}>BikeTrail</Text>
          <Text style={styles.headerSubtitle}>Track, Compete, Conquer</Text>
        </ImageBackground> */}
      <ViewShot ref={mapViewRef} style={{ flex: 1 }} options={{ format: "jpg", quality: 0.9 }}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: route1[route1.length - 1]["latitude"],
            longitude: route1[route1.length - 1]["longitude"],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={
            currentLocation && {
              latitude: route1[route1.length - 1]["longitude"],
              longitude: route1[route1.length - 1]["longitude"],
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }
          }
        >
          {route1.length > 0 && (
            <>
              <Polyline
                coordinates={route1.map((point) => ({
                  latitude: point.latitude,
                  longitude: point.longitude,
                }))}
                strokeColor="blue"
                strokeWidth={3}
              />
              <Marker
                coordinate={{
                  latitude: route1[0].latitude,
                  longitude: route1[0].longitude,
                }}
                title="Start"
              />
              <Marker
                coordinate={{
                  latitude: route1[route1.length - 1].latitude,
                  longitude: route1[route1.length - 1].longitude,
                }}
                title="Current Location"
              />
            </>
          )}
        </MapView>

        <View style={styles.content}>
          <View style={styles.CurrentSpeedContainer}>
            {tracking && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentSpeed} Km/Hr</Text>
                <Text style={styles.statLabel}>Current Speed</Text>
              </View>
            )}
          </View>
          <View style={styles.statsContainer}>
            {!tracking && (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{distance_travelled}</Text>
                  <Text style={styles.statLabel}>km Ridden</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{timeTaken}</Text>
                  <Text style={styles.statLabel}>Hours</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{average_speed} km/h</Text>
                  <Text style={styles.statLabel}>Avg. Speed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{hault} Secs</Text>
                  <Text style={styles.statLabel}>Hault</Text>
                </View>
              </>
            )}
          </View>

          {route.length > 0 && !tracking && (
            <>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={saveRoute}
                >
                  <MapIcon style={styles.actionIcon} />
                  <Text style={styles.actionText}>Save Ride Details</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ViewShot>

      <TouchableOpacity style={styles.shareButton} onPress={shareJourney}>
        <Text style={styles.shareButtonText}>Share Your Journey</Text>
      </TouchableOpacity>

      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  header: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  shareButton: {
    backgroundColor: "#007bff",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginTop: 8,
  },
  content: {
    borderRadius: 12,
    padding: 20,
  },
  button: {
    backgroundColor: "#ff6b6b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 10,
    color: "#ffffff",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  CurrentSpeedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  ActionButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#4ecdc4",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  actionIcon: {
    marginBottom: 5,
    color: "#ffffff",
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityIcon: {
    marginRight: 15,
    color: "#333",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#666",
  },
});

export default RideDetails;
