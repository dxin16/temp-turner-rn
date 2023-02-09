import React, { useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  NativeBaseProvider,
  VStack,
  Text,
} from "native-base";
import CurrentBlock from './CurrentBlock';
import TargetBlock from './TargetBlock';
import ScheduleBlock from './ScheduleBlock';
import { styles, dims } from './Styles';

// const {height, width} = useWindowDimensions();

// Base function to show the main screen
// Use Native Base for UI - sectioning off important parts of app
// Primary UI structure is VStacks and HStacks with various blocks
function HomeScreen({ navigation }) {
  return (
    <NativeBaseProvider>
      <VStack pt="3" h="100%" space={4} alignItems="center">

        <CurrentBlock />
        <TargetBlock />
        <ScheduleBlock />

      </VStack>
    </NativeBaseProvider>
  );
}

// Example implementation of navigation
function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
    </View>
  );
}

// Actual App structure that is returned
const Stack = createNativeStackNavigator();
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="The Temp Turner" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;