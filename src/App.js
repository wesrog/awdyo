import React, { useRef, useState } from 'react';
import { constraints } from './config'
import { GlobalStyles } from 'twin.macro'
import { initRoom } from './lib/room'
import Connected from './components/Connected';
import ChooseRoom from './components/ChooseRoom'

const App = () => {
  const [broadcastRoomName, setBroadcastRoomName] = useState('')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [listenRoomName, setListenRoomName] = useState('')
  const [currentRoom, setCurrentRoom] = useState({ state:'not connected' })
  const audioRef = useRef(null)
  const broadcastInputRef = useRef(null)
  const listenInputRef = useRef(null)

  const connect = async ({ broadcast } = { broadcast: false }) => {
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

  return (
    <main tw="bg-red-100 bg-opacity-50 flex flex-col items-center justify-center h-screen">
      <GlobalStyles />
      {currentRoom && isConnected
        ? <Connected
            isConnected={isConnected}
            currentRoom={currentRoom}
            isBroadcasting={isBroadcasting}
            broadcastRoomName={broadcastRoomName}
            listenRoomName={listenRoomName}
            audioRef={audioRef}
          />
        : <ChooseRoom
            setBroadcastRoomName={setBroadcastRoomName}
            broadcastRoomName={broadcastRoomName}
            broadcastInputRef={broadcastInputRef}
            connect={connect}
            setListenRoomName={setListenRoomName}
            listenRoomName={listenRoomName}
            listenInputRef={listenInputRef}
          />
      }
    </main>
  )
}

export default App