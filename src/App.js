import React, { useRef, useState, useEffect } from 'react';
import './App.css'

const Clip = props => {
  return (
    <audio controls src={props.src}></audio>
  )
}

const ClipList = props => {
  const clips = props.clips
  const clipItems = clips.map(clip =>
    <div><Clip src={clip} /></div>
  )

  return (
    <div className="clips">{clipItems}</div>
  )
}

const App = () => {
  const [recorder, setRecorder] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [clips, setClips] = useState([])

  useEffect(() => {
    const constraints = { audio: true }
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError)
  }, [])

  const onSuccess = (stream) => {
    setRecorder(new MediaRecorder(stream))
    console.log('success')
  }

  const onError = (err) => {
    console.log('err:', err)
  }

  const start = () => {
    setIsRecording(true)
    recorder.start()

    recorder.ondataavailable = e => {
      const blob = new Blob([e.data], {type: 'audio/ogg; codecs=opus'})
      const audioUrl = window.URL.createObjectURL(blob)
      setClips(clips => [...clips, audioUrl])
      console.log(clips)
    }

    recorder.onstop = e => {
      console.log('data avail after recorder stopped')
    }
  }

  const stop = () => {
    setIsRecording(false)
    recorder.stop()
  }

  return (
    <main className="App">
      {
        isRecording
          ? <button onClick={stop}>Stop</button>
          : <button onClick={start}>Start</button>
      }
      <p>{isRecording ? 'Recording...' : 'Hit start to record'}</p>

      <ClipList clips={clips} />
    </main>
  );
}

export default App;
