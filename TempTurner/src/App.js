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
import ScheduleContext from './ScheduleContext';


// Main screen
// Use Native Base for UI - sectioning off parts of app
// Primary UI structure is VStacks and HStacks with various blocks contained in the stacks
function HomeScreen({ navigation }) {
  return (
    <NativeBaseProvider>
      <VStack pt="3" h="100%" space={4} alignItems="center">

        {/* Main three blocks; defined in their own .js files */}
        <CurrentBlock navi={navigation}/>
        <TargetBlock />
        <ScheduleBlock />

      </VStack>
    </NativeBaseProvider>
  );
}

// Example second screen for navigation
function CameraScreen() {
  return (
    <NativeBaseProvider>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Camera Screen</Text>
      </View>
    </NativeBaseProvider>
  );
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

  
  // Define the ScheduleContext values
  const scheduleSettings = {
    scheduleRowsObj: scheduleRows,
    targetBool: updateTarget,
    scheduleBool: updateSchedule,
    setScheduleRows,
    setUpdateTarget,
    setUpdateSchedule,
  }

  // Return/render the main app
  return (
    <ScheduleContext.Provider value={scheduleSettings}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="The Temp Turner" component={HomeScreen} />
          <Stack.Screen name="Camera View" component={CameraScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ScheduleContext.Provider>
  );
}

export default App;