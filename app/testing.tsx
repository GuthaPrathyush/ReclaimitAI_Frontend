import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const testing = () => {
  return (
    <View style={{backgroundColor: "white"}}>
      <Text>testing</Text>
      <Text>{process.env.EXPO_PUBLIC_BACKEND_URI}</Text>
    </View>
  )
}

export default testing

const styles = StyleSheet.create({})