import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Button, View, Alert, Platform } from 'react-native';
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }
  }
})

export default function App() {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('NOTIFICATION RECEIVED: ')
      console.log( notification.request.content.data)
    })
    
    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('NOTIFICATION RESPONSE RECEIVED: ')
      console.log(response)
    })
    
    return () => {
      subscription.remove()
      subscription2.remove()
    }
  }, [])
  
  useEffect(() => {
    const configurePushNotifications = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync()
        if (status!== 'granted') {
          const { status: permissionRequestStatus } = await Notifications.requestPermissionsAsync()
          if (permissionRequestStatus !== 'granted') {
            Alert.alert('Permission required', 'We need permission to use push notifications')
            return
          }
        }
        const pushTokenData = await Notifications.getExpoPushTokenAsync()
        console.log(pushTokenData)
        
        if(Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT
          })
        }
        
      } catch (error) {
        console.warn("Error requesting permissions: ", error)
      }
    }
  
    configurePushNotifications()
  }, [])
  
  
  const scheduleNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Info',
        body: 'This is the body of the notification',
        data: {
          userName: 'Yayo'
        },
      },
      trigger: {
        seconds: 3,
      }
    })
  }
  
  const sendPushNotificationHandler = async () => {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'ExponentPushToken[IMXJRXJUSQPDvAHgDdbrpf]',
          title: 'Test - sent from another device',
          body: 'This is a notification from the server it worked!'
        })
      })
      console.log(JSON.stringify(response))
    } catch (error) {
      console.warn(error)
    }
  }
  
  return (
    <View style={styles.container}>
      <Button onPress={scheduleNotificationHandler} title={'Local Notification'} />
      <Button onPress={sendPushNotificationHandler} title={'Push Notification'} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
