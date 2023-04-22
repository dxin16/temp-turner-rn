import React, { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/AntDesign';
import { 
  VStack,
  Center,
  HStack,
  Text,
  Button,
  Box,
} from "native-base";
import ScheduleContext from './ScheduleContext';
import { styles, dims } from './Styles';


function CurrentBlock({ navi }) {
  const appStates = useContext(ScheduleContext)
  
  // State variables to contain data
  // reqTries was a temporary way to test http requests
  const [reqTries, setReqTries] = useState(0)
  const [constantTimer, setConstantTimer] = useState(0)
  const [issueColor, setIssueColor] = useState("light.300")

  const [currentTemp, setCurrentTemp] = useState("---")
  const [smokeLevel, setSmokeLevel] = useState("---")
  const [smokeLevelInt, setSmokeLevelInt] = useState(0)
  
  const [fillLevel, setFillLevel] = useState(1)
  const [emptyLevel, setEmptyLevel] = useState(1)

  const [autoTemp, setAutoTemp] = useState(0)

  // Receive data from ESP32 (http get -> ESP32 webpage @ its ip)
  useEffect(() => {
    // Checking for successful http request
    var hasErr = false

    // Hard code some values
    // if (autoTemp > 260) { setAutoTemp(0) } 
    // else {setAutoTemp(autoTemp + 10)}
    // SetCurrentValues(`Current Temperature: ${autoTemp} Current Smoke Level: 0.50`)

    fetch(appStates.serverURIstring)
      .then(response => response.text())
      .then(text => SetCurrentValues(text))
    .catch(error => {
      //console.error(error)
      setIssueColor("red.600")
      hasErr = true
    })
    .finally(() => {
      if (!hasErr) {setIssueColor("light.300")}
    })
  }, [constantTimer])

  // Extra timer, used to limit htpp request rate
  useEffect(() => {
    let interval = setInterval(() => {
      setConstantTimer(lastTimerCount => {
        lastTimerCount <= 1 && clearInterval(interval)
        return (lastTimerCount + 1) % 10
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [constantTimer])

  // Whenever tolerance enable is toggled, reset the within boolean
  useEffect(() => {
    appStates.setTolWithin(true)
  }, [appStates.toleranceEn])
  
  // Parse values that are received via GET
  function SetCurrentValues(text) {
    // The retrieved temp is always in celsius.
    const tempFromText = text.match(/Current Temperature: ([0-9.-])*/g)[0].split(' ').pop()
    const tempFah = Math.round((parseInt(tempFromText) * 9/5) + 32)
    const smokeFromText = text.match(/Current Smoke Level: ([0-9.])*/g)[0].split(' ').pop()

    const tempValString = appStates.useCelsiusBool ? tempFromText : tempFah.toString()
    const tempUnitSuffix = appStates.useCelsiusBool ?   " °C"     :       " °F"
    setCurrentTemp(tempValString + tempUnitSuffix)

    if (appStates.toleranceEn) {
      const targetTemp = appStates.scheduleRowsObj[0].temp
      const targetTempInt = parseInt(targetTemp.split(' ')[0])
      const curTargetTemp = isNaN(targetTempInt) ? 0 : targetTempInt
      const tempDiff = Math.abs(parseInt(tempValString) - curTargetTemp)
  
      if (curTargetTemp > 0) {
        const percentDiff = Math.floor(tempDiff / curTargetTemp * 100)
        const isInTol = percentDiff <= appStates.toleranceNum
        // console.log("Percentage: " + percentDiff + "%")
        // console.log("Tolerance: " + appStates.toleranceNum + "%")
        // console.log("isWithin: " + isInTol ? "true" : "false")
        appStates.setTolWithin(isInTol)
      }
    }

    const smokeValue = parseFloat(smokeFromText)
    const smokeQuality    = smokeValue < 1 ? "Low" : smokeValue < 3 ? "Medium" : "High"
    const smokeQualityInt = smokeValue < 1 ?   1   : smokeValue < 3 ?     2    :    3
    // Disabled for now, not implemented in sensor system yet (won't be due to testing restrictions).
    // if (smokeQuality === "High") { appStates.setSmokeWarn(true) }
    //   else { appStates.setSmokeWarn(false) }
    setSmokeLevel(smokeQuality)

    // Set values for thermometer indicator
    setSmokeLevelInt(smokeQualityInt)
    const maxTemp = appStates.useCelsiusBool ? 260 : 500
    const curTemp = parseInt(tempValString)
    const fillVal = curTemp / maxTemp
    const fillNorm = fillVal > 1 ? 1 : fillVal < 0 ? 0 : fillVal 
    const fillLv1 = 1 - fillNorm
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
          <Text w="60%" fontSize={24 * dims.ar}>Current Status</Text>
          <Button w="40%" h="70%" p="3px" variant="ghost" colorScheme="blue" bg="darkBlue.100"
            onPress={() => navi.navigate("Camera View")}
          >
            <Text fontSize={16 * dims.ar} color="blue.600">View Camera</Text>
          </Button>
        </HStack>

        {/* Labels, Values, and Visual Indicators */}
        <HStack w="100%" h="66%">

          {/* Current Temp */}
          <VStack w="50%" h="100%" ml="-15px">
            <Center h="50%">
              <Text fontSize={20 * dims.ar}>Current</Text>
              <Text fontSize={20 * dims.ar}>Temperature</Text>
              </Center>
            <Center h="50%" pb="25px">
              <Text fontSize={28 * dims.ar} color="orange.500">{currentTemp}</Text>
            </Center>
          </VStack>

          {/* Thermometer */}
          {/* 
            LinearGradient: for the colors and locations arrays, left to right corresponds to top to bottom.

            For n colors (excluding white/empty color), where x = n-1, and y = 0 to start,
            the base full bar values (evenly distributed gradient) should be y, 0/x, 1/x, 2/x ... x/x.

            You want to algorithmically change y based on how empty you want the bar to be.
            There should not be any value lower than y i.e. if y > 1/x, then set locations[indexof(1/x)] = y.

            emptyLevel corresponds to y, fillLevel is 1/2 at start and becomes equal to emptyLevel when emptyLevel > 1/2
          */}
          <Center w="5%" h="80%" ml="-20px">
            <LinearGradient paddingBottom={18} paddingRight={2}
              colors={['#FFFFFF', '#F36B45', '#F8A647', '#FDE047']}
              locations={[emptyLevel, emptyLevel, fillLevel, 1]}
              borderWidth={1} borderRadius={10}>
                <Text fontSize={11 * dims.ar}>{`-\n-\n-\n-`}</Text>
            </LinearGradient>
            <Center w="100%" h="20%" mt="-2" bg="yellow.300" borderRadius={20} borderWidth={1.4} borderTopWidth={0} />
          </Center>
          
          {/* Smoke Level */}
          <VStack w="40%" h="100%" ml="15px">
            <Center h="50%">
              <Text fontSize={20 * dims.ar}>Smoke</Text>
              <Text fontSize={20 * dims.ar}>Level</Text>
            </Center>
            <Center h="50%" pb="25px">
              <Text pb="25px" fontSize={28 * dims.ar} 
                color={
                  smokeLevel === "---" ? "black" :
                  smokeLevel === "Low" ? "green.600" :
                  smokeLevel === "Medium" ? "yellow.600" : "red.600"
                }
              >{smokeLevel}</Text>
            </Center>
          </VStack>

          {/* Clouds */}
          {/* "cloud" is filled, "cloudo" is outline */}
          <Center w="15%" h="80%" ml="-15px">
            <Icon marginBottom={-15} marginLeft={-20} size={50} color="#78716c"
              name={smokeLevelInt > 2 ? "cloud" : "cloudo"} />
            <Icon marginBottom={-10} marginLeft={-20} size={40} color="#a8a29e" 
              name={smokeLevelInt > 1 ? "cloud" : "cloudo"} />
            <Icon marginRight={25} size={30} color="#f5f5f4" 
              name={smokeLevelInt > 0 ? "cloud" : "cloudo"} />
          </Center>

        </HStack>

        {/* http error indicator */}
        <Text h="10%" pt="0" ml="5px" mt="-10px" color={issueColor}>Current Status is not being received!</Text>

      </VStack>
    </Center>
  )
}

export default CurrentBlock;