import React, { useRef, useState } from 'react';
import { Room, WebSocketChannel, MucSignaling, MediaDomElement } from 'rtc-lib'
import './App.css'

const App = () => {
  const audioRef = useRef(null)
  const [broadcastRoomName, setBroadcastRoomName] = useState('w35w0r7d')
  const [listenRoomName, setListenRoomName] = useState('w35w0r7d')

  const channel = new WebSocketChannel(`wss://easy.innovailable.eu/${broadcastRoomName}`)
  const signaling = new MucSignaling(channel)
  const opts = {
    stun: 'stun:stun.innovailable.eu'
  }
  const room = new Room(signaling, opts)
  room.on('peer_joined', peer => {
    console.log('peer connected: ', peer)
    new MediaDomElement(audioRef.current, peer)
    audioRef.current.controls = true

    peer.on('left', () => {
      console.log('peer left')
    })
  })

  const broadcast = async () => {
    const constraints = { audio: true }
    const channel = new WebSocketChannel(`wss://easy.innovailable.eu/${broadcastRoomName}`)
    const signaling = new MucSignaling(channel)
    const opts = {
      stun: 'stun:stun.innovailable.eu'
    }
    const room = new Room(signaling, opts)
    room.on('peer_joined', peer => {
      console.log('peer connected: ', peer)
      new MediaDomElement(audioRef.current, peer)
      audioRef.current.controls = true

      peer.on('left', () => {
        console.log('peer left')
      })
    })

    try {
      await room.connect()
      room.local.addStream(constraints)
    } catch(err) {
      alert(err)
    }
  }

  const listen = async () => {
    const channel = new WebSocketChannel(`wss://easy.innovailable.eu/${listenRoomName}`)
    const signaling = new MucSignaling(channel)
    const opts = {
      stun: 'stun:stun.innovailable.eu'
    }
    const room = new Room(signaling, opts)
    console.log('room: ', room)
    room.on('peer_joined', peer => {
      console.log('peer connected: ', peer)
      new MediaDomElement(audioRef.current, peer)
      audioRef.current.controls = true

      peer.on('left', () => {
        console.log('peer left')
      })
    })
    try {
      await room.connect()
    } catch(err) {
      alert(err)
    }
  }

  return (
    <main className="App">
      <div>
        Room: <input type="text" onChange={(e) => setBroadcastRoomName(e.target.value)} value={broadcastRoomName} />
        <button onClick={broadcast}>Broadcast</button>
      </div>

      <div>
        Room: <input type="text" onChange={(e) => setListenRoomName(e.target.value)} value={listenRoomName} />
        <button onClick={listen}>Listen</button>
        <div>
          <audio autoPlay ref={audioRef}></audio>
        </div>
      </div>
    </main>
  );
}

export default App;
