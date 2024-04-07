import { useRef, useState, useEffect } from 'react'
import './App.scss'
import Editor from '@monaco-editor/react'

const App = () => {
  const [isDragging, setIsDragging] = useState(false)
  const resizeBarRef = useRef()
  const [code, setCode] = useState('')
  const [savedCode, setSavedCode] = useState('')
  const [runError, setRunError] = useState('')

  useEffect(() => {
    window.addEventListener('message', (e) => {
      if (typeof e.data !== "object") return;

      if (e?.data?.type === 'error') {
        setRunError(e.data.message)
      }
    })
  })

  return (
    <div className="App">
      <header>
        <button onClick={() => {
          setSavedCode(code)
          setRunError('')
        }}>Run</button>
      </header>
      <div className="container"
        onMouseUp={() => { setIsDragging(false) }}
        onMouseMove={(e) => {
          e.preventDefault()
          if (isDragging) {
            // console.log(e.clientX)
          }
        }}
      >
        <div className="editor" ref={resizeBarRef}>
          {runError && <div className="error">{runError}</div>}
          <Editor
            width="100%"
            height="100%"
            options={{
              minimap:{ enabled: false }
            }}
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value)}
          />
        </div>
        <div
          className="resize-bar"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
        >
        </div>
        <div className="sandbox">
          <iframe
            onLoad={e => {
              const iframeWin = e.target.contentWindow
              console.warn('iframeWin', iframeWin)
              iframeWin.require = window.require
            }}
            id="sandbox"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              border: 0,
              overflow: "hidden"
            }}
            srcDoc={`
              <html>
                <head>
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                    }
                  </style>
                </head>
                <body>
                  <script src="https://github.com/processing/p5.js/releases/download/v1.9.2/p5.min.js"></script>
                  <script>
                    window.require = window.parent.require;
                    try {
                      ${savedCode}
                    } catch (error) {
                      window.parent.postMessage({ type: "error", message: error.message }, "*")
                    }
                  </script>
                  <div id="root"></div>
                </body>
              </html>
            `}
          >
          </iframe>
        </div>
      </div>
    </div>
  );
}

export default App
