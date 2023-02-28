import React, { useEffect, useState } from 'react';
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

function CurrentBlock({ navi }) {
  // State variables to contain wifi-related info
  // reqTries is a temporary way to control and test the sending of http requests
  const [espData, setEspData] = useState()
  const [reqTries, setReqTries] = useState(0)

  const [currentTemp, setCurrentTemp] = useState("")
  const [smokeLevel, setSmokeLevel] = useState("")

  // Receive data from ESP32 (http get -> ESP32 webpage @ its ip)
  useEffect(() => {
    fetch('http://172.20.10.14')
      .then(response => response.text())
      .then(text => {
        setEspData(text)       // Necessary values should be retrievable from text using regexes
        setCurrentTemp(text.match(/Current Temperature: ([0-9.])*/g)[0].split(' ')[2])
        setSmokeLevel(text.match(/Current Smoke Level: ([0-9.])*/g)[0].split(' ')[3])
    })
    .catch(error => {
      console.error(error)
    })
  }, [reqTries])
  
  // Render structures needed for the Current Block
  return(
    <Center w="95%" h="25%" bg="light.300" rounded="md" shadow={3}>
      <VStack>

        {/* Section Title */}
        <HStack p="6px" h="30%" justifyContent="space-between">
          <Text w="50%" fontSize={24}>Current Status</Text>
          <Button w="40%" h="70%" p="3px" variant="ghost" colorScheme="blue" bg="darkBlue.100"
            onPress={() => navi.navigate("Camera View")}
          >
            <Text fontSize={16} color="blue.600">{"View Camera >"}</Text>
          </Button>
        </HStack>
        

        {/* Button to send a get request */}
        {/* <Center>
          <Button p="0.5" w="50%" onPress={() => setReqTries(reqTries + 1)}>Try Request</Button>
        </Center> */}

        {/* Value Labels */}
        <HStack w="100%" h="35%">
          <Center w="50%">
            <Text fontSize={20}>Current</Text>
            <Text fontSize={20}>Temperature</Text>
          </Center>
          <Center w="50%">
            <Text fontSize={20}>Smoke</Text>
            <Text fontSize={20}>Level</Text>
          </Center>
        </HStack>

        {/* Actual Values */}
        {/* the hardcoded values will be replaced with results from the request */}
        <HStack w="100%" h="35%">
        <Center w="50%">
            <Text pb="25px" fontSize={28} color="orange.500">{currentTemp}</Text>
          </Center>
          <Center w="50%">
            <Text pb="25px" fontSize={28} color="green.600">{smokeLevel}</Text>
          </Center>
        </HStack>

      </VStack>
    </Center>
  )
}

export default CurrentBlock;