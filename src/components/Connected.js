import React from 'react'
import 'twin.macro'

const Connected = ({
    broadcastRoomName,
    isConnected,
    currentRoom,
    isBroadcasting,
    listenRoomName,
    audioRef
}) => {
    const numListeners = isConnected
    ? Object.keys(currentRoom.peers).length
    : 0

    return (
      <div tw="bg-white shadow-lg flex flex-col p-10 space-y-5">
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
    )
}

export default Connected