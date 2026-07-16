import TrackPlayer, { Event, State } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

module.exports = async function () {

  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    const track = await TrackPlayer.getActiveTrack();

    console.log("State:", state);
    console.log("Track:", track);

    if (state === State.Playing) {
      await AsyncStorage.setItem(
        "CURRENT_PLAYER",
        JSON.stringify({
          state: "PLAYING",
          track,
        }),
      );
    }

    if (state === State.Paused) {
      await AsyncStorage.setItem(
        "CURRENT_PLAYER",
        JSON.stringify({
          state: "PAUSED",
          track,
        }),
      );
    }

    if (state === State.Stopped || state === State.Ended) {
      await AsyncStorage.removeItem("CURRENT_PLAYER");
      await AsyncStorage.removeItem("playerData");
    }
  });

};