import * as React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Theme } from '../../../theme';
import { useAppModel } from '../../../global';
import { useAtomValue } from 'jotai';
import { RoundButton } from '../../components/RoundButton';
import { DeviceComponent } from '../../components/DeviceComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DiscoveryDevice = React.memo(() => {
    const safeArea = useSafeAreaInsets();
    const appModel = useAppModel();
    const discovery = useAtomValue(appModel.wearable.discoveryStatus);
    React.useEffect(() => {
        appModel.wearable.startDiscovery();
        return () => {
            appModel.wearable.stopDiscrovery();
        };
    }, []);
    const devices = discovery?.devices ?? [];

    return (
        <View style={{ flexGrow: 1, backgroundColor: Theme.background }}>
            {devices.length === 0 && (
                <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginBottom: safeArea.bottom }}>
                    <ActivityIndicator />
                    <Text style={{ paddingHorizontal: 16, paddingVertical: 16, fontSize: 24, color: Theme.text }}>Looking for devices</Text>
                </View>
            )}
            {devices.length > 0 && (
                <>
                    <ScrollView style={{ flexGrow: 1, alignSelf: 'stretch' }} contentContainerStyle={{ padding: 16, paddingBottom: 128 + safeArea.bottom, justifyContent: 'center', flexGrow: 1 }} alwaysBounceVertical={false}>
                        <Text style={{ paddingHorizontal: 16, paddingVertical: 32, fontSize: 24, color: Theme.text, alignSelf: 'center' }}>{devices.length === 1 ? 'One device' : devices.length + ' devices'} found</Text>
                        {devices.map((device) => (
                            <DeviceComponent key={device.id} title={device.name} kind='bubble' subtitle={device.id} onPress={() => appModel.wearable.tryPairDevice(device.id)} />
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );
});

const ManageDevice = React.memo(() => {
    const appModel = useAppModel();
    return (
        <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.background }}>
            <RoundButton title={"Disconnect"} action={() => appModel.wearable.disconnectDevice()} />
        </View>
    )
});

export const SettingsManageDevice = React.memo(() => {
    const appModel = useAppModel();
    const wearable = appModel.useWearable();

    // Loading state
    if (wearable.pairing === 'loading' || wearable.pairing === 'denied' || wearable.pairing === 'unavailable') {
        return (
            <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.background }}>
                <ActivityIndicator />
            </View>
        );
    }

    // Need pairing
    if (wearable.pairing === 'need-pairing') {
        return <DiscoveryDevice />;
    }

    return (
        <ManageDevice />
    );
});