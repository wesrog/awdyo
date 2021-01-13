import React, { useRef, useState } from 'react';
import { constraints } from './config'
import { GlobalStyles } from 'twin.macro'
import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';

const configuration = {
  iceServers: [{ urls: 'stun:stun2.1.google.com:19302' }]
}
    
const NEW_STREAM = gql`
  mutation NewStream($id: ID!) {
    newStream(id: $id) {
      id
    }
  }
`

const Broadcast = ({ setIsBroadcasting }) => {
  const [newStream] = useMutation(NEW_STREAM)
  const [broadcastRoomName, setBroadcastRoomName] = useState('')
  const broadcastInputRef = useRef(null)

  const connect = () => {
    newStream({ variables: { id: broadcastRoomName }})
    setIsBroadcasting(true)
  }
  
  return (
    <>
      <div>
        <input
          tw="border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent py-2 px-4"
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
          onClick={() => connect()}
          >
          Broadcast
        </button>
      </div>
    </>
  )
}

const LEAVE_STREAM = gql`
  mutation LeaveStream($id: ID!) {
    leaveChannel(name: $name) {
      name
    }
  }
`

const Listen = ({ audioRef, setIsListening }) => {
  const [joinStream] = useMutation(JOIN_STREAM)
  const [listenRoomName, setListenRoomName] = useState('')
  const listenInputRef = useRef(null)

  const connect = () => {
    joinStream({ variables: { id: listenRoomName, userId: 'me' } })
    setIsListening(true)
  }

  return (
    <>
      <div>
        <input
          tw="border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent py-2 px-4"
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
    </>
  )
}

const Clients = () => {
  const SUB = gql`
    subscription ListenerAdded {
      listenerAdded {
        id
        listeners {
          id
        }
      }
    }
  `

  const { data, loading, error } = useSubscription(SUB)
  console.log(data, loading, error)
  return !loading
    ? data.listenerAdded.listeners.length
    : 'no listeners'
}

const JOIN_STREAM = gql`
  mutation JoinStream($id: String!, $userId: String!) {
    joinStream(id: $id, userId: $userId) {
      id
      listeners {
        id
      }
    }
  }
`

const Streams = ({ username, setStream }) => {
  const GET_STREAMS = gql`
    query GetStreams {
      streams {
        id
      }
    }
  `

  const { loading, error, data } = useQuery(GET_STREAMS)

  const [joinStream] = useMutation(JOIN_STREAM)

  const connect = id => {
    joinStream({ variables: { id, userId: username } })
    setStream(id)
  }

  if (loading) return 'no streams'

  return <>
    {data.streams.map(({ id }, key) =>
      <button
        onClick={() => connect(id)}
        key={key}>
        {id}
      </button>
    )}
  </>
}

const Username = ({ setUsername }) => {
  const inputRef = useRef()

  return <>
    <h2 tw="text-purple-700 font-bold">
      What's your name?
    </h2>
    <div tw="flex space-x-5">
      <div>
        <input
          tw="border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent py-2 px-4"
          type="text"
          placeholder="ex. wesworld"
          ref={inputRef}
          />
      </div>

      <div>
        <button
          onClick={() => setUsername(inputRef.current.value)}
          tw="px-4 py-2 bg-purple-500 text-white rounded">
          View streams
        </button>
      </div>
    </div>
  </>
}

const Stream = ({ stream }) => {
  return (
    <>Stream: {stream}</>
  )
}

const App = () => {
  const [username, setUsername] = useState('')
  const [stream, setStream] = useState('')

  return (
    <main tw="bg-red-100 bg-opacity-50 flex flex-col items-center justify-center h-screen">
      <GlobalStyles />
      <Clients />

      <div tw="bg-white shadow-lg flex flex-col p-10 space-y-5">
        { username
        ?
          stream
          ?
          <Stream stream={stream} />
          :
          <>
          Me: {username}
          <Streams username={username} setStream={setStream} />
          </>
        :
        <Username setUsername={setUsername} />
        }
      </div>
    </main>
  )
}

export default App