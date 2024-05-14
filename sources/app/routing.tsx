import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { OnboardingState } from '../global';
import { PreUsernameScreen } from './pre/PreUsername';
import { PrePreparingScreen } from './pre/PrePreparing';
import { HomeScreen } from './screens/HomeScreen';
import { PreNameScreen } from './pre/PreName';
import { PreNotificationsScreen } from './pre/PreNotifications';
import { PreActivationScreen } from './pre/PreActivation';
import { SessionScreen } from './screens/SessionScreen';
import { SettingsManageDevice } from './routes/(app)/(screens)/settings/device';
import { SessionsScreens } from './screens/SessionsScreen';
import { MemoryScreen } from './screens/MemoryScreen';
import { LogsScreen } from './dev/LogsScreen';
import { Platform } from 'react-native';
import { DevScreen } from './dev/DevScreen';
import { SettingsScreen } from './routes/(app)/(screens)/settings';
import { TranscriptionsScreen } from './routes/(app)/(screens)/transcriptions';
import { UpdateLogScreen } from './dev/UpdateLogScreen';
import { VoiceSampleScreen } from './routes/(app)/(screens)/settings/voice_sample';

export const Stack = createNativeStackNavigator();

export const App = (
    <>
        <Stack.Screen
            name='root'
            component={HomeScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name='session'
            component={SessionScreen}
            options={{ title: 'Session', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name='sessions'
            component={SessionsScreens}
            options={{ title: 'Sessions', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name='manage-device'
            component={SettingsManageDevice}
            options={{ title: 'Device Management', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
         <Stack.Screen
            name='voice-sample'
            component={VoiceSampleScreen}
            options={{ title: 'Voice Sample', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name='memory'
            component={MemoryScreen}
            options={{ headerShown: Platform.OS !== 'ios', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name='logs'
            component={LogsScreen}
            options={{ title: 'Logs', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name='update-logs'
            component={UpdateLogScreen}
            options={{ title: 'Update Logs', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name='dev'
            component={DevScreen}
            options={{ title: 'Developer', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name="settings"
            component={SettingsScreen}
            options={{ title: 'Settings', presentation: Platform.OS === 'ios' ? 'formSheet' : 'card' }}
        />
        <Stack.Screen
            name="transcriptions"
            component={TranscriptionsScreen}
            options={{ title: 'Transcripts' }}
        />
    </>
);

export const Pre = (state: OnboardingState) => {
    if (state.kind === 'prepare') {
        return (
            <Stack.Screen
                name='prepare'
                component={PrePreparingScreen}
                options={{
                    headerShown: false
                }}
            />
        );
    }
    if (state.kind === 'need_username') {
        return (
            <Stack.Screen
                name='need_username'
                component={PreUsernameScreen}
                options={{
                    headerShown: false
                }}
            />
        );
    }
    if (state.kind === 'need_name') {
        return (
            <Stack.Screen
                name='need_name'
                component={PreNameScreen}
                options={{
                    headerShown: false
                }}
            />
        );
    }
    if (state.kind === 'need_push') {
        return (
            <Stack.Screen
                name='need_push'
                component={PreNotificationsScreen}
                options={{
                    headerShown: false
                }}
            />
        );
    }
    if (state.kind === 'need_activation') {
        return (
            <Stack.Screen
                name='need_activation'
                component={PreActivationScreen}
                options={{
                    headerShown: false
                }}
            />
        );
    }
    return null;
}