import TrackPlayer, {
    Capability,
    AppKilledPlaybackBehavior,
  } from 'react-native-track-player';

let initialized = false;

export async function setupPlayer() {
  if (initialized) return;

  try {
    await TrackPlayer.setupPlayer();

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
    });

    initialized = true;
  } catch (e) {
    if (
      !e.message?.includes("already been initialized")
    ) {
      throw e;
    }

    initialized = true;
  }
}