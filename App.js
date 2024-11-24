// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./Homescreen";
import JourneyPage from "./JourneyPage";
import LoginPage from "./LoginPage";

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
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Hide header for HomeScreen
        />
        <Stack.Screen name="Journey" component={JourneyPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
