import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Svg, Path, G, Circle } from "react-native-svg";
import { Video } from "expo-av"; // Import expo-av's Video component
import { supabase } from "./utils/supabaseClient";

const HomeScreen = ({ navigation }) => {
  const fadeIn = useRef(new Animated.Value(0)); // Use ref to persist the fadeIn value
  const [hasAnimated, setHasAnimated] = useState(false); // Track if animation has run
  const videoRef = useRef(null); // Reference to the video component

  const GoogleIcon = (props) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <Path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
      />
      <Path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </Svg>
  );

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

  const loginWithGoogle = async () => {
    try {
      // Set the redirect URL (change it to your actual redirect URL)
      const redirectUrl = "https://kryofojqmfcsvykaccdj.supabase.co/auth/v1/callback"; // Replace with your app's redirect URL

      // Start the Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl, // Define the URL to redirect back to after authentication
        },
      });

      if (error) {
        console.error("Google Login Error:", error.message);
        return { success: false, message: error.message };
      }

      console.log(
        "Login initiated, redirecting to Google OAuth URL:",
        data.url
      );

      // At this point, the user is redirected to Google for login
      return { success: true, message: "Redirecting to Google OAuth" };
    } catch (err) {
      console.error("Unexpected Error:", err.message);
      return { success: false, message: err.message };
    }
  };

  // Handle the callback after OAuth login
  const handleOAuthCallback = (event) => {
    const { url } = event;

    // If the URL contains the OAuth callback from Google
    if (url.includes("your-callback-url")) {
      const { data, error } = supabase.auth.getSessionFromUrl(url);

      if (error) {
        console.error("Error during OAuth callback:", error.message);
        return;
      }

      // Successfully logged in
      console.log("Logged in with Google:", data);
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
        <Text style={styles.title}>Welcome to the Bike Trail!</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            // onPress={loginWithGoogle}
            onPress={() => navigation.navigate("Journey")}
          >
            <GoogleIcon style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Login with Google</Text>
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
  googleButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "bold",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
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
