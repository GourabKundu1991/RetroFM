import React, {
    createContext,
    useContext,
    useState,
  } from 'react';
  import TrackPlayer from 'react-native-track-player';
  
  const PlayerContext = createContext();
  
  export const PlayerProvider = ({ children }) => {
  
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const loadQueue = async (tracks, startIndex = 0) => {
      try {
        await TrackPlayer.reset();
  
        await TrackPlayer.add(tracks);
  
        setQueue(tracks);
  
        setCurrentIndex(startIndex);
  
        await TrackPlayer.skip(startIndex);
  
        await TrackPlayer.play();
  
      } catch (e) {
        console.log(e);
      }
    };
  
    const playTrack = async (index) => {
      try {
        setCurrentIndex(index);
  
        await TrackPlayer.skip(index);
  
        await TrackPlayer.play();
      } catch (e) {
        console.log(e);
      }
    };
  
    const nextTrack = async () => {
      try {
        await TrackPlayer.skipToNext();
  
        setCurrentIndex((prev) => prev + 1);
      } catch {}
    };
  
    const previousTrack = async () => {
      try {
        await TrackPlayer.skipToPrevious();
  
        setCurrentIndex((prev) =>
          prev > 0 ? prev - 1 : 0,
        );
      } catch {}
    };
  
    return (
      <PlayerContext.Provider
        value={{
          queue,
          currentIndex,
          loadQueue,
          playTrack,
          nextTrack,
          previousTrack,
        }}
      >
        {children}
      </PlayerContext.Provider>
    );
  };
  
  export const usePlayer = () => useContext(PlayerContext);