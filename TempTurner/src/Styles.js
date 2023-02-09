import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const dims = {
  h: Math.round(Dimensions.get("window").height),
  w: Math.round(Dimensions.get("window").width),
}

export {
  styles,
  dims,
}