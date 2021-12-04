import React from 'react'
import 'twin.macro'

const ChooseRoom = ({
    setBroadcastRoomName,
    broadcastRoomName,
    broadcastInputRef,
    connect,
    setListenRoomName,
    listenRoomName,
    listenInputRef
}) => {
    return (
      <div tw="bg-white shadow-lg flex flex-col p-10 space-y-5">
          <h2 tw="text-purple-700 font-bold">
            Choose a room to broadcast or listen
          </h2>
          <div tw="flex space-x-5">
            <div>
              <input
                tw="border hover:border-black py-2 px-4"
                type="text"
                onChange={({ target: { value } }) => setBroadcastRoomName(value)}
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
                    ? connect({ broadcast: true })
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
    )
}

export default ChooseRoom