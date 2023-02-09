import React, { useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { 
  NativeBaseProvider,
  VStack,
  Center,
  ScrollView,
  HStack,
  Text,
  Button,
  Box,
  Input,
  InputGroup,
  KeyboardAvoidingView,
} from "native-base";

// const {height, width} = useWindowDimensions();

// Base function to show the main screen
// Use Native Base for UI - sectioning off important parts of app
function HomeScreen({ navigation }) {
  return (
    <NativeBaseProvider>
      <VStack pt="3" h="100%" space={4} alignItems="center">
        
        <CurrentBlock />
        <TargetBlock />
        <ScheduleBlock />

      </VStack>
    </NativeBaseProvider>
  );
}

// Primary UI structure is VStacks and HStacks with various blocks
function CurrentBlock() {
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
            <Text pb="25px" fontSize={28} color="orange.500">400°F</Text>
          </Center>
          <Center w="50%">
            <Text pb="25px" fontSize={28} color="green.600">Low</Text>
          </Center>
        </HStack>

      </VStack>
    </Center>
  )
}

function TargetBlock() {
  const [timerCount, setTimer] = useState(10)

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

// Example implementation of navigation
function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
    </View>
  );
}

// Actual App structure that is returned
const Stack = createNativeStackNavigator();
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="The Temp Turner" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;