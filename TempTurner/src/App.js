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
  Center,
  Box,
} from "native-base";
import Icon from 'react-native-vector-icons/AntDesign';
import CurrentBlock from './CurrentBlock';
import TargetBlock from './TargetBlock';
import ScheduleBlock from './ScheduleBlock';
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';
import { WebView } from 'react-native-webview';
import LinearGradient from 'react-native-linear-gradient';
import SplashScreen from 'react-native-splash-screen';

// Main screen
// Use Native Base for UI - sectioning off parts of app
// Primary UI structure is VStacks and HStacks with various blocks contained in the stacks
function HomeScreen({ navigation }) {
  useEffect(() => {
    SplashScreen.hide()
  }, [])
  
  return (
    <NativeBaseProvider>
      <VStack pt="3" h="100%" space={4} alignItems="center">

        {/* Main three blocks; defined in their own .js files */}
        {/* Pass navigation variable so that they can move to other screens */}
        <CurrentBlock navi={navigation}/>
        <TargetBlock navi={navigation}/>
        <ScheduleBlock />

      </VStack>
    </NativeBaseProvider>
  );
}

// Placeholder screen to contain camera view
// Put the address where the camera is being streamed in uri
function CameraScreen() {
  return (
    <NativeBaseProvider>
      <WebView source={{ uri: "https://google.com" }} />
    </NativeBaseProvider>
  );
}

// Screen to hold some display settings
// Currently only has the Fahrenheit/Celsius toggle
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
      
      {/* Mockups for visual indicators */}
      <Center w="100%" h="50%" pt="2" bg="light.300">
        <HStack h="100%">

          <Center w="33%">
            
            {/* <Box w="9%" h="4%" bg="white" borderTopRadius={5} borderWidth={1} borderBottomWidth={0}><Text ml="-1px" fontSize={16}>-</Text></Box>
            <Box w="9%" h="4%" bg="#F36B45" borderLeftWidth={1} borderRightWidth={1}><Text ml="-1px" fontSize={16}>-</Text></Box>
            <Box w="9%" h="4%" bg="#F57F46" borderLeftWidth={1} borderRightWidth={1}><Text ml="-1px" fontSize={16}>-</Text></Box>
            <Box w="9%" h="4%" bg="#F8A647" borderLeftWidth={1} borderRightWidth={1}><Text ml="-1px" fontSize={16}>-</Text></Box>
            <Box w="9%" h="4%" bg="#FCCD47" borderLeftWidth={1} borderRightWidth={1}></Box> */}
            
            <LinearGradient paddingBottom={10} paddingRight={3}
              colors={['#F36B45', '#F8A647', '#FDE047']} 
              borderWidth={1} borderRadius={10} >
                <Text fontSize={12}>{`-\n-\n-\n-`}</Text>
              </LinearGradient>
            
            <Center w="16.8%" h="5.6%" mt="-2" bg="yellow.300" borderRadius={20} borderWidth={1.4} borderTopWidth={0} />
          </Center>
          <Center w="33%">
            <Icon marginBottom={-15} marginLeft={20} name="cloud" size={50} color="#78716c" />
            <Icon marginBottom={-10} marginLeft={12} name="cloud" size={40} color="#a8a29e" />
            <Icon name="cloud" size={30} color="#f5f5f4" />
          </Center>
          <Center w="33%">
            
            {/* <Box w="9%" h="8%" bg="white" borderTopRadius={2} borderWidth={1} borderBottomWidth={0}/>
            <Box w="9%" h="1.2%" bg="#00D4FF" borderLeftWidth={1} borderRightWidth={1} />
            <Box w="9%" h="2.4%" bg="#17C8FF" borderLeftWidth={1} borderRightWidth={1} />
            <Box w="9%" h="3.6%" bg="#1AB5FF" borderLeftWidth={1} borderRightWidth={1} />
            <Box w="9%" h="4.8%" bg="#1DA1FF" borderLeftWidth={1} borderRightWidth={1} />
            <Box w="9%" h="6%" bg="#1A91FF" borderBottomRadius={2} borderWidth={1} borderTopWidth={0} /> */}

            <Center>
              <Box bg="white" py={`${10}px`} px="5px" />
              <LinearGradient paddingVertical={40} paddingHorizontal={5}
                colors={['#00D4FF', '#1AB5FF', '#1A91FF']} />
            </Center>

            

          </Center>

        </HStack>
      </Center>
    </NativeBaseProvider>
  )
}

// Main App structure that is returned
const Stack = createNativeStackNavigator();
function App() {

  // Create necessary states for the ScheduleContext
  const [scheduleRows, setScheduleRows] = useState([
    {
      num: 1,
      temp: "--- °F",
      time: "--:--:--",
      intTime: 0,
      color: "waiting",
      index: 1
    },
    {
      num: "+",
      temp: "--- °F",
      time: "--:--:--",
      intTime: 0,
      color: "disabled",
      index: 2
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