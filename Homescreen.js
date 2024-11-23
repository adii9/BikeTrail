import React, { useState, useRef, useEffect } from "react";
import { View, Text, Button, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Video } from "expo-av"; // Import expo-av's Video component

const HomeScreen = ({ navigation }) => {
  const fadeIn = useRef(new Animated.Value(0)); // Use ref to persist the fadeIn value
  const [hasAnimated, setHasAnimated] = useState(false); // Track if animation has run
  const videoRef = useRef(null); // Reference to the video component

  useEffect(() => {
    // Trigger fade-in only if it's the first time
    if (!hasAnimated) {
      Animated.timing(fadeIn.current, {
        toValue: 1,
        duration: 2000, // Duration of the fade-in effect
        useNativeDriver: true,
      }).start();
      setHasAnimated(true); // Set flag to indicate animation has run
    }
  }, [hasAnimated]); // Ensure the effect runs only once

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Reset the video playback to the start and replay
      videoRef.current.setPositionAsync(0); // Reset video
      videoRef.current.playAsync(); // Play the video again
    }
  };

  return (
    <View style={styles.container}>
      {/* Background video */}
      <Video
        ref={videoRef} // Attach the video ref
        source={require("./backgroud.mov")} // Local video file
        style={styles.backgroundVideo}
        isMuted={true} // Optional: mute the video
        shouldPlay={true} // Start playing automatically
        isLooping={false} // Manual loop control
        resizeMode="cover" // Cover the screen with video
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate} // Monitor playback status
      />

      {/* Foreground content */}
      <Animated.View style={[styles.overlay, { opacity: fadeIn.current }]}>
        <Text style={styles.title}>Welcome to the Journey Tracker!</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Journey")}
          >
            <Text style={styles.buttonText}>Start Journey</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Ensure content is above the video
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff", // White text for better visibility on video
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 30, // Add horizontal padding for better spacing
    textShadowColor: "#000", // Adds a shadow behind the text
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    width: "80%", // Button container to allow padding around button
    marginTop: 10,
  },
  overlay: {
    position: "absolute", // Position content above the video
    top: 80, // Move the overlay to the top of the screen
    left: "40%", // Center horizontally
    transform: [{ translateX: -150 }], // Center alignment with offset
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 255, 0.5)", // Semi-transparent blue background
    borderRadius: 10, // Rounded corners for the overlay container
    padding: 20, // Padding around content for spacing
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject, // This ensures the video takes up the entire screen
    zIndex: 0, // Ensure the video stays behind the content
  },
  button: {
    backgroundColor: "#000", // Black background for the button
    paddingVertical: 12, // Vertical padding for button
    paddingHorizontal: 25, // Horizontal padding for button
    borderRadius: 25, // Rounded corners for the button
    alignItems: "center", // Center the text inside the button
    justifyContent: "center",
    shadowColor: "#000", // Shadow effect for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff", // White text inside the button
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
