import React, { useContext, useEffect, useState } from 'react';
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
  Modal,
  FormControl,
} from "native-base";
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';

function ScheduleBlock() {
  const appStates = useContext(ScheduleContext)
  
  // Modal useStates
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [callingRow, setCallingRow] = useState(0)
  const [rowTime, setRowTime] = useState([-1, -1, -1])

  // Track number of rows
  const [numRows, setNumRows] = useState(2)

  // Hold the row that cannot hold input (plus button only)
  const disabledRow =
  {
    num: "+",
    temp: "---",
    time: "--:--:--",
    intTime: 0,
    color: "disabled",
    index: numRows + 1
  }

  useEffect(() => {
    if (appStates.scheduleBool && appStates.scheduleRowsObj.length > 1) {
      appStates.setUpdateSchedule(false)

      currentRows = appStates.scheduleRowsObj
      currentRows.shift()
      appStates.setScheduleRows(currentRows)

      setNumRows(appStates.scheduleRowsObj.length)
      appStates.setUpdateTarget(true)
    }
    // const newRows = appStates.scheduleRowsObj.map((r) => {
    //   if (r.index === appStates.scheduleRowsObj.at(0).index) {
    //     return({
    //       num: r.num,
    //       temp: r.temp,
    //       time: r.time,
    //       intTime: r.intTime,
    //       color: "active",
    //       index: r.index,
    //     })
    //   }
    //   return(r)
    // })
    // appStates.setScheduleRows(newRows)

  }, [appStates.scheduleBool])

  // Function to create rows out of the scheduleRows
  // Allow for adjustment of temp or time on any row and updates scheduleRows accordingly
  function InputtableRow({ row, key }) {
    // Use the color info of the row to determine its appearance
    var bgColor =
      row.color === "active" ? "green.500" :
      row.color === "waiting" ? "light.400" : "light.300"
  
    var textColor = 
      row.color === "disabled" ? "light.400" : "black"

    return(
      <HStack w="100%" space={2}>

        {/* This first button creates a new row */}
        {/* For now, every row has it, but ultimately only the "plus" row should have it */}
        {/* The other rows will have a menu when you click on their number that allows for managing them */}
        <Center w="12%" bg={bgColor} borderWidth={1} outlineColor="black">
          <Button p="1" w="100%" variant="ghost" colorScheme="gray"
            onPress={
              () => {
                appStates.scheduleRowsObj.pop()
                appStates.scheduleRowsObj.push({
                  num: numRows,
                  temp: "---",
                  time: "--:--:--",
                  intTime: 0,
                  color: "waiting",
                  index: numRows,
                })
                setNumRows(numRows + 1)
                appStates.scheduleRowsObj.push(disabledRow)
              }    
            }
          >
            <Text fontSize={24}>{row.num}</Text>
          </Button>
        </Center>

        {/* This is the input temperature area for each row */}
        {/* It will update the scheduleRows array when the user inputs a value and hits enter/return */}
        <Center w="40%" bg={bgColor} borderWidth={1} borderColor={textColor}>
          <Input w="100%" p="1" fontSize={24} placeholderTextColor={textColor} placeholder={row.temp} textAlign="center" variant="unstyled"
            isDisabled={row.color === "disabled" ? true : false}
            onEndEditing={(e) => {
              const newRows = appStates.scheduleRowsObj.map((r) => {
                if (r.index === row.index) {
                  return({
                    num: r.num,
                    temp: e.nativeEvent.text ? e.nativeEvent.text + " °F" : "---",
                    time: r.time,
                    intTime: r.intTime,
                    color: r.color,
                    index: r.index,
                  })
                }
                return(r)
              })
              appStates.setScheduleRows(newRows)
            }}
          />
        </Center>

        {/* This is the input time area for each row */}
        {/* It is disabled for the "plus" row, but otherwise will call the modal at the bottom of this file */}
        {/* The value should be saved when the user finishes inputting values in the modal */}
        <Center w="40%" bg={bgColor} borderWidth={1} borderColor={textColor}>
          <Button p="1" variant="unstyled" 
            onPress={() => {
              if (row.num !== "+") {
                setCallingRow(row.index)
                setShowTimeModal(true)
              }
            }}>
            <Text fontSize={24} color={textColor}>{row.time}</Text>
          </Button>
        </Center>
      </HStack>
    )
  }

  // Takes the times array and returns array containing string to display and int value for the Target Block
  // Basically the TimeDisplay in the Target Block
  function ParseTime(times) {
    var hrs = times[0] > -1 ? times[0] : 0
    var mins = times[1] > -1 ? times[1] : 0
    var secs = times[2] > -1 ? times[2] : 0

    var hrsDisp = 
      (hrs == 0) ? "00" : 
      (hrs < 10) ? "0" + hrs.toString() : hrs.toString()

    var minsDisp = 
      (mins == 0) ? "00" : 
      (mins < 10) ? "0" + mins.toString() : mins.toString()
  
    var secsDisp = 
      (secs == 0) ? "00" : 
      (secs < 10) ? "0" + secs.toString() : secs.toString()

    var timeString = hrsDisp + ":" + minsDisp + ":" + secsDisp
    var timeInt = hrs * 3600 + mins * 60 + secs
    return([timeString, timeInt])
  }

  return(
    <Center w="95%" h="42%" bg="light.300" rounded="md" shadow={3}>
      <VStack w="100%">

        {/* Section Title */}
        <HStack p="6px" h="15%" justifyContent="space-between">
          <Text w="50%" fontSize={24}>Scheduling</Text>
          <Button w="40%" h="90%" p="3px" variant="ghost" colorScheme="blue" bg="darkBlue.100"
            onPress={() => appStates.setUpdateTarget(true)}
          >
            <Text fontSize={16} color="blue.600">Start Schedule</Text>
          </Button>
        </HStack>

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
          <ScrollView py="5px">
            <VStack pl="4%" w="100%" space={1}>
              {appStates.scheduleRowsObj.map((row, idx)=> {
                return(
                  <InputtableRow row={row} key={idx} />
                )
              })}
            </VStack>
          </ScrollView>
        </Box>

        {/* Start Button */}
        {/* <Center pt="4px" h="15%">
          <Button p="2px" px="10px" onPress={() => appStates.setUpdateTarget(true)}>
            <Text fontSize={18} color="white">Start Schedule</Text>
          </Button>
        </Center> */}

      </VStack>
      
      {/* Modal for inputting time */}
      <Modal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Set Time</Modal.Header>

          {/* The body holds the input labels and input areas */}
          <Modal.Body>
            <HStack space={1}>
              <FormControl w="30%">
                <FormControl.Label>Hours</FormControl.Label>
                <Input p="1" fontSize={18} textAlign="center" placeholder=''
                  value={
                    rowTime[0] == -1 ? "" :
                    rowTime[0] == 0 ? "00" : 
                    rowTime[0] < 10 ? "0" + rowTime[0].toString() : rowTime[0].toString()
                  }
                  onChangeText={(text) => {
                    if (parseInt(text) >= 0 && parseInt(text) <= 24) {
                      const newRowTime = [parseInt(text), rowTime[1], rowTime[2]]
                      setRowTime(newRowTime)
                    }
                    else {
                      const newRowTime = [rowTime[0], rowTime[1], rowTime[2]]
                      setRowTime(newRowTime)
                    }
                  }}
                />
              </FormControl>

              <FormControl w="2%">
                <FormControl.Label> </FormControl.Label>
                <Text fontSize={18}>:</Text>
              </FormControl>
              
              <FormControl w="30%">
                <FormControl.Label>Minutes</FormControl.Label>
                <Input p="1" fontSize={18} textAlign="center" 
                  value={
                    rowTime[1] == -1 ? "" :
                    rowTime[1] == 0 ? "00" : 
                    rowTime[1] < 10 ? "0" + rowTime[1].toString() : rowTime[1].toString()
                  }
                  onChangeText={(text) => {
                    if (parseInt(text) >= 0 && parseInt(text) <= 59) {
                      const newRowTime = [rowTime[0], parseInt(text), rowTime[2]]
                      setRowTime(newRowTime)
                    }
                    else {
                      const newRowTime = [rowTime[0], rowTime[1], rowTime[2]]
                      setRowTime(newRowTime)
                    }
                  }}
                />
              </FormControl>

              <FormControl w="2%">
                <FormControl.Label> </FormControl.Label>
                <Text fontSize={18}>:</Text>
              </FormControl>

              <FormControl w="30%">
                <FormControl.Label>Seconds</FormControl.Label>
                <Input p="1" fontSize={18} textAlign="center"
                  value={
                    rowTime[2] == -1 ? "" :
                    rowTime[2] == 0 ? "00" : 
                    rowTime[2] < 10 ? "0" + rowTime[2].toString() : rowTime[2].toString()
                  }
                  onChangeText={(text) => {
                    if (parseInt(text) >= 0 && parseInt(text) <= 59) {
                      const newRowTime = [rowTime[0], rowTime[1], parseInt(text)]
                      setRowTime(newRowTime)
                    }
                    else {
                      const newRowTime = [rowTime[0], rowTime[1], rowTime[2]]
                      setRowTime(newRowTime)
                    }
                  }}
                />
              </FormControl>
            </HStack>
          </Modal.Body>

          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                setShowTimeModal(false)
              }}>
                Cancel
              </Button>
              <Button onPress={() => {
                setShowTimeModal(false)

                var timeVals = ParseTime(rowTime)
                const newRows = appStates.scheduleRowsObj.map((r) => {
                  if (r.index === callingRow) {
                    return({
                      num: r.num,
                      temp: r.temp,
                      time: timeVals[0],
                      intTime: timeVals[1],
                      color: r.color,
                      index: r.index,
                    })
                  }
                  return(r)
                })
                appStates.setScheduleRows(newRows)
                setRowTime([-1, -1, -1])
              }}>
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

    </Center>
  )
}

export default ScheduleBlock;