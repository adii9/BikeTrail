import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert
} from "react-native";
import { Svg, Path } from "react-native-svg";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine";
import { supabase } from "./utils/supabaseClient";

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

export const JourneyPage = () => {
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false); // State to track if journey is paused
  const [route, setRoute] = useState([]); // Array to store route coordinates
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [stats, setStats] = useState({
    distance: 0,
    avgSpeed: 0,
    timeTaken: 0,
    pauseTime: 0, // Track pause time in seconds
  });

  const [currentLocation, setCurrentLocation] = useState(null); // For showing current position on the map
  const [pauseStartTime, setPauseStartTime] = useState(null); // To record when the pause started
  useEffect(() => {
    let locationSubscription = null;

    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission not granted");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude, speed } = location.coords;
          const timestamp = location.timestamp || Date.now(); // Use fallback if no timestamp

          const speedInKmh = (speed * 3.6).toFixed(2);

          const newPoint = {
            latitude,
            longitude,
            timestamp: location.timestamp || Date.now(), // Use Date.now() if timestamp is missing
          };
          setRoute((prevRoute) => [...prevRoute, newPoint]);
          setCurrentLocation(newPoint);
          setCurrentSpeed(speed ? speedInKmh : 0);
        }
      );
    };

    if (tracking && !paused) {
      getLocation();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [tracking, paused]);

  // Calculate stats when tracking stops or pauses
  useEffect(() => {
    if (!tracking && route.length > 1) {
      const calculatedStats = calculateStats(route);
      setStats(calculatedStats);
    }
  }, [tracking, paused]);

  // Calculate distance using haversine formula
  const calculateDistance = (route) => {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += haversine(route[i], route[i + 1], { unit: "km" });
    }
    return totalDistance.toFixed(2); // Distance in km
  };

  // Calculate stats: distance, time, and speed (including pause time)
  const calculateStats = (route) => {
    if (route.length < 2) {
      return {
        distance: 0,
        avgSpeed: 0,
        timeTaken: 0,
        pauseTime: stats.pauseTime,
      };
    }

    const totalDistance = calculateDistance(route);

    const startTime = route[0].timestamp;
    const endTime = route[route.length - 1].timestamp;

    const timeTakenInMs = endTime - startTime - stats.pauseTime * 1000;

    if (timeTakenInMs <= 0) {
      return {
        distance: totalDistance,
        avgSpeed: 0,
        timeTaken: 0,
        pauseTime: stats.pauseTime,
      };
    }

    const timeTakenInHours = timeTakenInMs / (1000 * 60 * 60); // Convert to hours
    console.log("Time taken in hrs -> ", timeTakenInHours);
    const avgSpeed = totalDistance / timeTakenInHours; // Speed in km/h

    return {
      distance: totalDistance,
      avgSpeed: avgSpeed.toFixed(2),
      timeTaken: timeTakenInHours.toFixed(2),
      pauseTime: stats.pauseTime,
    };
  };

  const handlePause = () => {
    if (paused) {
      // User is resuming; calculate pause duration
      if (pauseStartTime) {
        const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000); // Duration in seconds
        setStats((prevStats) => ({
          ...prevStats,
          pauseTime: prevStats.pauseTime + pauseDuration, // Accumulate pause time
        }));
      }
      setPauseStartTime(null); // Clear pause start time
    } else {
      // User is pausing; record the start time
      if (!pauseStartTime) {
        setPauseStartTime(Date.now());
      }
    }
    setPaused(!paused); // Toggle pause state
  };

  const saveRoute = async () => {
    console.log("Details that needs to be saved -> ", stats);
    try {
      const { data, error } = await supabase
        .from("route_details") // Table name
        .insert([
          {
            route_data: route,
            average_speed: stats.avgSpeed,
            distance_travelled: stats.distance,
            time_taken: stats.timeTaken,
            hault_time: stats.pauseTime,
          },
        ]);

      if (error) {
        console.error("Error saving route:", error.message);
        return { success: false, message: error.message };
      }

      console.log("Route saved successfully:");
      setRoute([]); // Reset route
      setStats({
        distance: 0,
        avgSpeed: 0,
        timeTaken: 0,
        pauseTime: 0,
      }); // Reset stats
      Alert.alert("Success", "Ride details have been saved.");
      return { success: true };
    } catch (err) {
      console.error("Unexpected error:", err.message);
      return { success: false, message: err.message };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' }}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.overlay} />
          <Text style={styles.headerTitle}>BikeTrail</Text>
          <Text style={styles.headerSubtitle}>Track, Compete, Conquer</Text>
        </ImageBackground> */}

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || 37.7749,
            longitude: currentLocation?.longitude || -122.4194,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={
            currentLocation && {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }
          }
        >
          {route.length > 0 && (
            <>
              <Polyline
                coordinates={route.map((point) => ({
                  latitude: point.latitude,
                  longitude: point.longitude,
                }))}
                strokeColor="blue"
                strokeWidth={3}
              />
              <Marker
                coordinate={{
                  latitude: route[0].latitude,
                  longitude: route[0].longitude,
                }}
                title="Start"
              />
              <Marker
                coordinate={{
                  latitude: route[route.length - 1].latitude,
                  longitude: route[route.length - 1].longitude,
                }}
                title="Current Location"
              />
            </>
          )}
        </MapView>

        <View style={styles.content}>
          <View style={styles.ActionButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                if (!tracking) {
                  setRoute([]); // Reset route
                  setStats({
                    distance: 0,
                    avgSpeed: 0,
                    timeTaken: 0,
                    pauseTime: 0,
                  }); // Reset stats
                }
                setTracking(!tracking); // Toggle tracking
              }}
            >
              <BikeIcon style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {tracking && !paused ? "Stop Ride" : "Start Ride"}
              </Text>
            </TouchableOpacity>

            {tracking && (
              <TouchableOpacity style={styles.button} onPress={handlePause}>
                <BikeIcon style={styles.buttonIcon} />
                <Text style={styles.buttonText}>
                  {tracking && !paused ? "Pause" : "Resume"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

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
                  <Text style={styles.statValue}>{stats.distance}</Text>
                  <Text style={styles.statLabel}>km Ridden</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.timeTaken}</Text>
                  <Text style={styles.statLabel}>Hours</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.avgSpeed} km/h</Text>
                  <Text style={styles.statLabel}>Avg. Speed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.pauseTime} Secs</Text>
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

          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.activityItem}>
              <BikeIcon style={styles.activityIcon} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Morning Ride</Text>
                <Text style={styles.activitySubtitle}>
                  15.2 km • 45 min • 2 days ago
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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

export default JourneyPage;
