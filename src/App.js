import React, { useRef } from 'react';
import {Room, WebSocketChannel, MucSignaling, MediaDomElement} from 'rtc-lib'
import './App.css'

const App = () => {
  const audioRef = useRef(null)

  const channel = new WebSocketChannel('wss://easy.innovailable.eu/w35w0r7d')
  const signaling = new MucSignaling(channel)
  const opts = {
    stun: 'stun:stun.innovailable.eu'
  }
  const room = new Room(signaling, opts)
  room.on('peer_joined', peer => {
    console.log('peer connected')
    console.log(peer)
    new MediaDomElement(audioRef.current, peer)

    peer.on('left', () => {
      console.log('peer left')
    })
  })

  const broadcast = async () => {
    const constraints = { audio: true }

    try {
      await room.connect()
    } catch(err) {
      alert(err)
    }

    try {
      room.local.addStream(constraints)
    } catch(err) {
      alert(err)
    }
  }

  const listen = async () => {
    console.log('listen')
    console.log(room)
    try {
      await room.connect()
    } catch(err) {
      alert(err)
    }
  }

  return (
    <main className="App">
      <button onClick={broadcast}>Broadcast</button>
      <button onClick={listen}>Listen</button>
      <audio autoPlay ref={audioRef}></audio>
    </main>
  );
}

export default App;
