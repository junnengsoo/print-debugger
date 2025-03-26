"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<string>
  fileUploaded: boolean
  initialMessage?: string
}

const STORAGE_KEY = "3d_print_chat_history"

export function ChatInterface({ onSendMessage, fileUploaded, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileUploadedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousInitialMessageRef = useRef<string>("")

  // Define handleSendMessage with useCallback before it's used in useEffect
  const handleSendMessage = useCallback(async () => {
    const messageText = inputRef.current?.value || input

    if (messageText.trim()) {
      const userMessage: Message = {
        role: "user",
        content: messageText,
        timestamp: Date.now()
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      setIsLoading(true)

      try {
        const assistantResponse = await onSendMessage(messageText)
        const assistantMessage: Message = {
          role: "assistant",
          content: assistantResponse,
          timestamp: Date.now()
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("Error sending message:", error)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: Date.now()
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }, [input, onSendMessage]);

  // Handle initialMessage changes - only update the input field, don't auto-send
  useEffect(() => {
    if (initialMessage && initialMessage.trim() !== '') {
      // Only update if the initialMessage has changed
      if (initialMessage !== previousInitialMessageRef.current) {
        previousInitialMessageRef.current = initialMessage;

        // Set the input value
        setInput(initialMessage);
        if (inputRef.current) {
          inputRef.current.value = initialMessage;
        }
      }
    }
  }, [initialMessage]);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY)

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as Message[]
        setMessages(parsedMessages)
      } catch (error) {
        console.error("Error parsing stored chat history:", error)
        // If there's an error parsing, add the welcome message
        addWelcomeMessage()
      }
    } else {
      // Add welcome message if no chat history exists
      addWelcomeMessage()
    }
  }, [])

  // Helper function to add welcome message
  const addWelcomeMessage = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your 3D printing assistant. Upload a 3MF file and ask me questions about your print or common 3D printing issues.",
        timestamp: Date.now()
      },
    ])
  }

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Add a message when a file is uploaded
  useEffect(() => {
    if (fileUploaded && !fileUploadedRef.current) {
      fileUploadedRef.current = true
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I see you've uploaded a 3MF file. What would you like to know about your 3D print?",
          timestamp: Date.now()
        },
      ])
    }
  }, [fileUploaded])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableParent = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      if (scrollableParent) {
        scrollableParent.scrollTop = scrollableParent.scrollHeight
      }
    }
  }, [messages, isLoading])

  // Track when input is changed by the user vs. prefilled programmatically
  useEffect(() => {
    const chatInput = inputRef.current

    if (chatInput) {
      const handleInputChange = () => {
        setInput(chatInput.value)
      }

      chatInput.addEventListener('input', handleInputChange)

      return () => {
        chatInput.removeEventListener('input', handleInputChange)
      }
    }
  }, [])

  // Clear chat history
  const clearChatHistory = () => {
    // Keep only the welcome message
    const welcomeMessage = {
      role: "assistant" as const,
      content: "Chat history cleared. How can I help you with your 3D printing?",
      timestamp: Date.now()
    }
    setMessages([welcomeMessage])
    // Reset file uploaded state
    fileUploadedRef.current = false
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md border rounded-lg">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="font-medium">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChatHistory}
          disabled={isLoading}
          className="text-xs h-7"
        >
          Clear Chat
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              } markdown-content`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-secondary text-secondary-foreground">
              <div className="flex items-center gap-2">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
            value={input}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

