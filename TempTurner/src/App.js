import React, { useContext, useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import { 
  NativeBaseProvider,
  VStack,
  Popover,
  Pressable,
  Center,
  Text,
  HStack,
} from "native-base";
import CurrentBlock from './CurrentBlock';
import TargetBlock from './TargetBlock';
import ScheduleBlock from './ScheduleBlock';
import ScheduleContext from './ScheduleContext';
import SettingsScreen from './SettingsScreen';
import { styles, dims } from './Styles';


// Main screen
// Primary UI organization uses VStack/HStack (Vertical/Horizontal)
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
function CameraScreen() {
  const appStates = useContext(ScheduleContext)
  var landscapeWidth
  var landscapeHeight

  // These values in dims may not update when turning to landscape since they
  // are defined when the app starts, which happens in portrait mode.
  if (dims.h > dims.w) {
    landscapeWidth = dims.h
    landscapeHeight = dims.w
  }
  else {
    landscapeWidth = dims.w
    landscapeHeight = dims.h
  }

  return (
    <NativeBaseProvider>
      {/* appStates.cameraURIstring */}
      <HStack h="100%">
        <WebView source={{ uri: appStates.cameraURIstring }} />

        {/* Help/Guide for using the camera */}
        <Popover defaultIsOpen={false} placement="left top" trigger={triggerProps => {
          return (
            <Pressable h="100%" w="100%" borderBottomColor="gray.500" borderBottomWidth="1" {...triggerProps}>
              {({ isPressed }) => {
                return (
                  <Center w="100%" h="100%" p="1" px="3" bg="light.400" justifyContent="flex-start">
                    <Text fontSize={16 * dims.ar}>?</Text>
                  </Center>
              )}}
            </Pressable>
          )}}>
            <Popover.Content accessibilityLabel="Camera Info" w="56">
              <Popover.Arrow bg="gray.100" />
              <Popover.CloseButton />
              <Popover.Header>Camera Info</Popover.Header>
              <Popover.Body p="2" bg="gray.100">
                <VStack>
                  <Text>Basic View: Scroll down to the bottom of the settings on the left side and hit "Start Stream".</Text>
                  <Text>The stream itself is stuck to the top of the scrollable area.</Text>
                  <Text></Text>
                  <Text>Scaling: Set Output Size in Advanced Settings {">"} Window. Current device dimensions:</Text>
                  <Text>Width: {landscapeWidth}, Height: {landscapeHeight}</Text>
                </VStack>
              </Popover.Body>
            </Popover.Content>
          </Popover>
      </HStack>
    </NativeBaseProvider>
  );
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
  const [smokeWarn, setSmokeWarn] = useState(false)
  const [tolValue, setTolValue] = useState(50)
  const [tolEnable, setTolEnable] = useState(false)
  const [tolWithin, setTolWithin] = useState(true)
  const [serverURI, setServerURI] = useState("http://172.20.10.14")
  const [cameraURI, setCameraURI] = useState("http://172.20.10.2")
  
  // Define the ScheduleContext values
  const scheduleSettings = {
    scheduleRowsObj: scheduleRows, setScheduleRows,
    targetBool: updateTarget, setUpdateTarget,
    scheduleBool: updateSchedule, setUpdateSchedule,
    useCelsiusBool: useCelsius, setUseCelsius,
    smokeWarnBool: smokeWarn, setSmokeWarn,
    toleranceNum: tolValue, setTolValue,
    toleranceEn: tolEnable, setTolEnable,
    toleranceWith: tolWithin, setTolWithin,
    serverURIstring: serverURI, setServerURI,
    cameraURIstring: cameraURI, setCameraURI,
  }

  // Return/render the main app
  return (
    <ScheduleContext.Provider value={scheduleSettings}>
      <StatusBar
        animated={true}
        backgroundColor="white"
        barStyle={"dark-content"}
        showHideTransition={"none"}
        hidden={false}
      />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen options={{ orientation: 'portrait' }} name="Temp Turner" component={HomeScreen} />
          <Stack.Screen options={{ orientation: 'landscape' }} name="Camera View" component={CameraScreen} />
          <Stack.Screen options={{ orientation: 'portrait' }} name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ScheduleContext.Provider>
  );
}

export default App;