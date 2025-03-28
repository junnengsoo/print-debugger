"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/file-upload"
import { ChatInterface } from "@/components/chat-interface"
import { CommonIssues } from "@/components/common-issues"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OpenAI from "openai"
import { extractSlicingParameters, formatSlicingParameters } from "@/lib/3mf-utils"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { Button } from "@/components/ui/button"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

interface FileMetadata {
  name: string
  size: string
  type: string
  lastModified: string
}

interface SlicingParameters {
  [key: string]: string | number | boolean | object
}

// Update our ChatMessage type to align with OpenAI's types
type ChatMessage = ChatCompletionMessageParam

// Add ChatHistory type for tracking the conversation
interface ChatHistory {
  messages: ChatMessage[]
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [slicingParameters, setSlicingParameters] = useState<SlicingParameters | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [
      {
        role: "system",
        content: `You are a knowledgeable AI assistant integrated into a 3D printing slicer.
        The user reports a printing issue. Your task is to guide the user through the troubleshooting process.

        Follow these steps:
        1. Determine if the print issue the user reported is clear. If not, respond with a message asking the user to clarify their intent.
        2. Examine the slicing parameters and determine if any of them could be causing the issue.
        3. If nothing stands out in the slicing parameters, determine other possible causes of the print issue, and how likely each cause is to be the issue.
        4. In your response, list the possible causes of the print issue by order of likelihood.
        5. Starting with the most likely cause:
            - If it's related to a parameter you can already see, suggest specific adjustments with target values.
            - If it's related to something not visible in the parameters, ask specific diagnostic questions.
        6. Focus only on the SINGLE most likely cause for immediate action:
            - If it requires parameter adjustment, suggest to the user to change their parameter values.
            - If it requires diagnostic information, ask a specific question about it: "Does your print show [specific symptom]?" or "Have you checked [specific hardware component]?"
        7. Wait for the user to respond about this single most likely cause before discussing other causes.
        8. After suggesting a possible cause, ask the user if this resolved their issue.

        Respond in a direct and engaging manner.
        - Avoid referring to 'the user' and speak naturally.
        - Avoid revealing your internal logic.`
      }
    ] as ChatMessage[]
  })

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)
    setIsAnalyzing(true)
    setAnalysisError(null)

    // Extract basic metadata from the file
    const metadata: FileMetadata = {
      name: uploadedFile.name,
      size: formatFileSize(uploadedFile.size),
      type: uploadedFile.type || "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
      lastModified: new Date(uploadedFile.lastModified).toLocaleString(),
    }
    setFileMetadata(metadata)

    try {
      // Extract slicing parameters from the 3MF file
      const parameters = await extractSlicingParameters(uploadedFile)
      setSlicingParameters(parameters)

      if (parameters) {
        // Add the slicing parameters to the chat history when they are loaded
        const formattedParameters = formatSlicingParameters(parameters)
        setChatHistory(prev => ({
          messages: [
            ...prev.messages,
            {
              role: "system",
              content: `The user has uploaded a 3MF file with the following slicing parameters:\n\n${formattedParameters}`
            } as ChatMessage
          ]
        }))
      } else {
        setAnalysisError("Could not find slicing parameters in the 3MF file. Make sure the file contains a project_settings.config in the Metadata directory.")
      }
    } catch (error) {
      console.error("Error extracting slicing parameters:", error)
      setAnalysisError("Error extracting slicing parameters from the 3MF file")
    } finally {
      setIsAnalyzing(false)
      setFileUploaded(true)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      if (!file) {
        return "Please upload a 3MF file first so I can help you debug your 3D print."
      }

      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        return "Error: OpenAI API key is missing. Please add your API key to the .env.local file as NEXT_PUBLIC_OPENAI_API_KEY."
      }

      // Add the user message to chat history
      const userMessage: ChatMessage = { role: "user", content: message };
      const updatedHistory = {
        messages: [...chatHistory.messages, userMessage]
      };
      setChatHistory(updatedHistory);

      // Use the OpenAI API with the full conversation history
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: updatedHistory.messages,
      });

      // Get the AI response
      const assistantMessage = response.choices[0]?.message.content || "I couldn't generate a response. Please try again.";

      // Add the assistant response to chat history
      setChatHistory(prev => ({
        messages: [
          ...prev.messages,
          { role: "assistant", content: assistantMessage } as ChatMessage
        ]
      }))

      return assistantMessage;

    } catch (error) {
      console.error("Error generating response:", error)
      return "I'm sorry, I encountered an error while processing your request. Please make sure you have set up your OpenAI API key in the .env.local file."
    }
  }

  const handleSelectIssue = (issue: string) => {
    const question = `I'm having ${issue.toLowerCase()}, how can I fix it?`;

    // Always set the current question so the input field gets populated
    setCurrentQuestion(question);

    // Only send the message directly if a file is uploaded
    if (fileUploaded && file) {
      handleSendMessage(question);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>3D Print Debugger</CardTitle>
            <CardDescription>Upload your 3MF file and chat with an AI to debug your 3D print</CardDescription>
          </div>
          <FeedbackDialog className="ml-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 lg:overflow-y-auto lg:max-h-[700px]">
              {!fileUploaded ? (
                // Show only the upload tab if no file is uploaded yet
                <div>
                  <h3 className="text-lg font-medium mb-4">Upload a 3MF File</h3>
                  <FileUpload onFileUpload={handleFileUpload} />

                  {isAnalyzing && (
                    <div className="mt-4">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Analyzing 3MF file...
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                // Show file info and common issues after upload
                <div className="flex flex-col gap-6">
                  {analysisError && (
                    <div className="mb-4">
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {analysisError}
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6">
                    {/* File Information */}
                    {fileMetadata && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">3MF File Information</h3>
                        <div className="bg-gray-800 text-white p-3 rounded-md flex items-center justify-between">
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">
                              {fileMetadata.name}
                            </p>
                            <p className="text-xs text-gray-300">
                              Last modified: {fileMetadata.lastModified}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-white hover:text-gray-200 h-7 ml-2"
                            onClick={() => {
                              setFile(null);
                              setFileMetadata(null);
                              setSlicingParameters(null);
                              setFileUploaded(false);
                              setAnalysisError(null);
                            }}
                          >
                            Upload New
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Common Issues Section */}
                    <div className="flex-1">
                      <CommonIssues onSelectIssue={handleSelectIssue} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 lg:sticky lg:top-4 self-start">
              <ChatInterface
                onSendMessage={handleSendMessage}
                fileUploaded={fileUploaded}
                initialMessage={currentQuestion}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

