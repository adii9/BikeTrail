// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./Homescreen";
import JourneyPage from "./JourneyPage";
import LoginPage from "./LoginPage";
import RideDetails from "./RideDetails";
import ProfilePage from "./ProfilePage";
import AchievementsPage from "./AchievementCard";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{ headerShown: false }} // Hide header for HomeScreen
        />
        <Stack.Screen
          name="AchievementsPage"
          component={AchievementsPage}
          options={{ headerShown: false }} // Hide header for HomeScreen
        />
        <Stack.Screen
          name="ProfilePage"
          component={ProfilePage}
          options={{ headerShown: false }} // Hide header for HomeScreen
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Hide header for HomeScreen
        />
        <Stack.Screen name="Journey" component={JourneyPage} />
        <Stack.Screen name="Ride Details" component={RideDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
