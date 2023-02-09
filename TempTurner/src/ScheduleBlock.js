import React, { useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { 
  VStack,
  Center,
  ScrollView,
  HStack,
  Text,
  Button,
  Box,
  Input,
  InputGroup,
} from "native-base";
import { styles, dims } from './Styles';

function ScheduleBlock() {
  const [scheduleRows, setScheduleRows] = useState([{
    num: "+",
    temp: "---",
    time: "--:--:--",
    color: "disabled",
  }])

  // Example row to demonstrate adding rows
  const baseScheduleRow = {
    num: "+",
    temp: "---",
    time: "--:--:--",
    color: "disabled",
  }

  // Function to create rows out of the scheduleRows
  // Should allow for adjustment on any row and update scheduleRows accordingly
  function InputtableRow({ row, key }) {
    var bgColor =
      row.color == "active" ? "green.500" :
      row.color == "waiting" ? "light.400" : "light.300"
  
    var textColor = 
      row.color == "disabled" ? "light.400" : "black"
    
      return(
        <HStack w="100%" space={2}>
          <Center w="12%" bg={bgColor} borderWidth={1} outlineColor="black">
            <Button p="1" w="100%" variant="ghost" colorScheme="gray"
              onPress={
                () => setScheduleRows(scheduleRows.concat(baseScheduleRow))}
            >
              <Text fontSize={24}>{row.num}</Text>
            </Button>
          </Center>
          <Center w="40%" bg={bgColor} borderWidth={1} outlineColor="black">
            <InputGroup w="100%" justifyContent="center">
              <Input w="100%" p="1" fontSize={24} color={textColor} placeholder={row.temp} textAlign="center" 
                onEndEditing={(newTemp) => {
                  const newRows = scheduleRows.map((r, i) => {
                    if (i === key) {
                      return({
                        num: r.num,
                        temp: newTemp + "°F",
                        time: r.time,
                        color: r.color
                      })
                    }
                    return(r)
                  })
                  //setScheduleRows(newRows)
                }}
                InputRightElement={<Text pr="2" fontSize={24}>°F</Text>} variant="unstyled"
              />
            </InputGroup>
          </Center>
          <Center w="40%" bg={bgColor} borderWidth={1} outlineColor="black">
            <Text fontSize={24} color={textColor}>{row.time}</Text>
          </Center>
        </HStack>
      )
  }

  return(
    <Center w="95%" h="42%" bg="light.200" rounded="md" shadow={3}>
    <VStack w="100%" bg="light.300">

      {/* Section Title */}
      <Text p="6px" h="15%" fontSize={24}>Scheduling:</Text>

      {/* Value Labels */}
      <HStack pl="4%" pb="4px" w="100%" h="10%" space={2}>
        <Center w="12%">
          <Text fontSize={20}>#</Text>
        </Center>
        <Center w="40%">
          <Text fontSize={20}>Temperature</Text>
        </Center>
        <Center w="40%">
          <Text fontSize={20}>Time @ Temp</Text>
        </Center>
      </HStack>

      {/* Schedule Rows */}
      <Box h="75%">
        
        <ScrollView>
          <VStack pl="4%" w="100%" space={1}>
            {scheduleRows.map((row, idx)=> {
              return(
                <InputtableRow row={row} key={idx}/>
              )
            })}
          </VStack>
        </ScrollView>
        
      </Box>

    </VStack>
  </Center>
  )
}

export default ScheduleBlock;