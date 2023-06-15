import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const width = Dimensions.get("window").width
const height = Dimensions.get("window").height

// Scaling based off of iPhone 14, which is my main emulator
// Currently, this is mostly for font scaling.
const scaleWidth = width / 390
const scaleHeight = height / 844
const sqrtScale = Math.sqrt(scaleWidth * scaleHeight)
const areaRatio = sqrtScale < 1 ? 0.95 * sqrtScale : sqrtScale

const dims = {
  w: width,
  h: height,
  sw: scaleWidth,
  sh: scaleHeight,
  ar: areaRatio,
}

export {
  styles,
  dims,
}