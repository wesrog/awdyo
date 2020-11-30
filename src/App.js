import React, { useRef, useState } from 'react';
import { Room, WebSocketChannel, MucSignaling } from 'rtc-lib'
import './App.css'

const constraints =  {
  audio: {
    autoGainControl: false,
    channelCount: 2,
    echoCancellation: false,
    latency: 0,
    noiseSuppression: false,
    sampleRate: 44000,
    sampleSize: 16,
    volume: 1.0
  }
}

const initRoom = (roomName) => {
  const channel = new WebSocketChannel(`wss://easy.innovailable.eu/${roomName}`)
  const signaling = new MucSignaling(channel)
  const opts = {
    stun: 'stun:stun.innovailable.eu'
  }
  return new Room(signaling, opts)
}

const App = () => {
  const [broadcastRoomName, setBroadcastRoomName] = useState('w35w0r7d')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [listenRoomName, setListenRoomName] = useState('w35w0r7d')
  const [connected, setConnected] = useState(false)
  const [roomObj, setRoomObj] = useState(null)
  const audioRef = useRef(null)

  const connect = async ({broadcast} = {broadcast: false}) => {
    const room = initRoom(broadcastRoomName)
    setRoomObj(room)
    room.on('peer_joined', async peer => {
      console.log('peer joined broadcast: ', peer)
      try {
        const {stream} = await peer.stream()
        audioRef.current.srcObject = stream
      } catch(e) {
        console.error(e)
      }

      peer.on('left', () => {
        console.log('peer left')
      })
      peer.on('streams_changed', () => {
        console.log('!!! streams changed')
      })
    })

    try {
      await room.connect()
      console.log('connected to room: ', room)
      setConnected(true)
      if (broadcast) {
        room.local.addStream(constraints)
        setIsBroadcasting(true)
      }
    } catch(err) {
      alert(err)
    }
  }

  const leave = () => {
    setConnected(false)
    console.log(roomObj)
  }

  return (
    <main className="App">
      { connected
      ? <>
          <h2>Connected to {broadcastRoomName}!</h2>

          <button onClick={() => leave()}>Leave room</button>

          { !isBroadcasting &&
          <div id="streams">
            <audio controls autoPlay ref={audioRef}></audio>
          </div>
          }
        </>
      : <>
          <div className="connect">
            <h2>Select a room to broadcast or listen</h2>
            <div>
              Room: <input type="text" onChange={(e) => setBroadcastRoomName(e.target.value)} value={broadcastRoomName} />
              <button onClick={() => connect({broadcast:true})}>Broadcast</button>
            </div>

            <div>
              Room: <input type="text" onChange={(e) => setListenRoomName(e.target.value)} value={listenRoomName} />
              <button onClick={() => connect()}>Listen</button>
            </div>
          </div>
        </>
      }
    </main>
  )
}

export default App