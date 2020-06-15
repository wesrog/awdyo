import React, { useRef, useState, useEffect } from 'react';
import { Room, WebSocketChannel, MucSignaling, MediaDomElement } from 'rtc-lib'
import './App.css'

const initRoom = (roomName) => {
  const channel = new WebSocketChannel(`wss://easy.innovailable.eu/${roomName}`)
  const signaling = new MucSignaling(channel)
  const opts = {
    stun: 'stun:stun.innovailable.eu'
  }
  return new Room(signaling, opts)
}

const Streams = props => {
  const peers = Object.entries(props.peers)
  return (
    peers.map(peer => <Stream peer={peer} />)
  )
}

const Stream = props => {
  const audioRef = useRef(null)
  const { peer } = props

  peer[1].on('streams_changed', () => {
    console.log('!!streams changed')
  })

  useEffect(() => {
    console.log('stream: ', peer)
    peer[1].stream().then(res => {
      console.log('stream res: ', res)
      audioRef.current.srcObject = res.stream
    })
  })

  return (
    <audio controls autoPlay ref={audioRef}></audio>
  )
}

const App = () => {
  const [broadcastRoomName, setBroadcastRoomName] = useState('w35w0r7d')
  const [listenRoomName, setListenRoomName] = useState('w35w0r7d')
  const [connected, setConnected] = useState(false)
  const [peers, setPeers] = useState([])
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

  const broadcast = async () => {
    const room = initRoom(broadcastRoomName)
    room.local.addStream(constraints)

    room.on('peer_joined', peer => {
      console.log('peer connected: ', peer)
      setPeers(room.peers)

      peer.on('left', () => {
        console.log('peer left')
        setPeers([...peers.filter(p => p.signaling.id != peer.signaling.id)])
      })
      peer.on('streams_changed', () => {
        console.log('!!!')
      })
    })

    try {
      await room.connect()
      console.log('connected to room: ', room)
      setConnected(true)
    } catch(err) {
      alert(err)
    }
  }

  const listen = async () => {
    const room = initRoom(broadcastRoomName)
    room.on('peer_joined', peer => {
      console.log('peer connected: ', peer)
      setPeers(room.peers)

      peer.on('left', () => {
        console.log('peer left')
        setPeers([...peers.filter(p => p.signaling.id != peer.signaling.id)])
      })
      peer.on('stream_added', () => {
        console.log('!!! stream added')
      })
    })
    try {
      await room.connect()
      console.log('connected to room: ', room)
      setConnected(true)
    } catch(err) {
      alert(err)
    }
  }

  return (
    <main className="App">
      { connected
      ? <>
          <h2>Connected to {broadcastRoomName}!</h2>

          <div>
            Peers: {Object.keys(peers).length}
          </div>

          <div id="streams">
            <Streams peers={peers} />
          </div>
        </>
      : <>
          <div className="connect">
            <h2>Select a room to broadcast or listen</h2>
            <div>
              Room: <input type="text" onChange={(e) => setBroadcastRoomName(e.target.value)} value={broadcastRoomName} />
              <button onClick={broadcast}>Broadcast</button>
            </div>

            <div>
              Room: <input type="text" onChange={(e) => setListenRoomName(e.target.value)} value={listenRoomName} />
              <button onClick={listen}>Listen</button>
            </div>
          </div>
        </>
      }
    </main>
  );
}

export default App;
