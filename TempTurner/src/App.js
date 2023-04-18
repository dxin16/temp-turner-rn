import React, { useContext, useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import { 
  NativeBaseProvider,
  VStack,
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
// Put the address where the camera is being streamed in uri
function CameraScreen() {
  const appStates = useContext(ScheduleContext)
  return (
    <NativeBaseProvider>
      <WebView source={{ uri: appStates.cameraURIstring }} />
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