import React, { useContext, useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  NativeBaseProvider,
  VStack,
  Text,
  HStack,
  Switch,
} from "native-base";
import CurrentBlock from './CurrentBlock';
import TargetBlock from './TargetBlock';
import ScheduleBlock from './ScheduleBlock';
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';
import { WebView } from 'react-native-webview';


// Main screen
// Use Native Base for UI - sectioning off parts of app
// Primary UI structure is VStacks and HStacks with various blocks contained in the stacks
function HomeScreen({ navigation }) {
  return (
    <NativeBaseProvider>
      <VStack pt="3" h="100%" space={4} alignItems="center">

        {/* Main three blocks; defined in their own .js files */}
        <CurrentBlock navi={navigation}/>
        <TargetBlock navi={navigation}/>
        <ScheduleBlock />

      </VStack>
    </NativeBaseProvider>
  );
}

// Example second screen for navigation
function CameraScreen() {
  return (
    <NativeBaseProvider>
      <WebView source={{ uri: "https://google.com" }} />
    </NativeBaseProvider>
  );
}

function SettingsScreen() {
  const appStates = useContext(ScheduleContext)

  return (
    <NativeBaseProvider>
      <HStack p="5" w="100%" h="10%">
        <Text fontSize={20} w="70%">Temperature Units</Text>
        <Text fontSize={20}>°F</Text>
        <Switch size="sm" offTrackColor="blue.200" onTrackColor="blue.200" isChecked={appStates.useCelsiusBool}
          onToggle={() => appStates.setUseCelsius(!appStates.useCelsiusBool)}
        />
        <Text fontSize={20}>°C</Text>
      </HStack>
    </NativeBaseProvider>
  )
}

// Main App structure that is returned
const Stack = createNativeStackNavigator();
function App() {

  // Create necessary states for the ScheduleContext
  const [scheduleRows, setScheduleRows] = useState([
    {
      num: "1",
      temp: "---",
      time: "--:--:--",
      intTime: 0,
      color: "waiting",
      index: 0
    },
    {
      num: "+",
      temp: "---",
      time: "--:--:--",
      intTime: 0,
      color: "disabled",
      index: 1
    },
  ])
  const [updateTarget, setUpdateTarget] = useState(false)
  const [updateSchedule, setUpdateSchedule] = useState(false)
  const [useCelsius, setUseCelsius] = useState(false)

  
  // Define the ScheduleContext values
  const scheduleSettings = {
    scheduleRowsObj: scheduleRows,
    targetBool: updateTarget,
    scheduleBool: updateSchedule,
    useCelsiusBool: useCelsius,
    setScheduleRows,
    setUpdateTarget,
    setUpdateSchedule,
    setUseCelsius,
  }

  // Return/render the main app
  return (
    <ScheduleContext.Provider value={scheduleSettings}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="The Temp Turner" component={HomeScreen} />
          <Stack.Screen name="Camera View" component={CameraScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ScheduleContext.Provider>
  );
}

export default App;