import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'exoflex';

import { Comments, Feed, Profile } from '../screens';

const FeedStack = createStackNavigator();

function FeedStackScreen() {
  return (
    <FeedStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerBackTitleVisible: false,
        headerBackImage: () => <IconButton icon="arrow-left" />,
      }}
    >
      <FeedStack.Screen name="Feed" component={Feed} />
      <FeedStack.Screen name="Comments" component={Comments} />
    </FeedStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        backBehavior="history"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';

            if (route.name === 'Feed') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'account' : 'account-outline';
            }

            return <IconButton icon={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{ showLabel: false }}
      >
        <Tab.Screen name="Feed" component={FeedStackScreen} />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
