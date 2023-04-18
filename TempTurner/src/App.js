import React, { useContext, useEffect, useState } from 'react';
import { Alert, Keyboard, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import { 
  NativeBaseProvider,
  VStack,
  Text,
  HStack,
  Switch,
  Tooltip,
  Button,
  Input,
  Box,
  Center,
  Modal,
  FormControl,
  Radio,
} from "native-base";
import CurrentBlock from './CurrentBlock';
import TargetBlock from './TargetBlock';
import ScheduleBlock from './ScheduleBlock';
import ScheduleContext from './ScheduleContext';
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

// Screen to hold some display settings
// Currently only has the Fahrenheit/Celsius toggle
// todo: Set "warmup" period, like an oven or something
// todo: Settable camera and http uris
// todo: limit http request rate
function SettingsScreen() {
  const appStates = useContext(ScheduleContext)
  const [showWarmupTip, setShowWarmupTip] = useState(false)
  const [showServerTip, setShowServerTip] = useState(false)
  const [showCameraTip, setShowCameraTip] = useState(false)
  const [serverRadio, setServerRadio] = useState("1")
  const [cameraRadio, setCameraRadio] = useState("1")
  const [showModal, setShowModal] = useState(false)
  const [inTolerance, setInTolerance] = useState(101)

  // Add a field to enable tolerance :)
  return (
    <NativeBaseProvider>

      <HStack h="10%" mt="-3">
        <Center w="100%">
          <HStack>
            <Box m="4" borderWidth={1} w="35%" h="1%" borderColor="light.400"></Box>
            <Text fontSize={20 * dims.ar} w="15%" textAlign="center" color="light.400">Units</Text>
            <Box m="4" borderWidth={1} w="35%" h="1%" borderColor="light.400"></Box>
          </HStack>
        </Center>
      </HStack>

      <HStack p="5" mt="-5" w="100%" h="10%">
        <Text fontSize={20 * dims.ar} w="70%">Temperature Units</Text>
        <Text fontSize={20 * dims.ar}>°F</Text>
        <Switch size="sm" offTrackColor="blue.200" onTrackColor="blue.200" isChecked={appStates.useCelsiusBool}
          onToggle={() => appStates.setUseCelsius(!appStates.useCelsiusBool)}
        />
        <Text fontSize={20 * dims.ar}>°C</Text>
      </HStack>

      <HStack mt="-5" h="10%">
        <Center w="100%">
          <HStack>
            <Box m="4" borderWidth={1} w="35%" h="1%" borderColor="light.400"></Box>
            <Text fontSize={20 * dims.ar} w="15%" textAlign="center" color="light.400">URIs</Text>
            <Box m="4" borderWidth={1} w="35%" h="1%" borderColor="light.400"></Box>
          </HStack>
        </Center>
      </HStack>

      <HStack p="5" mt="-7" w="100%" h="15%">
        <VStack w="100%">
          <Tooltip label={`This value will likely change\ndepending on network. Set it to\nwhere the ESP32 puts up the server.`} isOpen={showServerTip} placement="top left">
            <Button onTouchStart={() => setShowServerTip(true)} onTouchEnd={() => setShowServerTip(false)}
            variant="unstyled" p="0" h="50%" w="100%" justifyContent="flex-start">
              <Text fontSize={20 * dims.ar}>ESP32 Web Server URI</Text>
            </Button>
          </Tooltip>

          <HStack space={3}>
            <Radio.Group name="linkType" value={serverRadio} accessibilityLabel="http or https"
            onChange={(newVal) => {setServerRadio(newVal)}} >
              <HStack space={2}>
                <Radio value="1" colorScheme="gray" size="md" my={1}>
                  <Text fontSize={18 * dims.ar}>http://</Text>
                </Radio>
                <Radio value="2" colorScheme="gray" size="md" my={1}>
                  <Text fontSize={18 * dims.ar}>https://</Text>
                </Radio>
              </HStack>
            </Radio.Group>
            <Input p="2" h="80%" w="47%" mr="1" borderColor="black" fontSize={20 * dims.ar} textAlign="center" keyboardType="url"
            placeholder={appStates.serverURIstring.split("/")[2]} 
            onFocus={() => setShowServerTip(true)} onBlur={() => setShowServerTip(false)} 
            onEndEditing={(e) => {
              const uriRoot = serverRadio === "1" ? "http://" : "https://"
              const newURI = e.nativeEvent.text !== "" ? uriRoot + e.nativeEvent.text : appStates.serverURIstring
              appStates.setServerURI(newURI)
            }} />
          </HStack>

        </VStack>
      </HStack>

      <HStack p="5" mt="-3" w="100%" h="15%">
        <VStack w="100%">
          <Tooltip label={`This value will likely change\ndepending on network. Set it to\nwhere the ESP32 puts up the camera.`} isOpen={showCameraTip} placement="top left">
            <Button onTouchStart={() => setShowCameraTip(true)} onTouchEnd={() => setShowCameraTip(false)}
            variant="unstyled" p="0" h="50%" w="100%" justifyContent="flex-start">
              <Text fontSize={20 * dims.ar}>ESP32 Camera Display URI</Text>
            </Button>
          </Tooltip>
          <HStack space={3}>
            <Radio.Group name="linkType" value={cameraRadio} accessibilityLabel="http or https"
            onChange={(newVal) => {setCameraRadio(newVal)}} >
              <HStack space={2}>
                <Radio value="1" colorScheme="gray" size="md" my={1}>
                  <Text fontSize={18 * dims.ar}>http://</Text>
                </Radio>
                <Radio value="2" colorScheme="gray" size="md" my={1}>
                  <Text fontSize={18 * dims.ar}>https://</Text>
                </Radio>
              </HStack>
            </Radio.Group>
            <Input p="2" h="80%" w="47%" mr="1" borderColor="black" fontSize={20 * dims.ar} textAlign="center" keyboardType="url"
            placeholder={appStates.cameraURIstring.split("/")[2]} 
            onFocus={() => setShowCameraTip(true)} onBlur={() => setShowCameraTip(false)} 
            onEndEditing={(e) => {
              const uriRoot = cameraRadio === "1" ? "http://" : "https://"
              const newURI = e.nativeEvent.text !== "" ? uriRoot + e.nativeEvent.text : appStates.cameraURIstring
              appStates.setCameraURI(newURI)
            }} />
          </HStack>
        </VStack>
      </HStack>

      <HStack mt="-3" h="10%">
        <Center w="100%">
          <HStack>
            <Box m="4" borderWidth={1} w="30%" h="1%" borderColor="light.400"></Box>
            <Text fontSize={20 * dims.ar} w="25%" textAlign="center" color="light.400">Tolerance</Text>
            <Box m="4" borderWidth={1} w="30%" h="1%" borderColor="light.400"></Box>
          </HStack>
        </Center>
      </HStack>

      <HStack p="5" mt="-5" w="100%" h="10%">
        <Text fontSize={20 * dims.ar} w="67%">Enable Tolerance</Text>
        <Text fontSize={20 * dims.ar}>Off</Text>
        <Switch size="sm" offTrackColor="blue.200" onTrackColor="blue.200" isChecked={appStates.toleranceEn}
          onToggle={() => appStates.setTolEnable(!appStates.toleranceEn)}
        />
        <Text fontSize={20 * dims.ar}>On</Text>
      </HStack>

      {/* You might need to avoid sending target temp while not in the threshold */}
      {/* for the process of turning off stove to get accurate measurement */}
      {/* Gotta avoid the keyboard again... */}
      <HStack p="5" mt="-5" w="100%" h="15%">

        <Tooltip label={`The timer won't tick down unless\nCurrent Temp is within the set %\nof Target Temp.`} 
          isOpen={showWarmupTip} placement="top left">
          <Button onTouchStart={() => setShowWarmupTip(true)} onTouchEnd={() => setShowWarmupTip(false)}
          variant="unstyled" p="0" h="50%" w="70%" justifyContent="flex-start">
            <Text fontSize={20 * dims.ar}>Tolerance Value</Text>
          </Button>
        </Tooltip>

        <Center h="45%" w="20%" mr="1" borderWidth={1} borderRadius={5}>
          <Button p="1" mt="-1" variant="unstyled" alignSelf="auto" 
            onPress={() => {
              setShowModal(true)
            }}>
            <Text fontSize={20 * dims.ar} color="light.400">{appStates.toleranceNum}</Text>
          </Button>
        </Center>
        <Text fontSize={20 * dims.ar}>%</Text>

      </HStack>

      {/* Modal for inputting temp...keyboardavoidingview wouldn't work */}
      <Modal isOpen={showModal} avoidKeyboard={true} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Set Tolerance Value</Modal.Header>

          {/* The body holds the input labels and input areas */}
          {/* Placeholder to show the currently saved time; value to dynamically update with input */}
          <Modal.Body>
            <FormControl w="100%">
              <FormControl.Label>Tolerance (%)</FormControl.Label>
              <Input p="1" fontSize={18 * dims.ar} textAlign="center" keyboardType="number-pad"
                placeholder={
                  appStates.toleranceNum.toString()
                }
                value={
                  inTolerance === 101 ? null : inTolerance.toString()
                }
                onChangeText={(text) => {
                  if (parseInt(text) >= 0 && parseInt(text) <= 100 && parseInt(text, 10) !== NaN) {
                    setInTolerance(parseInt(text))
                  }
                  if (text === "") {
                    setInTolerance(101)
                  }
                }}
              />
              <FormControl.Label>{`[0 - 100]\n\nDescription: The timer won't tick down unless Current Temp is within the set % of Target Temp.
                                   \nex. Target = 300°, Tolerance = 10%\nCurrent must be within 270° to 330°`}</FormControl.Label>
            </FormControl>
          </Modal.Body>

          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                Keyboard.dismiss()
                setShowModal(false)
                setInTolerance(101)
              }}>
                Cancel
              </Button>
              <Button onPress={() => {
                if (inTolerance < 10) {
                  Alert.alert(
                    "Low Tolerance", 
                    "It may be difficult to maintain a temperature in your chosen tolerance. Are you sure this is the value you want?",
                    [
                      {text: 'Cancel', onPress: () => {setInTolerance(101)}, style: "cancel"},
                      {text: 'OK', onPress: () => {
                        Keyboard.dismiss()
                        setShowModal(false)
                        appStates.setTolValue(inTolerance)
                        setInTolerance(101)
                      }}
                    ]
                  )
                }
                else {
                  Keyboard.dismiss()
                  setShowModal(false)
                  appStates.setTolValue(inTolerance === 101 ? appStates.toleranceNum : inTolerance)
                  setInTolerance(101)
                }
              }}>
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

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