import React, { useEffect, useRef } from 'react';
import { colors } from '../styles/colors';

const JitsiMeeting = ({ roomId, displayName, userRole }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi Meet API not loaded');
      return;
    }

    // Configuration options
    const options = {
      roomName: roomId,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        // Disable lobby/moderator requirement
        enableLobbyChat: false,
        enableInsecureRoomNameWarning: false,
        // If teacher, set security options to make them moderator
        ...(userRole === 'teacher' && {
          roomPasswordNumberOfDigits: 10
        })
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'invite',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'videobackgroundblur',
          'help',
          'mute-everyone'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        MOBILE_APP_PROMO: false
      },
      userInfo: {
        displayName: displayName,
        email: userRole === 'teacher' ? 'teacher@alburhan.edu' : undefined
      }
    };

    // Initialize Jitsi
    jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

    // Event listeners
    jitsiApiRef.current.addEventListener('videoConferenceJoined', () => {
      console.log('User joined the conference');
    });

    jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
      console.log('User left the conference');
    });

    jitsiApiRef.current.addEventListener('participantJoined', (participant) => {
      console.log('Participant joined:', participant);
    });

    // Cleanup on unmount
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomId, displayName]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          {userRole === 'teacher' ? '👨‍🏫 Teaching Session' : '👨‍🎓 Class Session'}
        </h2>
        <p style={styles.roomInfo}>Room ID: <strong>{roomId}</strong></p>
      </div>
      <div ref={jitsiContainerRef} style={styles.jitsiContainer} />
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#000'
  },
  header: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '15px 30px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem'
  },
  roomInfo: {
    margin: '5px 0 0 0',
    fontSize: '0.9rem',
    color: colors.secondary
  },
  jitsiContainer: {
    width: '100%',
    height: 'calc(100vh - 80px)'
  }
};

export default JitsiMeeting;
