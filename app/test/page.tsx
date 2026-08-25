"use client"

import React, { useState, useRef, useEffect } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

// Your ElevenLabs credentials
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY // Replace with your actual API key
const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID // Replace with your actual Agent ID

const ChatPage = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState('Click the microphone to start conversation')
  const [error, setError] = useState('')
  const [conversationMessages, setConversationMessages] = useState<string[]>([])
  
  const conversationRef = useRef<any>(null)
  const isRecordingRef = useRef<boolean>(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize audio context
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (conversationRef.current) {
      try {
        conversationRef.current.endSession()
      } catch (err) {
        console.error('Error ending session:', err)
      }
      conversationRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }
  }

  const startConversation = async () => {
    try {
      setStatus('Requesting microphone access...')
      setError('')

      // Request microphone permissions explicitly FIRST
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log('Microphone access granted')
        // Keep the stream active - don't close it yet
        // The ElevenLabs SDK will use it
      } catch (micError: any) {
        console.error('Microphone access denied:', micError)
        setError('Microphone access is required. Please allow microphone permissions and try again.')
        setStatus('Microphone access denied')
        return
      }

      setStatus('Getting conversation token...')

      // Get conversation token from our API route
      const tokenResponse = await fetch(`/api/get-conversation-token?agentId=${ELEVENLABS_AGENT_ID}`)
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(`Failed to get conversation token: ${errorData.error}`)
      }

      const { token } = await tokenResponse.json()
      if (!token) {
        throw new Error('No conversation token received from server')
      }

      setStatus('Connecting to AI Assistant...')

      // Ensure audio context is resumed (required for some browsers)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      // Dynamic import of ElevenLabs SDK
      const { Conversation } = await import('@elevenlabs/client')

      conversationRef.current = await Conversation.startSession({
        conversationToken: token,
        onConnect: () => {
          console.log('Connected to ElevenLabs')
          setIsConnected(true)
          isRecordingRef.current = true
          setIsRecording(true)
          setStatus('🎤 Listening... Speak naturally')
        },
        onDisconnect: () => {
          setIsConnected(false)
          isRecordingRef.current = false
          setIsRecording(false)
          setStatus('Conversation ended - Click to start again')
        },
        onMessage: (message) => {
          console.log('Message received:', message)

          // Handle different message types based on source
          if (message.message && message.source === 'user') {
            // Handle user messages
            setStatus(`You: "${message.message}"`)
            setConversationMessages(prev => [...prev, `You: ${message.message}`])
          } else if (message.message && message.source === 'ai') {
            // Handle AI messages
            setStatus(`AI: "${message.message}"`)
            setConversationMessages(prev => [...prev, `AI: ${message.message}`])
          }
        },
      })

    } catch (error: any) {
      console.error('Failed to start conversation:', error)
      setError(`Failed to connect: ${error.message}. Please check your API credentials.`)
      setIsRecording(false)
      setIsConnected(false)
      isRecordingRef.current = false
      setStatus('Connection failed - Click to try again')
    }
  }

  const stopConversation = async () => {
    if (!conversationRef.current) return

    try {
      setStatus('Ending conversation...')
      await conversationRef.current.endSession()
      setIsRecording(false)
      setIsConnected(false)
      isRecordingRef.current = false
      setStatus('Conversation ended - Click to start new conversation')
    } catch (error) {
      console.error('Error ending conversation:', error)
      setError('Error ending conversation')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopConversation()
    } else {
      startConversation()
    }
  }

  const clearHistory = () => {
    setConversationMessages([])
  }

  return (
    <div className="font-sans text-gray-800 min-h-screen bg-white">
      <Header />

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
        {/* Main Interface */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            AI Voice Assistant
          </h1>
          <p className="text-slate-600 max-w-md">
            Powered by ElevenLabs Conversational AI
          </p>
        </div>

        {/* Recording Button */}
        <div className="relative mb-8">
          <button
            onClick={toggleRecording}
            className={`
              relative w-32 h-32 rounded-full border-4 transition-all duration-300 flex items-center justify-center
              ${isRecording
                ? 'border-red-500 bg-red-50 animate-pulse'
                : 'border-orange-400 bg-purple-50 hover:bg-purple-100'
              }
              cursor-pointer hover:scale-105
            `}
          >
            {/* Microphone Icon */}
            <svg
              className={`w-16 h-16 transition-colors duration-300 ${
                isRecording ? 'text-red-500' : 'text-[#B57DFF]'
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
                <div className="absolute inset-2 rounded-full border-4 border-red-200 animate-ping"></div>
              </>
            )}
          </button>

          {/* Status Text */}
          <div className="mt-4 text-center max-w-md">
            <p className={`text-sm font-medium ${
              error ? 'text-red-600' : 
              isRecording ? 'text-red-600' : 
              'text-slate-600'
            }`}>
              {status}
            </p>
            {isRecording && (
              <p className="text-xs text-slate-500 mt-2">
                Click again to end conversation
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 max-w-md w-full">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Conversation History */}
        {conversationMessages.length > 0 && (
          <div className="mb-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-700">Conversation History</h3>
              <button
                onClick={clearHistory}
                className="text-xs text-[#B57DFF] hover:text-[#B57DFF] underline"
              >
                Clear History
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg border p-4 max-h-64 overflow-y-auto space-y-2">
              {conversationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    msg.startsWith('You:')
                      ? 'bg-purple-100 text-[#B57DFF]'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <p className="text-sm">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-slate-500 max-w-md mt-4">
          <p className="mb-2">
            <strong>How to use:</strong>
          </p>
          <ol className="text-left space-y-1">
            <li>1. Click the microphone button to start</li>
            <li>2. Speak naturally - the AI will listen and respond</li>
            <li>3. The conversation flows with automatic turn-taking</li>
            <li>4. Click the button again to end the conversation</li>
          </ol>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ChatPage