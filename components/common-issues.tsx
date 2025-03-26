"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Layers,
  Droplets,
  Unplug,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Grid3X3,
  SquareStack,
  Waves
} from "lucide-react"

interface IssueType {
  name: string
  description: string
  icon: React.ReactNode
}

interface CommonIssuesProps {
  onSelectIssue: (issue: string) => void
}

export function CommonIssues({ onSelectIssue }: CommonIssuesProps) {
  const commonIssues: IssueType[] = [
    {
      name: "Layer Shifting",
      description: "Print layers are misaligned",
      icon: <Layers className="h-4 w-4 mr-2" />
    },
    {
      name: "Stringing",
      description: "Thin strands between printed parts",
      icon: <Droplets className="h-4 w-4 mr-2" />
    },
    {
      name: "Warping",
      description: "Corners lifting off the bed",
      icon: <Unplug className="h-4 w-4 mr-2" />
    },
    {
      name: "Under-extrusion",
      description: "Gaps or weak layers in print",
      icon: <ArrowDownWideNarrow className="h-4 w-4 mr-2" />
    },
    {
      name: "Over-extrusion",
      description: "Excess material on surfaces",
      icon: <ArrowUpWideNarrow className="h-4 w-4 mr-2" />
    },
    {
      name: "Gaps in Top Layers",
      description: "Incomplete top surface",
      icon: <Grid3X3 className="h-4 w-4 mr-2" />
    },
    {
      name: "First Layer Issues",
      description: "Poor bed adhesion",
      icon: <SquareStack className="h-4 w-4 mr-2" />
    },
    {
      name: "Layer Adhesion",
      description: "Layers separating or weak prints",
      icon: <Waves className="h-4 w-4 mr-2" />
    },
  ]

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Common 3D Printing Issues</CardTitle>
        <CardDescription>Click on an issue to get help</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {commonIssues.map((issue) => (
            <Button
              key={issue.name}
              variant="outline"
              onClick={() => onSelectIssue(issue.name)}
              className="justify-start text-left h-auto py-3"
            >
              <div className="flex items-start">
                <span className="flex-shrink-0 mt-0.5">{issue.icon}</span>
                <div>
                  <div className="font-medium">{issue.name}</div>
                  <div className="text-xs text-muted-foreground">{issue.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

