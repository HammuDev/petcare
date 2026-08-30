"use client"

import React, { useState, useRef, useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

// Extend Window interface to include Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Define proper types for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  messages: Message[];
  chatId?: string;
  sessionId: string;
}

const page = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [transcribedText, setTranscribedText] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const accumulatedTranscriptRef = useRef<string>('')
  const isRecordingRef = useRef<boolean>(false)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speechSynthRef = useRef<SpeechSynthesis | null>(null)
  useEffect(() => {
    initializeChatSession()
  }, [])

  const loadChatSessions = async () => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return

    try {
      const response = await fetch('/api/chat/sessions')
      if (response.ok) {
        const sessions = await response.json()
        setChatSessions(sessions)
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    }
  }

  const initializeChatSession = async () => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return

    try {
      // Generate or retrieve session ID
      let currentSessionId = sessionStorage.getItem('chatSessionId')
      if (!currentSessionId) {
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        sessionStorage.setItem('chatSessionId', currentSessionId)
      }
      setSessionId(currentSessionId)

      // Load existing chat history
      const response = await fetch(`/api/chat/history?sessionId=${currentSessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          setChatHistory(data.messages)
        }
      }

      // Load chat sessions for sidebar
      await loadChatSessions()
    } catch (err) {
      console.error('Failed to initialize chat session:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!sessionId || !content.trim()) return

    try {
      const response = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: content,
          role
        })
      })

      if (response.ok) {
        // Update local chat history
        const newMessage: Message = {
          role,
          content,
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, newMessage])
      }
    } catch (err) {
      console.error('Failed to save message:', err)
    }
  }

  const cleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('Error stopping recognition in cleanup:', err)
      }
    }

    // Cancel speech synthesis
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel()
    }

    // Clear any pending timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    // Reset recording state
    isRecordingRef.current = false
    setIsRecording(false)
  }

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return

    // Check if browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    // Configure speech recognition settings
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started')
    }

    recognitionRef.current.onaudiostart = () => {
      console.log('Audio capture started')
    }

    recognitionRef.current.onaudioend = () => {
      console.log('Audio capture ended')
    }

    recognitionRef.current.onspeechstart = () => {
      console.log('Speech detected')
    }

    recognitionRef.current.onspeechend = () => {
      console.log('Speech ended')
    }

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      console.log('Speech result received')

      let finalTranscript = ''
      let interimTranscript = ''

      // Process all results
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Update accumulated transcript with final results
      if (finalTranscript) {
        accumulatedTranscriptRef.current += finalTranscript + ' '
      }

      // Display current accumulated transcript plus interim
      const displayText = (accumulatedTranscriptRef.current + interimTranscript).trim()
      setTranscribedText(displayText)
    }

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)

      // Handle different error types
      if (event.error === 'aborted') {
        // This is expected when we manually stop
        return
      }

      if (event.error === 'no-speech' && isRecordingRef.current) {
        // Restart after no speech detected
        attemptRestart()
        return
      }

      // For other errors, show error message
      setError(`Speech recognition error: ${event.error}`)
    }

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended')

      // Only restart if we're still supposed to be recording
      if (isRecordingRef.current) {
        attemptRestart()
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis
    }

    return () => {
      cleanup()
    }
  }, [])

  const startRecording = () => {
    if (!recognitionRef.current) return

    console.log('Starting recording...')
    // Reset state
    setTranscribedText('')
    setAiResponse('')
    setError('')
    accumulatedTranscriptRef.current = ''
    isRecordingRef.current = true
    setIsRecording(true)

    try {
      recognitionRef.current.start()
    } catch (err: any) {
      console.error('Failed to start recording:', err)
      setError('Failed to start recording. Please try again.')
      isRecordingRef.current = false
      setIsRecording(false)
    }
  }

  const attemptRestart = () => {
    if (!isRecordingRef.current || !recognitionRef.current) return

    // Clear any existing timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
    }

    // Attempt restart with a small delay
    restartTimeoutRef.current = setTimeout(() => {
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          console.log('Restarting recognition...')
          recognitionRef.current.start()
        } catch (err) {
          console.error('Failed to restart recognition:', err)
          // If restart fails, try again after a longer delay
          restartTimeoutRef.current = setTimeout(attemptRestart, 1000)
        }
      }
    }, 100)
  }

  const stopRecording = () => {
    console.log('Stopping recording...')

    // Update recording state first
    isRecordingRef.current = false
    setIsRecording(false)

    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.error('Error stopping recording:', err)
      }
    }

    // Process the accumulated transcript
    setTimeout(async () => {
      const finalText = accumulatedTranscriptRef.current.trim()
      if (finalText) {
        console.log('Processing final text:', finalText)
        setTranscribedText(finalText)

        // Save user message to database
        await saveMessage(finalText, 'user')

        await handleSubmit(finalText)
      } else {
        setError('No speech was detected. Please try again.')
      }
    }, 300) // Small delay to ensure recognition has fully stopped
  }

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return

    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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", // Replace with your actual API key
          "HTTP-Referer": "http://localhost:3000", // Replace with your site URL
          "X-Title": "PetCare Chat", // Replace with your site name
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "x-ai/grok-4-fast:free",
          "messages": [
            {
              "role": "user",
              "content": text
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0]?.message?.content || 'No response from AI'

      setAiResponse(aiMessage)
      speakText(aiMessage)

      // Save AI response to database
      await saveMessage(aiMessage, 'assistant')

      // Clear current transcription and response states
      setTranscribedText('')
      setAiResponse('')
    } catch (err: any) {
      setError(`Failed to get AI response: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const stopSpeaking = () => {
    // Only run on client side
    if (typeof window === 'undefined' || !speechSynthRef.current) {
      return
    }

    // Cancel any ongoing speech
    speechSynthRef.current.cancel()
  }

  const speakText = (text: string) => {
    // Only run on client side
    if (typeof window === 'undefined' || !speechSynthRef.current) {
      setError('Text-to-speech is not supported in this browser.')
      return
    }

    // Cancel any ongoing speech
    speechSynthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    utterance.lang = 'en-US'

    utterance.onstart = () => {
      console.log('Speech synthesis started')
    }

    utterance.onend = () => {
      console.log('Speech synthesis ended')
    }

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      setError(`Speech synthesis error: ${event.error}`)
    }

    speechSynthRef.current.speak(utterance)
  }

  if (!isSupported) {
    return (
      <div className="font-sans text-gray-800 min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Not Supported</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="font-sans text-gray-800 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 w-full max-w-[100vw] overflow-x-hidden">
      <Header />

      <div className="flex h-[calc(100vh-80px)] w-full max-w-full overflow-x-hidden relative">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'w-80' : 'w-0 md:w-80'}
          bg-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden
          border-r border-gray-200 flex flex-col flex-shrink-0
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatSessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">No chat sessions yet</p>
                <p className="text-xs mt-1">Start a conversation to see it here</p>
              </div>
            ) : (
              chatSessions.map((session: any) => (
                <div
                  key={session.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                    ${selectedSessionId === session.id
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }
                  `}
                  onClick={() => {
                    setSelectedSessionId(session.id)
                    // Load messages for selected session
                    // This would typically load the full conversation
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm truncate flex-1">
                      {session.title || `Session ${session.id.slice(-8)}`}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {session.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {session.messageCount || 0} messages
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden overflow-y-auto">
          {/* Mobile Sidebar Toggle */}
          {!sidebarOpen && (
            <div className="md:hidden p-3.5 border-b border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-sm font-medium">Chat History</span>
              </button>
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-full overflow-x-hidden">
            {/* Main Recording Interface */}
            <div className="text-center mb-8 max-w-2xl w-full px-2 sm:px-4">
              <div className="mb-6">
                <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                  Voice Chat Assistant
                </h1>
                <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
                  Speak naturally and I'll help you with your pet care questions.
                </p>
              </div>

              {/* Recording Button */}
              <div className="relative mb-8 w-full flex flex-col items-center justify-center overflow-hidden py-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`
                    relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 transition-all duration-300 flex items-center justify-center mx-auto
                    ${isRecording
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-200/50 animate-pulse'
                      : 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 shadow-lg hover:shadow-xl hover:scale-105'
                    }
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Microphone Icon */}
                  <svg
                    className={`w-16 h-16 md:w-20 md:h-20 transition-colors duration-300 ${
                      isRecording ? 'text-red-500' : 'text-blue-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>

                  {/* Recording Animation Rings */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-red-200 animate-ping animation-delay-300"></div>
                      <div className="absolute inset-4 rounded-full border-4 border-red-100 animate-ping animation-delay-600"></div>
                    </>
                  )}
                </button>

                {/* Status Text */}
                <div className="mt-6 text-sm sm:text-base md:text-lg">
                  {isProcessing ? (
                    <span className="text-blue-600 flex items-center justify-center font-medium">
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing your message...
                    </span>
                  ) : isRecording ? (
                    <span className="text-red-600 font-medium">🎤 Recording... Click to stop and process</span>
                  ) : (
                    <span className="text-gray-600 font-medium">Click to start recording</span>
                  )}
                </div>
              </div>

              {/* Live Transcription Display */}
              {isRecording && transcribedText && (
                <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm max-w-lg mx-auto">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                    <h3 className="font-semibold text-yellow-800">Live transcription:</h3>
                  </div>
                  <p className="text-yellow-700 text-lg leading-relaxed">{transcribedText}</p>
                </div>
              )}

              {/* Final Transcribed Text Display */}
              {!isRecording && transcribedText && (
                <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    You said:
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{transcribedText}</p>
                </div>
              )}

              {/* AI Response Display */}
              {aiResponse && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm max-w-2xl mx-auto">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <h3 className="font-semibold text-blue-800">AI Response:</h3>
                  </div>
                  <p className="text-blue-700 text-lg leading-relaxed mb-4">{aiResponse}</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => speakText(aiResponse)}
                      disabled={isProcessing}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 8a9 9 0 110-18 9 9 0 010 18z" />
                      </svg>
                      <span>🔊 Repeat</span>
                    </button>
                    <button
                      onClick={stopSpeaking}
                      className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-7 3h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
                      </svg>
                      <span>⏹️ Stop</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-sm max-w-lg mx-auto">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-center text-sm text-gray-500 max-w-md mx-auto bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                <p className="mb-3 font-medium text-gray-700">How to use:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Click microphone to start</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Speak your message clearly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Click again to stop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>Wait for AI response</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default page