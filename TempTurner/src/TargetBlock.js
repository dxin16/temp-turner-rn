import React, { useContext, useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions, Alert } from 'react-native';
import { 
  VStack,
  Center,
  HStack,
  Text,
  Button,
} from "native-base";
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';

function TargetBlock({ navi }) {
  // Grab the ScheduleContext to access shared state variables
  const appStates = useContext(ScheduleContext)
  const tempUnitSuffix = appStates.useCelsiusBool ? " °C" : " °F"

  // Set the target and timer displays
  const [timerCount, setTimer] = useState(0)
  const [targetTemp, setTargetTemp] = useState("---")
  const [targetInt, setTargetInt] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // Temporary testing variable to control http request
  const [reqTries, setReqTries] = useState(0)
  const [issueColor, setIssueColor] = useState("light.300")

  // Send data to ESP32 (http POST -> ESP32 web server @ its ip)
  useEffect(() => {
    var hasErr = false

    fetch('http://172.20.10.14/target', {
      method: 'POST',
      headers: {
      },
      body: `temp=${targetInt}`
    })
    .catch(error => {
      console.error(error)
      setIssueColor("red.600")
      hasErr = true
    })
    .finally(() => {
      if (!hasErr) {setIssueColor("light.300")}
    })
  }, [reqTries])

  // Cause changes based on ScheduleContext
  useEffect(() => {    
    if (appStates.smokeWarnBool === true) {
      appStates.setSmokeWarn(false)
      Alert.alert(
        "High Smoke Level Detected", 
        `Please quickly attend to your stove. Target Temperature will be set to OFF.
        \nPress OK when you have lowered the smoke level. This alert will continue to display until "High" is not detected.`,
        [{text: 'OK', onPress: () => appStates.setSmokeWarn(true)}]
        )
    }
    
    // When the Start Schedule button is pressed, this will change to true
    if (appStates.targetBool) {
      appStates.setUpdateTarget(false)
      setIsRunning(true)

      // If there's only one row, it should be the disabled one with the plus button
      // So, only try to retrieve the row if there is more than one row.
      if (appStates.scheduleRowsObj.length > 1) {
        currentRows = appStates.scheduleRowsObj
        currentRows[0].color = "active"
        appStates.setScheduleRows(currentRows)

        if (appStates.smokeWarnBool === true) {
          setTargetTemp("OFF")
          setTargetInt(0)
        }
        else {
          setTargetTemp(appStates.scheduleRowsObj[0].temp)
          setTargetInt(parseInt(appStates.scheduleRowsObj[0].temp.split(' ')[0]))
        }
        setTimer(appStates.scheduleRowsObj[0].intTime)
      }
      else {
        setIsRunning(false)
        setTargetTemp("---")
      }
    }

    // Update display when timer hits 0 (-1 just so the value 00:00:00 actually shows up)
    if (isRunning && timerCount === -1) {
      setTimer(0)
      appStates.setUpdateSchedule(true)
    }

    // Setup the basic timer
    let interval = setInterval(() => {
      setTimer(lastTimerCount => {
          lastTimerCount <= 1 && clearInterval(interval)
          return lastTimerCount > -1 ? lastTimerCount - 1 : 0
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerCount, appStates.targetBool]);

  // Function to manage time display to look correct for hh:mm:ss format
  function TimeDisplay() {
    var hrs = Math.floor(timerCount / 3600)
    var mins = Math.floor((timerCount % 3600) / 60)
    var secs = timerCount % 3600 % 60

    var hrsDisp = 
      (hrs <= 0) ? "00" : 
      (hrs < 10) ? "0" + hrs.toString() : hrs.toString()

    var minsDisp = 
      (mins <= 0) ? "00" : 
      (mins < 10) ? "0" + mins.toString() : mins.toString()
  
    var secsDisp = 
      (secs <= 0) ? "00" : 
      (secs < 10) ? "0" + secs.toString() : secs.toString()

    return(
      <Text fontSize={28}>{hrsDisp + ":" + minsDisp + ":" + secsDisp}</Text>
    )
  }

  return(
    <Center w="95%" h="25%" bg="light.300" rounded="md" shadow={3}>
    <VStack>

      {/* Section Title & Settings Button */}
      <HStack p="6px" h="30%" justifyContent="space-between">
          <Text w="50%" fontSize={24}>Current Setting</Text>
          <Button w="40%" h="70%" p="3px" variant="ghost" colorScheme="yellow" bg="yellow.200"
            onPress={() => navi.navigate("Settings")}
          >
            <Text fontSize={16} color="yellow.600">Display Settings</Text>
          </Button>
        </HStack>

      {/* Button to send a POST request */}
      {/* <Center>
        <Button p="0.5" w="50%" onPress={() => setReqTries(reqTries + 1)}>Try Send</Button>
      </Center> */}

      {/* Value Labels */}
      <HStack w="100%" h="33%">
        <Center w="50%">
          <Text fontSize={20}>Target</Text>
          <Text fontSize={20}>Temperature</Text>
        </Center>
        <Center w="50%">
          <Text fontSize={20}>Time</Text>
          <Text fontSize={20}>Left</Text>
        </Center>
      </HStack>

      {/* Actual Values */}
      <HStack w="100%" h="33%" pb="25px">
        <Center w="50%">
          <Text fontSize={28} color="orange.500">{targetTemp}</Text>
        </Center>
        <Center w="50%">
          <TimeDisplay />
        </Center>
      </HStack>

      <Text h="10%" pt="0" ml="5px" mt="-10px" color={issueColor}>Target Temperature is not being sent!</Text>

    </VStack>
  </Center>
  )
}

export default TargetBlock;