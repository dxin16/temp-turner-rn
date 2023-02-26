import React, { useContext, useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { 
  VStack,
  Center,
  HStack,
  Text,
  Button,
} from "native-base";
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';

function TargetBlock() {
  // Grab the ScheduleContext to access shared state variables
  const appStates = useContext(ScheduleContext)

  // Set the target and timer displays
  const [timerCount, setTimer] = useState(0)
  const [targetTemp, setTargetTemp] = useState("---")
  const [isRunning, setIsRunning] = useState(false)

  // Temporary testing variable to control http request
  const [reqTries, setReqTries] = useState(0)

  // Send data from ESP32 (http post -> ESP32 webpage @ its ip)
  // useEffect(() => {
  //   fetch('http://localhost:12345', { // 172.20.10.14/target
  //     method: 'POST',
  //     headers: {
  //       Accept: 'text/html',
  //       'Content-Type': 'text/html',
  //     },
  //     body: JSON.stringify({
  //       targetTemperature: targetTemp,
  //     }),
  //   })
  //   .catch(error => {
  //     console.error(error)
  //   })
  // }, [reqTries])

  // Cause changes based on ScheduleContext
  useEffect(() => {
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
        setTargetTemp(appStates.scheduleRowsObj[0].temp)
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

      // // Shift should remove the first index of the scheduleRows array
      // // TODO: This doesn't update for the scheduling block yet for some reason
      // appStates.scheduleRowsObj.shift()
      // appStates.setScheduleRows(appStates.scheduleRowsObj)

      // if (appStates.scheduleRowsObj.length > 1) {
      //   setTimer(appStates.scheduleRowsObj[0].intTime)
      //   setTargetTemp(appStates.scheduleRowsObj[0].temp)
      // }
      // else {
      //   setKeepRunning(false)
      //   setTargetTemp("---")
      // }
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
    <Center w="95%" h="25%" bg="light.200" rounded="md" shadow={3}>
    <VStack bg="light.300">

      {/* Section Title */}
      <Text p="6px" h="30%" fontSize={24}>Current Setting</Text>

      {/* Button to send a post request */}
      {/* <Center>
        <Button p="0.5" w="50%" onPress={() => setReqTries(reqTries + 1)}>Try Send</Button>
      </Center> */}

      {/* Value Labels */}
      <HStack w="100%" h="35%">
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
      <HStack w="100%" h="35%" pb="25px">
        <Center w="50%">
          <Text fontSize={28} color="orange.500">{targetTemp}</Text>
        </Center>
        <Center w="50%">
          <TimeDisplay />
        </Center>
      </HStack>

    </VStack>
  </Center>
  )
}

export default TargetBlock;