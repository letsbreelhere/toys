import { useState, useEffect, useRef } from 'react'
import './App.css'
import SCRABBLE_WORDS from '../public/scrabble.json'

const MORSE_CODE = {
  a: '.-',
  b: '-...',
  c: '-.-.',
  d: '-..',
  e: '.',
  f: '..-.',
  g: '--.',
  h: '....',
  i: '..',
  j: '.---',
  k: '-.-',
  l: '.-..',
  m: '--',
  n: '-.',
  o: '---',
  p: '.--.',
  q: '--.-',
  r: '.-.',
  s: '...',
  t: '-',
  u: '..-',
  v: '...-',
  w: '.--',
  x: '-..-',
  y: '-.--',
  z: '--..',
  0: '-----',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
}

type Morsable = keyof typeof MORSE_CODE

const wordToMorse = (word: Morsable[]): string => {
  let result = ''
  for (const letter of word) {
    const morseLetter = MORSE_CODE[letter]
    if (morseLetter) {
      result += morseLetter + ' '
    }
  }
  return result
}

class AudioManager {
  private audioContext: AudioContext | null = null
  private oscillator: OscillatorNode | null = null
  private stopped: boolean = false
  private currentTimeout: NodeJS.Timeout | null = null

  play(length: number, callback: () => void): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }

    if (this.stopped) {
      return
    }

    this.oscillator = this.audioContext.createOscillator()
    this.oscillator.type = 'sine'
    this.oscillator.frequency.value = 800
    this.oscillator.connect(this.audioContext.destination)
    this.oscillator.start()
    this.currentTimeout = setTimeout(() => {
      this.oscillator?.stop()
      callback()
    }, length)
  }

  stop() {
    this.oscillator?.stop()
    this.audioContext?.close()
    this.stopped = true
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
    }

    this.audioContext = new AudioContext()
  }

  restart() {
    this.stopped = false
  }

  playBinary(segments: [number, boolean][], callback: () => void): void {
    if (segments.length === 0 || this.stopped) {
      callback()
      return
    }

    const [len, on] = segments.shift()!

    const next = () => this.playBinary(segments, callback)

    if (on) {
      return this.play(len, next)
    } else {
      this.currentTimeout = setTimeout(next, len)
    }
  }

  playMorse(morse: string, ditLength: number, callback: () => void): void {
    const morseArray = morse.split('')
    let segments: [number, boolean][] = []
    for (const morseChar of morseArray) {
      if (morseChar === '.') {
        segments.push([ditLength, true])
      } else if (morseChar === '-') {
        segments.push([ditLength * 3, true])
      } else if (morseChar === ' ') {
        segments.push([ditLength, false])
      } else if (morseChar === '/') {
        segments.push([ditLength * 6, false])
      }
      segments.push([ditLength, false])
    }

    this.playBinary(segments, callback)
  }
}

const App: React.FC = () => {
  const [maxWordLength, setMaxWordLength] = useState<number>(5)
  const [randomWord, setRandomWord] = useState<string>('')
  const [guess, setGuess] = useState<string>('')
  const [ditLength, setDitLength] = useState<number>(100)

  const [playing, setPlaying] = useState<boolean>(false)

  const audioManager = useRef(new AudioManager())
  
  const chooseWord = () => {
    let word
    while (!word || word.length > maxWordLength) {
      word = SCRABBLE_WORDS[Math.floor(Math.random() * SCRABBLE_WORDS.length)]
    }
    setRandomWord(word)
  }

  useEffect(chooseWord, [maxWordLength])

  const submitGuess = () => {
    if (guess === randomWord) {
      alert('Correct!')
    } else {
      alert('Try again')
    }
  }

  return (
    <div>
      <div>
        <label>Max Word Length</label>
        <input
          type="range"
          min="2"
          max="15"
          step="1"
          value={maxWordLength}
          onChange={e => setMaxWordLength(parseInt(e.target.value))}
        />
        <div>{maxWordLength}</div>
      </div>
      <div>
        <label>Dit Length</label>
        <input
          type="range"
          min="50"
          max="500"
          step="10"
          value={ditLength}
          onChange={e => setDitLength(parseInt(e.target.value))}
        />
        <div>{ditLength}ms</div>
      </div>
      <div>
        <button
          onClick={() => {
            if (playing) {
              audioManager.current.stop()
              setPlaying(false)
            } else {
              audioManager.current.restart()
              audioManager.current.playMorse(
                wordToMorse(randomWord.split('')),
                ditLength,
                () => setPlaying(false)
              )
              setPlaying(true)
            }
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={chooseWord}
        >
          New Word
        </button>
      </div>

      <div>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <button onClick={submitGuess}>
          Guess
        </button>
      </div>
    </div>
  )
}

export default App
