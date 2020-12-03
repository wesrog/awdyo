import React, { useRef, useState } from 'react';
import { Room, WebSocketChannel, MucSignaling } from 'rtc-lib'
import './App.css'
import { constraints } from './config'

const initRoom = (roomName) => {
  const channel = new WebSocketChannel(`wss://easy.innovailable.eu/${roomName}`)
  const signaling = new MucSignaling(channel)
  const opts = {
    stun: 'stun:stun.innovailable.eu'
  }
  return new Room(signaling, opts)
}

const App = () => {
  const [broadcastRoomName, setBroadcastRoomName] = useState('')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [listenRoomName, setListenRoomName] = useState('')
  const [currentRoom, setCurrentRoom] = useState({state:'not connected'})
  const audioRef = useRef(null)

  const connect = async ({broadcast} = {broadcast: false}) => {
    setIsBroadcasting(broadcast)

    const room = initRoom(broadcast ? broadcastRoomName : listenRoomName)

    room.on('peer_joined', async peer => {
      console.log('peer joined broadcast: ', peer)

      peer.on('left', () => {
        console.log(room.peers)
        console.log('peer left')
      })

      peer.on('streams_changed', () => {
        console.log('!!! streams changed')
      })

      if (!broadcast) {
        try {
          const {stream} = await peer.stream()
          audioRef.current.srcObject = stream
        } catch(e) {
          console.log('no stream offered from peer', e)
        }
      }
    })

    try {
      await room.connect()
      console.log('connected to room: ', room)
      if (broadcast) room.local.addStream(constraints)
      setCurrentRoom(room)
    } catch(err) {
      alert(err)
    }
  }

  const isConnected = currentRoom.state === 'connected'

  const numListeners = isConnected
    ? Object.keys(currentRoom.peers).length
    : 0

  return (
    <main className="App">
      { currentRoom && isConnected
      ? <div>
          <h2>{isBroadcasting
            ? `Broadcasting on ${broadcastRoomName}`
            : `Listening to ${listenRoomName}`
            }
          </h2>

          {numListeners} listener{numListeners !== 1 && 's'}

          { !isBroadcasting &&
          <div id="streams">
            <audio controls autoPlay ref={audioRef}></audio>
          </div>
          }
        </div>
      : <div className="connect">
          <h2>Select a room to broadcast or listen</h2>
          <div className="flex">
            <div>
              <input
                type="text"
                onChange={(e) => setBroadcastRoomName(e.target.value)}
                value={broadcastRoomName}
                placeholder="wesworld"
                className="large"
                />
            </div>

            <div>
              <button
                onClick={() => broadcastRoomName !== '' && connect({broadcast:true})}
                className="large"
                >
                Broadcast
              </button>
            </div>
          </div>

          <div className="flex">
            <div>
              <input
                type="text"
                onChange={(e) => setListenRoomName(e.target.value)}
                value={listenRoomName}
                placeholder="wesworld"
                className="large"
                />
            </div>

            <div>
              <button
                onClick={() => listenRoomName !== '' && connect()}
                className="large"
                >
                Listen
              </button>
            </div>
          </div>
        </div>
      }
    </main>
  )
}

export default App