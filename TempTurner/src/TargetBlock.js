import React, { useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { 
  VStack,
  Center,
  HStack,
  Text,
  Button,
} from "native-base";
import { styles, dims } from './Styles';

function TargetBlock() {
  const [timerCount, setTimer] = useState(10)

  // Receive data from ESP32 (http get -> ESP32 webpage @ its ip)
  // useEffect(() => {
  //   fetch('10.44.47.202/26/on', {
  //     method: 'POST',
  //     headers: {
  //       Accept: 'text/html',
  //       'Content-Type': 'text/html',
  //     },
  //     body: JSON.stringify({
  //       output26State: 'on',
  //     }),
  //   })
  //   //   .then(response => response.json())
  //   //   .then(json => {
  //   //     setLightStatus(json.output26State)
  //   // })
  //   // .catch(error => {
  //   //   console.error(error)
  //   // })
  // }, [])

  // Setup basic accurate timer
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer(lastTimerCount => {
          lastTimerCount <= 1 && clearInterval(interval)
          return lastTimerCount > 0 ? lastTimerCount - 1 : 0
      })
    }, 1000) //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval)
  }, [timerCount]);

  // Function to manage time display to look correct for hh:mm:ss format
  function TimeDisplay() {
    var hrs = Math.floor(timerCount / 3600)
    var mins = Math.floor((timerCount % 3600) / 60)
    var secs = timerCount % 3600 % 60

    var hrsDisp = 
      (hrs == 0) ? "00" : 
      (hrs < 10) ? "0" + hrs.toString() : hrs.toString()

    var minsDisp = 
      (mins == 0) ? "00" : 
      (mins < 10) ? "0" + mins.toString() : mins.toString()
  
    var secsDisp = 
      (secs == 0) ? "00" : 
      (secs < 10) ? "0" + secs.toString() : secs.toString()

    return(
      <Text fontSize={28}>{hrsDisp + ":" + minsDisp + ":" + secsDisp}</Text>
    )
  }

  return(
    <Center w="95%" h="25%" bg="light.200" rounded="md" shadow={3}>
    <VStack bg="light.300">

      {/* Section Title */}
      <Text p="6px" h="30%" fontSize={24}>Current Setting:</Text>

      {/* Value Labels */}
      <HStack w="100%" h="35%">
        <Center w="50%">
          <Text fontSize={20}>Target</Text>
          <Text fontSize={20}>Temperature:</Text>
        </Center>
        <Center w="50%">
          <Text fontSize={20}>Time</Text>
          <Text fontSize={20}>Left:</Text>
        </Center>
      </HStack>

      {/* Actual Values */}
      <HStack w="100%" h="35%">
        <Center w="50%">
          <Text pb="25px" fontSize={28} color="orange.500">400°F</Text>
        </Center>
        <Center w="50%">
          <VStack>
            <TimeDisplay />
            <Button p="0.5"
              onPress={() => {
                setTimer(timerCount + 10);
              }}
            >Add 10s</Button>
          </VStack>
        </Center>
      </HStack>

    </VStack>
  </Center>
  )
}

export default TargetBlock;