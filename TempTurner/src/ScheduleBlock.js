import React, { useContext, useEffect, useState } from 'react';
import { View, Platform, useWindowDimensions, Alert, Keyboard } from 'react-native';
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
  Pressable,
  Popover,
  KeyboardAvoidingView,
} from "native-base";
import { styles, dims } from './Styles';
import ScheduleContext from './ScheduleContext';
import { useIsFocused } from '@react-navigation/native';


function ScheduleBlock() {
  // Grab the ScheduleContext to access shared state variables
  const appStates = useContext(ScheduleContext)
  const tempUnitSuffix = appStates.useCelsiusBool ? " °C" : " °F"
  const [isRunning, setIsRunning] = useState(false)
  
  // Modal useStates
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showTempModal, setShowTempModal] = useState(false)
  const [callingRow, setCallingRow] = useState(0)
  const [rowTime, setRowTime] = useState([-1, -1, -1])
  const [rowTemp, setRowTemp] = useState("")

  // Track number of rows
  const [numRows, setNumRows] = useState(2)

  // Manage row edit option
  const [rowEditInfo, setRowEditInfo] = useState({
    rowNum: -1,
    option: "none",
  })

  // Hold the row that cannot hold input (plus button only)
  const disabledRow =
  {
    num: "+",
    temp: "---" + tempUnitSuffix,
    time: "--:--:--",
    intTime: 0,
    color: "disabled",
    index: numRows + 1
  }

  // Await signal from Target Block (occurs when Time Left = 0)
  // Update ScheduleRows and signal to Target Block that the next row is ready
  useEffect(() => {
    if (appStates.scheduleBool && appStates.scheduleRowsObj.length > 1) {
      appStates.setUpdateSchedule(false)

      currentRows = appStates.scheduleRowsObj
      currentRows.shift()
      currentRows.forEach((row, ind) => {
        row.num = row.num === "+" ? row.num : ind + 1
        row.index = ind + 1
        setNumRows(ind + 1)
      })
      appStates.setScheduleRows(currentRows)

      setNumRows(appStates.scheduleRowsObj.length)
      appStates.setUpdateTarget(true)
    }
    if (appStates.scheduleRowsObj.length === 1) {
      setIsRunning(false)
    }
  }, [appStates.scheduleBool])

  // When the Fahrenheit/Celsius toggle is used, adjust ScheduleRows accordingly
  useEffect(() => {
    const newRows = appStates.scheduleRowsObj
    newRows.forEach(row => {
      if (row.temp.split(" ")[0] === "---") {
        const newTemp = appStates.useCelsiusBool ? "--- °C" : "--- °F"
        row.temp = newTemp
      }
      else {
        const oldTemp = parseInt(row.temp.split(' ')[0])
        const newTemp = appStates.useCelsiusBool ?
          Math.round((oldTemp - 32) * 5/9) : Math.round((oldTemp * 9/5) + 32)
        
        const newTempString = newTemp.toString() + tempUnitSuffix
        row.temp = newTempString
      }
    })
    appStates.setScheduleRows(newRows)
  }, [appStates.useCelsiusBool])

  // Update rows on Popover selection
  useEffect(() => {
    if (rowEditInfo.option === "moveup") {
      if (rowEditInfo.rowNum === 1) {
        Alert.alert("Can't Move Row", "There is no row above to swap with.")
      }
      else {
        const currentRows = JSON.parse(JSON.stringify(appStates.scheduleRowsObj))
        const rowToMove = {...currentRows[rowEditInfo.rowNum - 1]}
        const newRows = appStates.scheduleRowsObj

        newRows.forEach((row, ind) => {
          if (ind === rowEditInfo.rowNum - 2) {
            row.num = ind + 1
            row.temp = rowToMove.temp
            row.time = rowToMove.time
            row.intTime = rowToMove.intTime
            row.color = rowToMove.color
            row.index = ind + 1
          }
          if (ind === rowEditInfo.rowNum - 1) {
            row.num = ind + 1
            row.temp = currentRows[ind - 1].temp
            row.time = currentRows[ind - 1].time
            row.intTime = currentRows[ind - 1].intTime
            row.color = currentRows[ind - 1].color
            row.index = ind + 1
          }
        })
      }
      setRowEditInfo({rowNum: -1, option: "none"})
    }
    if (rowEditInfo.option === "movedown") {
      if (rowEditInfo.rowNum === appStates.scheduleRowsObj.length - 1) {
        Alert.alert("Can't Move Row", "There is no row below to swap with.")
      }
      else {
        const currentRows = JSON.parse(JSON.stringify(appStates.scheduleRowsObj))
        const rowToMove = {...currentRows[rowEditInfo.rowNum - 1]}
        const newRows = appStates.scheduleRowsObj

        newRows.forEach((row, ind) => {
          if (ind === rowEditInfo.rowNum - 1) {
            row.num = ind + 1
            row.temp = currentRows[ind + 1].temp
            row.time = currentRows[ind + 1].time
            row.intTime = currentRows[ind + 1].intTime
            row.color = currentRows[ind + 1].color
            row.index = ind + 1
          }
          if (ind === rowEditInfo.rowNum) {
            row.num = ind + 1
            row.temp = rowToMove.temp
            row.time = rowToMove.time
            row.intTime = rowToMove.intTime
            row.color = rowToMove.color
            row.index = ind + 1
          }
        })
      }
      setRowEditInfo({rowNum: -1, option: "none"})
    }
    if (rowEditInfo.option === "delete") {
      const currentRows = appStates.scheduleRowsObj

      // Remove element by splicing
      currentRows.splice(rowEditInfo.rowNum - 1, 1)
      
      // Fix num and index values of each row
      currentRows.forEach((row, ind) => {
        row.num = row.num === "+" ? row.num : ind + 1
        row.index = ind + 1
        setNumRows(ind + 1)
      })
      setRowEditInfo({rowNum: -1, option: "none"})
    }
    if (rowEditInfo.option === "off") {
      const newRows = appStates.scheduleRowsObj.map((r) => {
        if (r.index === rowEditInfo.rowNum) {
          return({
            num: r.num,
            temp: "OFF",
            time: r.time,
            intTime: r.intTime,
            color: r.color,
            index: r.index,
          })
        }
        return(r)
      })
      appStates.setScheduleRows(newRows)
      setRowEditInfo({rowNum: -1, option: "none"})
    }
  }, [rowEditInfo])

  // Function to create rows out of the scheduleRows
  // Allow for adjustment of temp or time on any row and updates scheduleRows accordingly
  function InputtableRow({ row, key }) {
    // Use the color info of the row to determine its appearances
    var bgColor =
      row.color === "active" ? "green.500" :
      row.color === "waiting" ? "light.400" : "light.300"
  
    var textColor = 
      row.color === "disabled" ? "light.400" : "black"

    const curInd = appStates.scheduleRowsObj.indexOf(row)
    const lastInd = appStates.scheduleRowsObj.length - 2

    // Set Popover accessibility
    const canMoveup = isRunning ? curInd > 1 : curInd > 0
    const canMovedown = isRunning ? curInd > 0 && (curInd < lastInd) : curInd < lastInd
    const canDelete = isRunning ? curInd > 0 : true
    const canOff = isRunning ? curInd > 0 : true

    return(
      <HStack w="100%" space={2}>

        {/* If this button displays "+" on it, it creates a new row */}
        {/* Otherwise, a popover with options to edit the row appears */}
        <Center w="12%" bg={bgColor} borderWidth={1} outlineColor="black">
          {
            row.num === "+" ? 
              <Button p="1" w="100%" variant="ghost" colorScheme="gray"
                onPress={
                  () => {
                    appStates.scheduleRowsObj.pop()
                    appStates.scheduleRowsObj.push({
                      num: numRows,
                      temp: "---" + tempUnitSuffix,
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
                <Text fontSize={24 * dims.ar}>{row.num}</Text>
              </Button>
            :
              <Popover defaultIsOpen={false} placement="top left" trigger={triggerProps => {
                return (
                  <Pressable w="100%" borderBottomColor="gray.500" borderBottomWidth="1" {...triggerProps}>
                    {({ isPressed }) => {
                      return (
                        <Center w="100%" p="1" px="3" bg={row.color === "active" ? bgColor: isPressed ? "#93908A" : "light.400"}>
                          <Text fontSize={24 * dims.ar}>{row.num}</Text>
                        </Center>
                    )}}
                  </Pressable>
                )}}>
                <Popover.Content accessibilityLabel="Edit Row" w="56">
                  <Popover.Arrow bg="gray.100" />
                  <Popover.CloseButton />
                  <Popover.Header>Edit Row</Popover.Header>
                  <Popover.Body p="0" pb="1" bg="gray.100">
                    <VStack>
                      <Pressable isDisabled={!canMoveup} bg="gray.200" w="100%" borderBottomColor="gray.500" borderBottomWidth="1"
                        onPress={() => {
                          setRowEditInfo({
                            rowNum: row.num,
                            option: "moveup",
                          })
                        }}>
                          {({ isPressed }) => {
                            return (
                              <Box bg={isPressed ? "gray.200" : "gray.100"} p="2">
                                <Text color={(!canMoveup) ? "light.300" : "black"} pl="2">
                                  Swap with Row Above
                                </Text>
                              </Box>
                            )
                          }}
                      </Pressable>
                      <Pressable isDisabled={!canMovedown} bg="gray.200" w="100%" borderBottomColor="gray.500" borderBottomWidth="1"
                        onPress={() => {
                          setRowEditInfo({
                            rowNum: row.num,
                            option: "movedown",
                          })
                        }}>
                          {({ isPressed }) => {
                            return (
                              <Box bg={isPressed ? "gray.200" : "gray.100"} p="2">
                                <Text color={(!canMovedown) ? "light.300" : "black"} pl="2">
                                  Swap with Row Below
                                </Text>
                              </Box>
                            )
                          }}
                      </Pressable>
                      <Pressable isDisabled={!canDelete} bg="gray.200" w="100%"
                        onPress={() => {
                          setRowEditInfo({
                            rowNum: row.num,
                            option: "delete",
                          })
                        }}>
                          {({ isPressed }) => {
                            return (
                              <Box bg={isPressed ? "gray.200" : "gray.100"} p="2">
                                <Text color={(!canDelete) ? "light.300" : "black"} pl="2">
                                  Delete Row
                                </Text>
                              </Box>
                            )
                          }}
                      </Pressable>
                      <Pressable isDisabled={!canOff} bg="gray.200" w="100%" borderTopColor="gray.500" borderTopWidth="1"
                        onPress={() => {
                          setRowEditInfo({
                            rowNum: row.num,
                            option: "off",
                          })
                        }}>
                          {({ isPressed }) => {
                            return (
                              <Box bg={isPressed ? "gray.200" : "gray.100"} p="2">
                                <Text color={(!canOff) ? "light.300" : "black"} pl="2">
                                  Set Temperature as "OFF"
                                </Text>
                              </Box>
                            )
                          }}
                      </Pressable>
                    </VStack>
                  </Popover.Body>
                </Popover.Content>
              </Popover>
          }
        </Center>

        {/* This is the input temperature area for each row */}
        {/* It will update the scheduleRows array when the user inputs a value and hits enter/return */}
        <Center w="40%" bg={bgColor} borderWidth={1} borderColor={textColor}>
          <Button p="1" variant="unstyled" 
            onPress={() => {
              if (row.num !== "+") {
                if (row.color === "active") {
                  Alert.alert("Schedule is Running", "You can't change this value right now. Stop the schedule if you would like to.")
                }
                else {
                setCallingRow(row.index)
                setShowTempModal(true)
                }
              }
            }}>
            <Text fontSize={24 * dims.ar} color={textColor}>{row.temp}</Text>
          </Button>
        </Center>

        {/* This is the input time area for each row */}
        {/* It is disabled for the "plus" row, but otherwise will call the modal at the bottom of this file */}
        {/* The value should be saved when the user finishes inputting values in the modal */}
        <Center w="40%" bg={bgColor} borderWidth={1} borderColor={textColor}>
          <Button p="1" variant="unstyled" 
            onPress={() => {
              if (row.num !== "+") {
                if (row.color === "active") {
                  Alert.alert("Schedule is Running", "You can't change this value right now. Stop the schedule if you would like to.")
                }
                else {
                setCallingRow(row.index)
                setShowTimeModal(true)
                }
              }
            }}>
            <Text fontSize={24 * dims.ar} color={textColor}>{row.time}</Text>
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

  // Forces the rows to rerender for Fahrenheit/Celsius toggle, there might be a better way to do this
  const isFocused = useIsFocused()
  return (
    <Center w="95%" h="42%" bg="light.300" rounded="md" shadow={3}>
      <VStack w="100%">

        {/* Section Title & Start/Stop Button */}
        <HStack p="6px" h="15%" justifyContent="space-between">
          <Text w="50%" fontSize={24 * dims.ar}>Scheduling</Text>
          {
            isRunning ? 
              <Button w="40%" h="90%" p="3px" variant="ghost" colorScheme="red" bg="red.200"
              onPress={() => {
                if (appStates.scheduleRowsObj[0].time !== "00:00:00") {
                  Alert.alert(
                    "Stop Running?", 
                    "Time remaining will stay visible.",
                    [
                      {text: 'Cancel', onPress: () => {}, style: "cancel"},
                      {text: 'OK', onPress: () => {
                        appStates.setUpdateTarget(true)
                        setIsRunning(false)
                      }}
                    ]
                  )
                }
              }}>
                <Text fontSize={16 * dims.ar} color="red.600">Stop Schedule</Text>
              </Button> 
            :
              <Button w="40%" h="90%" p="3px" variant="ghost" colorScheme="green" bg="green.200"
              onPress={() => {
                var emptyFlag = false
                const rowVals = appStates.scheduleRowsObj.values()
                for (const rowVal of rowVals) {
                  if (rowVal.num !== "+" &&
                      (rowVal.temp === "---" + tempUnitSuffix || rowVal.time === "--:--:--")) {
                    emptyFlag = true
                  }
                }
                if (appStates.scheduleRowsObj.length === 1) {
                  Alert.alert("Cannot Start Schedule", "There are no rows. Please add some.")
                }
                else if (emptyFlag) {
                  Alert.alert("Cannot Start Schedule", 
                    `There are empty values. Please set them or delete the associated rows.
                    \nSome options can be found by tapping on the row numbers.`)
                }
                else {
                  appStates.setUpdateTarget(true)
                  setIsRunning(true)
                }
              }}>
                <Text fontSize={16 * dims.ar} color="green.600">Start Schedule</Text>
              </Button>
          }
        </HStack>

        {/* Value Labels */}
        <HStack pl="4%" pb="4px" w="100%" h="10%" space={2}>
          <Center w="12%">
            <Text fontSize={20 * dims.ar}>#</Text>
          </Center>
          <Center w="40%">
            <Text fontSize={20 * dims.ar}>Temperature</Text>
          </Center>
          <Center w="40%">
            <Text fontSize={20 * dims.ar}>Time @ Temp</Text>
          </Center>
        </HStack>

        {/* Schedule Rows */}
        <Box h="75%">
          <ScrollView py="5px">
            <VStack pl="4%" w="100%" space={1}>
              {appStates.scheduleRowsObj.map((row, idx)=> {
                if (isFocused) {
                  return(
                    <InputtableRow row={row} key={idx} />
                  )
                }
              })}
            </VStack>
          </ScrollView>
        </Box>

      </VStack>
      
      {/* Modal for inputting time */}
      <Modal isOpen={showTimeModal} avoidKeyboard={true} onClose={() => setShowTimeModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>{`Set Time for Row ${callingRow}`}</Modal.Header>

          {/* The body holds the input labels and input areas */}
          {/* Placeholder to show the currently saved time; value to dynamically update with input */}
          <Modal.Body>
            <HStack space={1}>
              <FormControl w="30%">
                <FormControl.Label>Hours</FormControl.Label>
                <Input p="1" fontSize={18 * dims.ar} textAlign="center" keyboardType="number-pad"
                  placeholder={
                    appStates.scheduleRowsObj[callingRow - 1] ?
                    appStates.scheduleRowsObj[callingRow - 1].time.split(":")[0] : "00"
                  }
                  value={
                    rowTime[0] == -1 ? "" :
                    rowTime[0] == 0 ? "00" : 
                    rowTime[0] < 10 ? "0" + rowTime[0].toString() : rowTime[0].toString()
                  }
                  onChangeText={(text) => {
                    if (parseInt(text) >= 0 && parseInt(text) <= 23) {
                      const newRowTime = [parseInt(text), rowTime[1], rowTime[2]]
                      setRowTime(newRowTime)
                    }
                    else {
                      const newRowTime = [rowTime[0], rowTime[1], rowTime[2]]
                      setRowTime(newRowTime)
                    }
                  }}
                />
                <FormControl.Label>[0 - 23]</FormControl.Label>
              </FormControl>

              <FormControl w="2%">
                <FormControl.Label> </FormControl.Label>
                <Text fontSize={18 * dims.ar}>:</Text>
              </FormControl>
              
              <FormControl w="30%">
                <FormControl.Label>Minutes</FormControl.Label>
                <Input p="1" fontSize={18 * dims.ar} textAlign="center" keyboardType="number-pad"
                  placeholder={
                    appStates.scheduleRowsObj[callingRow - 1] ?
                    appStates.scheduleRowsObj[callingRow - 1].time.split(":")[1] : "00"
                  }
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
                <FormControl.Label>[0 - 59]</FormControl.Label>
              </FormControl>

              <FormControl w="2%">
                <FormControl.Label> </FormControl.Label>
                <Text fontSize={18 * dims.ar}>:</Text>
              </FormControl>

              <FormControl w="30%">
                <FormControl.Label>Seconds</FormControl.Label>
                <Input p="1" fontSize={18 * dims.ar} textAlign="center" keyboardType="number-pad"
                  placeholder={
                    appStates.scheduleRowsObj[callingRow - 1] ?
                    appStates.scheduleRowsObj[callingRow - 1].time.split(":")[2] : "00"
                  }
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
                <FormControl.Label>[0 - 59]</FormControl.Label>
              </FormControl>
            </HStack>
          </Modal.Body>

          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                // Don't keep modal input area focused when exiting modal
                Keyboard.dismiss()

                // Clear fields since Cancel was clicked
                setRowTime([-1, -1, -1])
                setShowTimeModal(false)
              }}>
                Cancel
              </Button>
              <Button onPress={() => {
                Keyboard.dismiss()
                setShowTimeModal(false)

                // Keeps current value if nothing was changed
                const newRowTime = rowTime
                newRowTime.forEach((val, ind) => {
                  newRowTime[ind] = val === -1 ? 
                    parseInt(appStates.scheduleRowsObj[callingRow - 1].time.split(":")[ind]) : newRowTime[ind]
                })

                var timeVals = ParseTime(newRowTime)
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

      {/* Modal for inputting temp...keyboardavoidingview wouldn't work */}
      <Modal isOpen={showTempModal} avoidKeyboard={true} onClose={() => setShowTempModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>{`Set Temperature for Row ${callingRow}`}</Modal.Header>

          {/* The body holds the input labels and input areas */}
          {/* Placeholder to show the currently saved time; value to dynamically update with input */}
          <Modal.Body>
            <FormControl w="100%">
              <FormControl.Label>Temperature {appStates.useCelsiusBool ? "(°C)" : "(°F)"}</FormControl.Label>
              <Input p="1" fontSize={18 * dims.ar} textAlign="center" keyboardType="number-pad"
                placeholder={
                  appStates.scheduleRowsObj[callingRow - 1] ? 
                  appStates.scheduleRowsObj[callingRow - 1].temp : "---" + tempUnitSuffix
                }
                value={
                  rowTemp
                }
                onChangeText={(text) => {
                  const upperLimit = appStates.useCelsiusBool ? 260 : 500
                  if (parseInt(text) >= 0 && parseInt(text) <= upperLimit) {
                    setRowTemp(parseInt(text).toString())
                  }
                  if (text === "") {
                    setRowTemp("")
                  }
                }}
              />
              <FormControl.Label>[{appStates.useCelsiusBool ? "40" : "100"} - {appStates.useCelsiusBool ? "260" : "500"}]</FormControl.Label>
            </FormControl>
          </Modal.Body>

          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                Keyboard.dismiss()
                setRowTemp("")
                setShowTempModal(false)
              }}>
                Cancel
              </Button>
              <Button onPress={() => {
                Keyboard.dismiss()
                const intTemp = parseInt(rowTemp)
                const lowerLimit = appStates.useCelsiusBool ? 40 : 100
                if (intTemp < lowerLimit) {
                  Alert.alert(
                    "Invalid Value", 
                    `Please enter a temperature in range ${appStates.useCelsiusBool ? "[40 - 260]" : "[100 - 500]"}`
                  )
                  setRowTemp("")
                }
                else {
                  setShowTempModal(false)
                  const unit = appStates.useCelsiusBool ? " °C" : " °F"
  
                  // Keeps current value if nothing was changed
                  const newRowTemp = rowTemp === "" ? appStates.scheduleRowsObj[callingRow - 1].temp : rowTemp.split(" ")[0] + unit
                  const newRows = appStates.scheduleRowsObj.map((r) => {
                    if (r.index === callingRow) {
                      return({
                        num: r.num,
                        temp: newRowTemp,
                        time: r.time,
                        intTime: r.intTime,
                        color: r.color,
                        index: r.index,
                      })
                    }
                    return(r)
                  })
                  appStates.setScheduleRows(newRows)
                  setRowTemp("")
                }
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