import React, { useRef, useState } from 'react';
import { Room, WebSocketChannel, MucSignaling } from 'rtc-lib'
import { constraints } from './config'
import tw, { GlobalStyles } from 'twin.macro'

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
  const broadcastInputRef = useRef(null)
  const listenInputRef = useRef(null)

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
    <main tw="bg-red-100 flex flex-col items-center justify-center h-screen">
      <GlobalStyles />
      { currentRoom && isConnected
      ? <div tw="bg-white shadow-lg flex flex-col p-10 space-y-5">
          <h2 tw="text-purple-600 font-bold">
            {isBroadcasting
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
      : <div tw="bg-white shadow-lg flex flex-col p-10 space-y-5">
          <h2 tw="text-purple-700 font-bold">
            Choose a room to broadcast or listen
          </h2>
          <div tw="flex space-x-5">
            <div>
              <input
                tw="border hover:border-black py-2 px-4"
                type="text"
                onChange={(e) => setBroadcastRoomName(e.target.value)}
                value={broadcastRoomName}
                placeholder="ex. wesworld"
                ref={broadcastInputRef}
                />
            </div>

            <div>
              <button
                tw="px-4 py-2 bg-purple-500 text-white rounded"
                onClick={
                  () => broadcastRoomName !== ''
                    ? connect({broadcast:true})
                    : broadcastInputRef.current.focus()
                  }
                >
                Broadcast
              </button>
            </div>
          </div>

          <div tw="flex space-x-5">
            <div>
              <input
                tw="border hover:border-black py-2 px-4"
                type="text"
                onChange={(e) => setListenRoomName(e.target.value)}
                value={listenRoomName}
                placeholder="ex. wesworld"
                ref={listenInputRef}
                />
            </div>

            <div>
              <button
                tw="px-4 py-2 bg-purple-500 text-white rounded"
                onClick={
                  () => listenRoomName !== ''
                  ? connect()
                  : listenInputRef.current.focus()
                }
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