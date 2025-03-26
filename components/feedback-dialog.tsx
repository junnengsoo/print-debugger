"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MessageSquareText, Mail, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"

interface FeedbackDialogProps {
  className?: string
}

// Contact email for feedback
const CONTACT_EMAIL = "soojunneng01@gmail.com"

export function FeedbackDialog({ className }: FeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const handleSubmit = async () => {
    // Don't submit if the form is empty
    if (!feedbackText && !rating) return

    setIsSubmitting(true)

    try {
      // In a real app, this would send the feedback to a server
      // For now, we'll just simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Switch to email mode
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      const feedbackContent = `
Rating: ${rating || "Not provided"}
Feedback: ${feedbackText || "Not provided"}
User Email: ${userEmail || "Not provided"}
      `.trim()

      await navigator.clipboard.writeText(feedbackContent)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text: ", error)
    }
  }

  const openEmailClient = () => {
    const subject = encodeURIComponent("3D Print Debugger Feedback")
    const body = encodeURIComponent(`
Rating: ${rating || "Not provided"}
Feedback: ${feedbackText || "Not provided"}
User Email: ${userEmail || "Not provided"}
    `.trim())

    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <MessageSquareText className="h-4 w-4 mr-2" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSubmitted ? "Send your feedback via email" : "Send Feedback"}</DialogTitle>
          <DialogDescription>
            {isSubmitted
              ? "Copy your feedback or open your email client to send it."
              : "Help us improve our 3D print debugger by sharing your experience."
            }
          </DialogDescription>
        </DialogHeader>

        {!isSubmitted ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">How helpful was the AI assistant?</Label>
              <RadioGroup
                value={rating}
                onValueChange={setRating}
                className="flex space-x-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="sr-only" />
                    <Label
                      htmlFor={`rating-${value}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-full cursor-pointer border ${
                        rating === value.toString() ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                      }`}
                    >
                      {value}
                    </Label>
                    {value === 1 && <span className="text-xs mt-1">Poor</span>}
                    {value === 5 && <span className="text-xs mt-1">Great</span>}
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feedback">Your feedback</Label>
              <Textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what went well or what we could improve..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Your email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Your Feedback</h4>
              <p className="text-sm mb-2"><strong>Rating:</strong> {rating || "Not provided"}</p>
              <p className="text-sm mb-2"><strong>Feedback:</strong> {feedbackText || "Not provided"}</p>
              {userEmail && <p className="text-sm"><strong>Email:</strong> {userEmail}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground mr-2">Send to:</p>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{CONTACT_EMAIL}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8"
                title="Copy feedback to clipboard"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {isSubmitted ? (
            <div className="flex gap-2 w-full justify-between sm:justify-end">
              <Button variant="outline" onClick={copyToClipboard}>
                {isCopied ? "Copied!" : "Copy Content"}
              </Button>
              <Button onClick={openEmailClient}>
                <Mail className="mr-2 h-4 w-4" />
                Open Email Client
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!feedbackText && !rating)}
            >
              {isSubmitting ? "Submitting..." : "Continue"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}