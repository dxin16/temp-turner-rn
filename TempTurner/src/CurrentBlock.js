import React, { useContext, useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { 
  VStack,
  Center,
  HStack,
  Text,
  Button,
  Box,
} from "native-base";
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/AntDesign';

function CurrentBlock({ navi }) {
  const appStates = useContext(ScheduleContext)
  
  // State variables to contain wifi-related info
  // reqTries is a temporary way to control and test the sending of http requests
  const [reqTries, setReqTries] = useState(0)
  const [currentTemp, setCurrentTemp] = useState("400 °F")
  const [smokeLevel, setSmokeLevel] = useState("Medium")
  const [smokeLevelInt, setSmokeLevelInt] = useState(2)
  const [issueColor, setIssueColor] = useState("light.300")
  const [fillLevel, setFillLevel] = useState(0.5)
  const [emptyLevel, setEmptyLevel] = useState(0.2)

  // Receive data from ESP32 (http get -> ESP32 webpage @ its ip)
  useEffect(() => {
    // Testing purposes
    // appStates.setSmokeWarn(true)
    var hasErr = false

    fetch('http://172.20.10.14')
      .then(response => response.text())
      .then(text => SetCurrentValues(text))
    .catch(error => {
      console.error(error)
      setIssueColor("red.600")
      hasErr = true
    })
    .finally(() => {
      if (!hasErr) {setIssueColor("light.300")}
    })
  }, [reqTries])
  
  // Parse values that are received via GET
  function SetCurrentValues(text) {
    const tempFromText = text.match(/Current Temperature: ([0-9.])*/g)[0].split(' ').pop()
    const smokeFromText = text.match(/Current Smoke Level: ([0-9.])*/g)[0].split(' ').pop()
    const tempUnitSuffix = appStates.useCelsiusBool ? " °C" : " °F"
    setCurrentTemp(tempFromText + tempUnitSuffix)

    const smokeValue = parseFloat(smokeFromText)
    const smokeQuality =    smokeValue < 1 ? "Low" : smokeValue < 3 ? "Medium" : "High"
    const smokeQualityInt = smokeValue < 1 ?   1   : smokeValue < 3 ?     2    :    3
    if (smokeQuality === "High") { appStates.setSmokeWarn(true) }
      else { appStates.setSmokeWarn(false) }
    setSmokeLevel(smokeQuality)

    // Set values for visual indicators
    setSmokeLevelInt(smokeQualityInt)
    const maxTemp = appStates.useCelsiusBool ? 260 : 500
    const curTemp = parseInt(tempFromText)
    const fillVal = curTemp / maxTemp
    const fillLv1 = 1 - fillVal
    const fillLv2 = fillLv1 < 0.5 ? 0.5 : fillLv1
    setEmptyLevel(fillLv1)
    setFillLevel(fillLv2)
  }

  // Render structures needed for the Current Block
  return(
    <Center w="95%" h="25%" bg="light.300" rounded="md" shadow={3}>
      <VStack>

        {/* Section Title & Camera Button */}
        <HStack p="6px" h="30%" justifyContent="space-between">
          <Text w="60%" fontSize={24}>Current Status</Text>
          <Button w="40%" h="70%" p="3px" variant="ghost" colorScheme="blue" bg="darkBlue.100"
            onPress={() => navi.navigate("Camera View")}
          >
            <Text fontSize={16} color="blue.600">View Camera</Text>
          </Button>
        </HStack>
        

        {/* Button to send a GET request */}
        {/* <Center>
          <Button p="0.5" w="50%" onPress={() => setReqTries(reqTries + 1)}>Try Request</Button>
        </Center> */}

        <HStack w="100%" h="66%">

          <VStack w="50%" h="100%" ml="-15px">
            {/* Value Labels */}
            <Center h="50%">
              <Text fontSize={20}>Current</Text>
              <Text fontSize={20}>Temperature</Text>
              </Center>
            <Center h="50%" pb="25px">
              <Text fontSize={28} color="orange.500">{currentTemp}</Text>
            </Center>
          </VStack>

          <Center w="5%" h="80%" ml="-20px">
            <LinearGradient paddingBottom={18} paddingRight={2}
              colors={['#FFFFFF', '#F36B45', '#F8A647', '#FDE047']}
              locations={[emptyLevel, emptyLevel, fillLevel, 1]}
              borderWidth={1} borderRadius={10}>
                <Text fontSize={11}>{`-\n-\n-\n-`}</Text>
            </LinearGradient>
            <Center w="100%" h="20%" mt="-2" bg="yellow.300" borderRadius={20} borderWidth={1.4} borderTopWidth={0} />
          </Center>

          <VStack w="40%" h="100%" ml="15px">
            {/* Actual Values */}
            <Center h="50%">
              <Text fontSize={20}>Smoke</Text>
              <Text fontSize={20}>Level</Text>
            </Center>
            <Center h="50%" pb="25px">
              <Text pb="25px" fontSize={28} 
                color={
                  smokeLevel === "Low" ? "green.600" :
                  smokeLevel === "Medium" ? "yellow.600" : "red.600"
                }
              >{smokeLevel}</Text>
            </Center>
          </VStack>

          <Center w="15%" h="80%" ml="-15px">
            <Icon marginBottom={-15} marginLeft={-20} size={50} color="#78716c"
              name={smokeLevelInt > 2 ? "cloud" :"cloudo"} />
            <Icon marginBottom={-10} marginLeft={-20} size={40} color="#a8a29e" 
              name={smokeLevelInt > 1 ? "cloud" :"cloudo"} />
            <Icon marginRight={25} size={30} color="#f5f5f4" 
              name={smokeLevelInt > 0 ? "cloud" :"cloudo"} />
          </Center>

        </HStack>

        <Text h="10%" pt="0" ml="5px" mt="-10px" color={issueColor}>Current Status is not being received!</Text>

      </VStack>
    </Center>
  )
}

export default CurrentBlock;