import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import haversine from "haversine";

export default function App() {
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

          const newPoint = { latitude, longitude, timestamp };
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

  return (
    <View style={styles.container}>
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

      <View style={styles.controls}>
        <Text style={styles.speedText}>Current Speed: {currentSpeed} km/h</Text>
        <Button
          title={tracking ? "Stop Tracking" : "Start Tracking"}
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
        />
        {tracking && !paused && <Button title="Pause" onPress={handlePause} />}
        {paused && <Button title="Resume" onPress={handlePause} />}
        {!tracking && route.length > 1 && (
          <View style={styles.statsContainer}>
            <Text style={styles.title}>Tracking Stats:</Text>
            <Text style={styles.stat}>Total Distance: {stats.distance} km</Text>
            <Text style={styles.stat}>
              Average Speed: {stats.avgSpeed} km/h
            </Text>
            <Text style={styles.stat}>Time Taken: {stats.timeTaken} hrs</Text>
            <Text style={styles.stat}>Pause Time: {stats.pauseTime} sec</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
  },
  statsContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stat: {
    fontSize: 16,
    marginVertical: 2,
  },
});
