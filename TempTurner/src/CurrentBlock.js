import React, { useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { 
  VStack,
  Center,
  HStack,
  Text,
} from "native-base";
import { styles, dims } from './Styles';

function CurrentBlock() {
  
  const [lightStatus, setLightStatus] = useState("off")

  // Receive data from ESP32 (http get -> ESP32 webpage @ its ip)
  // useEffect(() => {
  //   // fetch('10.44.47.202/26/on', {
  //   //   method: 'POST',
  //   //   headers: {
  //   //     Accept: 'text/html',
  //   //     'Content-Type': 'text/html',
  //   //   },
  //   //   body: JSON.stringify({
  //   //     output26State: 'on',
  //   //   }),
  //   // })

  //   fetch('10.44.47.202/26/on')
  //     .then(response => response.json())
  //     .then(json => {
  //       setLightStatus(json.output26State)
  //   })
  //   .catch(error => {
  //     console.error(error)
  //   })
  // }, [])
  
  return(
    <Center w="95%" h="25%" bg="light.200" rounded="md" shadow={3}>
      <VStack bg="light.300">

        {/* Section Title */}
        <Text p="6px" h="30%" fontSize={24}>Current Status:</Text>

        {/* Value Labels */}
        <HStack w="100%" h="35%">
          <Center w="50%">
            <Text fontSize={20}>Current</Text>
            <Text fontSize={20}>Temperature:</Text>
          </Center>
          <Center w="50%">
            <Text fontSize={20}>Smoke</Text>
            <Text fontSize={20}>Level:</Text>
          </Center>
        </HStack>

        {/* Actual Values */}
        <HStack w="100%" h="35%">
        <Center w="50%">
            <Text pb="25px" fontSize={28} color="orange.500">400 °F</Text>
          </Center>
          <Center w="50%">
            <Text pb="25px" fontSize={28} color="green.600">Low</Text>
          </Center>
        </HStack>

      </VStack>
    </Center>
  )
}

export default CurrentBlock;