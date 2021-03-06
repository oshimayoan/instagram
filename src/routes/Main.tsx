import React from 'react';
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'exoflex';
import { useRecoilValue } from 'recoil';

import {
  Comments,
  Feed,
  Login,
  NewPost,
  NewPostButton,
  Profile,
} from '../screens';
import { useAuth } from '../apis/auth';
import { usernameState } from '../atoms/user';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function FeedTab() {
  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          } else if (route.name === 'NewPost') {
            iconName = 'plus-box-outline';
          }

          return <IconButton icon={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{ showLabel: false }}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen
        name="NewPost"
        component={NewPost}
        options={{ tabBarButton: () => <NewPostButton /> }}
      />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default () => {
  let { isSignedin, logout } = useAuth();
  let username = useRecoilValue(usernameState);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'left',
          headerBackTitleVisible: false,
          headerBackImage: () => <IconButton icon="arrow-left" />,
        }}
      >
        {!isSignedin ? (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Feed"
              component={FeedTab}
              options={({ route }) => {
                let routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';

                let isProfile = routeName === 'Profile';
                return {
                  headerTitle: isProfile ? username : routeName,
                  headerRight: isProfile
                    ? () => <IconButton icon="logout" onPress={logout} />
                    : undefined,
                };
              }}
            />
            <Stack.Screen name="Comments" component={Comments} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
