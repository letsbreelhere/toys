import { useRef, useState, useEffect } from 'react'
import './App.scss'
import Editor from '@monaco-editor/react'
import { debounce } from 'lodash'

const App = () => {
  const [isDragging, setIsDragging] = useState(false)
  const sandboxRef = useRef(null)
  const editorRef = useRef(null)
  const iframeRef = useRef(null)
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

  const drag = debounce((e) => {
    e.preventDefault()
    if (isDragging) {
      const newPercent = 100*(window.innerWidth - e.clientX)/window.innerWidth;
      editorRef.current.style.width = `${100 - newPercent}%`
      sandboxRef.current.style.width = `${newPercent}%`
    }
  }, 0)


  return (
    <div className="App"
      onMouseUp={() => {
        setIsDragging(false)
        iframeRef.current.style.pointerEvents = 'auto'
      }}
      onMouseMove={(e) => { drag(e) }}
    >
      <header>
        <button onClick={() => {
          setSavedCode(code)
          setRunError('')
        }}>Run</button>
      </header>
      <div className="container">
        <div className="editor"
          ref={editorRef}
        >
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
            iframeRef.current.style.pointerEvents = 'none'
          }}
        >
        </div>
        <div className="sandbox" ref={sandboxRef}>
          <iframe
            ref={iframeRef}
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
