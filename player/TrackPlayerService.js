import TrackPlayer, {
    Capability,
    AppKilledPlaybackBehavior,
  } from 'react-native-track-player';
  
  let isPlayerInitialized = false;
  
  export const setupPlayer = async () => {
    if (isPlayerInitialized) return;

        try {
            await TrackPlayer.setupPlayer();

            await TrackPlayer.updateOptions({
                android: {
                    appKilledPlaybackBehavior:
                        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                },
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.Stop,
                ],
                compactCapabilities: [
                    Capability.Play,
                    Capability.Pause,
                ],
            });

            isPlayerInitialized = true;
        } catch (e) {
            if (
                e?.message?.includes('already been initialized')
            ) {
                isPlayerInitialized = true;
            } else {
                throw e;
            }
        }
  };