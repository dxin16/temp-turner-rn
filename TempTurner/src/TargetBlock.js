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
import LinearGradient from 'react-native-linear-gradient';

function TargetBlock({ navi }) {
  // Grab the ScheduleContext to access shared state variables
  const appStates = useContext(ScheduleContext)
  const tempUnitSuffix = appStates.useCelsiusBool ? " °C" : " °F"

  // Set the target and timer displays
  const [timerCount, setTimer] = useState(0)
  const [timerIsActive, setTimerIsActive] = useState(true)
  const [targetTemp, setTargetTemp] = useState("---")
  const [targetInt, setTargetInt] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const [tempFill, setTempFill] = useState(1)
  const [tempEmpty, setTempEmpty] = useState(1)

  const [maxTime, setMaxTime] = useState(0)
  const [timeFill, setTimeFill] = useState(1)
  const [timeEmpty, setTimeEmpty] = useState(1)

  // Temporary testing variable to control http request
  const [reqTries, setReqTries] = useState(0)
  const [issueColor, setIssueColor] = useState("light.300")

  // Send data to ESP32 (http POST -> ESP32 web server @ its ip)
  useEffect(() => {
    var hasErr = false
    
    // Always send target temp as fahrenheit
    const postTemp = appStates.useCelsiusBool ? Math.round((targetInt * 9/5) + 32) : targetInt

    fetch('http://172.20.10.14/target', {
      method: 'POST',
      headers: {
      },
      body: `temp=${postTemp}`
    })
    .catch(error => {
      //console.error(error)
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

      if (isRunning && timerCount > 0) {
        // If it is running, but targetBool is triggered again, the stop button was clicked.
        setIsRunning(false)
        setTimerIsActive(false)

        // Clear fields
        setTargetTemp("---")
        setTargetInt(0)
        setTempEmpty(1)
        setTempFill(1)
        setTimeEmpty(1)
        setTimeFill(1)

        // Set first row to waiting
        const newRows = appStates.scheduleRowsObj.map((r) => {
          if (r.index - 1 === 0) {
            return({
              num: r.num,
              temp: r.temp,
              time: r.time,
              intTime: r.intTime,
              color: "waiting",
              index: r.index,
            })
          }
          return(r)
        })
        appStates.setScheduleRows(newRows)
      }
      else {
        setIsRunning(true)
        setTimerIsActive(true)
        const maxTemp = appStates.useCelsiusBool ? 260 : 500
        var tempSetting = 0

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
            const newTemp = appStates.scheduleRowsObj[0].temp
            const newTempInt = parseInt(newTemp.split(' ')[0])
            tempSetting = isNaN(newTempInt) ? 0 : newTempInt

            setTargetTemp(newTemp)
            setTargetInt(tempSetting)
          }
          const newTime = appStates.scheduleRowsObj[0].intTime
          setTimer(newTime)
          setMaxTime(newTime)
        }
        else {
          setIsRunning(false)
          setTargetTemp("---")
          setTargetInt(0)
          setTimer(0)
          setTimerIsActive(true)
        }

        // Set values for visual indicators
        const tempFillVal = tempSetting / maxTemp
        const tempFillLv1 = 1 - tempFillVal
        const tempFillLv2 = tempFillLv1 < 0.5 ? 0.5 : tempFillLv1
        setTempEmpty(tempFillLv1)
        setTempFill(tempFillLv2)
      }
    }

    // Update timer bar
    if (maxTime > 0 && isRunning && timerIsActive) {
      const curTime = timerCount > -1 ? timerCount : 0
      const timeFillVal = curTime / maxTime
      const timeFillLv1 = 1 - timeFillVal
      const timeFillLv2 = timeFillLv1 < 0.5 ? 0.5 : timeFillLv1
      setTimeEmpty(timeFillLv1)
      setTimeFill(timeFillLv2)
    }

    // Update display when timer hits 0 (-1 just so the value 00:00:00 actually shows up)
    if (isRunning && timerCount === -1) {
      setTimer(0)
      setTimerIsActive(true)
      appStates.setUpdateSchedule(true)
    }

    // Setup the basic timer
    if (timerIsActive) {
      let interval = setInterval(() => {
        setTimer(lastTimerCount => {
            lastTimerCount <= 1 && clearInterval(interval)
            return lastTimerCount > -1 ? lastTimerCount - 1 : 0
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timerCount, appStates.targetBool]);

  // When the Fahrenheit/Celsius toggle is used, adjust Target Temperature accordingly
  useEffect(() => {
    if (targetInt > 0) {
      const oldTemp = targetInt
      const newTemp = appStates.useCelsiusBool ?
        Math.round((oldTemp - 32) * 5/9) : Math.round((oldTemp * 9/5) + 32)
      
      const newTempString = newTemp.toString() + tempUnitSuffix
      setTargetTemp(newTempString)
      setTargetInt(newTemp)
    }
  }, [appStates.useCelsiusBool])

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
      <Text fontSize={28 * dims.ar}>{hrsDisp + ":" + minsDisp + ":" + secsDisp}</Text>
    )
  }

  return(
    <Center w="95%" h="25%" bg="light.300" rounded="md" shadow={3}>
    <VStack>

      {/* Section Title & Settings Button */}
      <HStack p="6px" h="30%" justifyContent="space-between">
          <Text w="60%" fontSize={24 * dims.ar}>Current Setting</Text>
          <Button w="40%" h="70%" p="3px" variant="ghost" colorScheme="yellow" bg="yellow.200"
            onPress={() => navi.navigate("Settings")}
          >
            <Text fontSize={16 * dims.ar} color="yellow.600">Display Settings</Text>
          </Button>
        </HStack>

      {/* Labels, Values, and Visual Indicators */}
      <HStack w="100%" h="66%">

        {/* Target Temp */}
        <VStack w="50%" h="100%" ml="-16px">
          <Center h="50%">
            <Text fontSize={20 * dims.ar}>Target</Text>
            <Text fontSize={20 * dims.ar}>Temperature</Text>
            </Center>
          <Center h="50%" pb="25px">
            <Text fontSize={28 * dims.ar} color="orange.500">{targetTemp}</Text>
          </Center>
        </VStack>

        {/* Thermometer */}
        <Center w="5%" h="80%" ml="-20px">
          <LinearGradient paddingBottom={18} paddingRight={2}
            colors={['#FFFFFF', '#F36B45', '#F8A647', '#FDE047']}
            locations={[tempEmpty, tempEmpty, tempFill, 1]}
            borderWidth={1} borderRadius={10}>
              <Text fontSize={11 * dims.ar}>{`-\n-\n-\n-`}</Text>
          </LinearGradient>
          <Center w="100%" h="20%" mt="-2" bg="yellow.300" borderRadius={20} borderWidth={1.4} borderTopWidth={0} />
        </Center>

        {/* Time Left */}
        <VStack w="40%" h="100%" ml="15px">
          <Center h="50%">
            <Text fontSize={20 * dims.ar}>Time</Text>
            <Text fontSize={20 * dims.ar}>Remaining</Text>
          </Center>
          <Center h="50%" pb="25px">
            <TimeDisplay />
          </Center>
        </VStack>

        {/* Time Bar */}
        <Center w="5%" h="80%" ml="-5px">
          <LinearGradient paddingVertical={45 * dims.sh} paddingHorizontal={4 * dims.sw} borderWidth={1}
            colors={['#FFFFFF', '#00D4FF', '#1AB5FF', '#1A91FF']} 
            locations={[timeEmpty, timeEmpty, timeFill, 1]} />
        </Center>

      </HStack>

      {/* http error indicator */}
      <Text h="10%" pt="0" ml="5px" mt="-10px" color={issueColor}>Target Temperature is not being sent!</Text>

    </VStack>
  </Center>
  )
}

export default TargetBlock;