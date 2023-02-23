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
  const [rowTime, setRowTime] = useState([0, 0, 0])

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
    
    const newRows = appStates.scheduleRowsObj.map((r) => {
      if (r.index === appStates.scheduleRowsObj.at(0).index) {
        return({
          num: r.num,
          temp: r.temp,
          time: r.time,
          intTime: r.intTime,
          color: "active",
          index: r.index,
        })
      }
      return(r)
    })
    appStates.setScheduleRows(newRows)

  }, [appStates.scheduleRowsObj.length])

  // Function to create rows out of the scheduleRows
  // Allow for adjustment of temp or time on any row and updates scheduleRows accordingly
  function InputtableRow({ row, key }) {
    var bgColor =
      row.color === "active" ? "green.500" :
      row.color === "waiting" ? "light.400" : "light.300"
  
    var textColor = 
      row.color === "disabled" ? "light.400" : "black"

    return(
      <HStack w="100%" space={2}>
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

  // Takes the array rowTime and creates string to display and int value for the TargetBlock.
  function ParseTime(times) {
    var hrs = times[0]
    var mins = times[1]
    var secs = times[2]

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
    <Center w="95%" h="42%" bg="light.200" rounded="md" shadow={3}>
      <VStack w="100%" bg="light.300">

        {/* Section Title */}
        <Text p="6px" h="15%" fontSize={24}>Scheduling</Text>

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
        <Box h="60%">
          <ScrollView py="5px" backgroundColor="coolGray.300">
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
        <Center pt="4px" h="15%">
          <Button p="2px" px="10px" onPress={() => appStates.setScheduleRunning(true)}>
            <Text fontSize={18} color="white">Start Schedule</Text>
          </Button>
        </Center>

      </VStack>
      
      {/* Modal for inputting time */}
      <Modal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Set Time</Modal.Header>
          <Modal.Body>

            <HStack space={1}>
              <FormControl w="30%">
                <FormControl.Label>Hours</FormControl.Label>
                <Input p="1" fontSize={18} textAlign="center" 
                  value={
                    rowTime[0] == 0 ? "00" : 
                    rowTime[0] < 10 ? "0" + rowTime[0].toString() : rowTime[0].toString()
                  }
                  onChangeText={(text) => {
                    const newRowTime = [parseInt(text), rowTime[1], rowTime[2]]
                    setRowTime(newRowTime)
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
                    rowTime[1] == 0 ? "00" : 
                    rowTime[1] < 10 ? "0" + rowTime[1].toString() : rowTime[1].toString()
                  }
                  onChangeText={(text) => {
                    const newRowTime = [rowTime[0], parseInt(text), rowTime[2]]
                    setRowTime(newRowTime)
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
                    rowTime[2] == 0 ? "00" : 
                    rowTime[2] < 10 ? "0" + rowTime[2].toString() : rowTime[2].toString()
                  }
                  onChangeText={(text) => {
                    const newRowTime = [rowTime[0], rowTime[1], parseInt(text)]
                    setRowTime(newRowTime)
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
                setRowTime([0, 0, 0])
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