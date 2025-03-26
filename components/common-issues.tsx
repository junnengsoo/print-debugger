"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Layers,
  Droplets,
  Unplug,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Grid3X3,
  SquareStack,
  Waves,
  ImageIcon
} from "lucide-react"

interface IssueType {
  name: string
  description: string
  icon: React.ReactNode
  imagePath: string
  detailedDescription?: string
}

interface CommonIssuesProps {
  onSelectIssue: (issue: string) => void
}

export function CommonIssues({ onSelectIssue }: CommonIssuesProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null)

  const commonIssues: IssueType[] = [
    {
      name: "Layer Shifting",
      description: "Print layers are misaligned",
      icon: <Layers className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/layer-shifting.jpg",
      detailedDescription: "Layer shifting occurs when the printer's print head or build plate moves unexpectedly during printing, causing the layers to be misaligned. This can result in a 'staircase' effect or complete print failure."
    },
    {
      name: "Stringing",
      description: "Thin strands between printed parts",
      icon: <Droplets className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/stringing.jpg",
      detailedDescription: "Stringing (or oozing) happens when small strings of plastic are left behind as the print head moves between different parts of the print. These thin strands look like spider webs between the printed parts."
    },
    {
      name: "Warping",
      description: "Corners lifting off the bed",
      icon: <Unplug className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/warping.jpg",
      detailedDescription: "Warping occurs when parts of your print, usually the corners or edges of the base, lift up from the print bed. This is caused by material shrinkage as it cools, creating internal stress in the print."
    },
    {
      name: "Under-extrusion",
      description: "Gaps or weak layers in print",
      icon: <ArrowDownWideNarrow className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/under-extrusion.jpg",
      detailedDescription: "Under-extrusion happens when the printer doesn't extrude enough filament. This results in gaps between layers, thin walls, or incomplete layers, creating a weak print with poor layer adhesion."
    },
    {
      name: "Over-extrusion",
      description: "Excess material on surfaces",
      icon: <ArrowUpWideNarrow className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/over-extrusion.jpg",
      detailedDescription: "Over-extrusion occurs when too much filament is extruded, creating excess material on the print surfaces. This can lead to dimensional inaccuracy, blob-like surfaces, and poor detail definition."
    },
    {
      name: "Gaps in Top Layers",
      description: "Incomplete top surface",
      icon: <Grid3X3 className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/gaps-top-layers.jpg",
      detailedDescription: "Gaps in top layers appear when the top surface of a print isn't fully solid. This creates holes or a mesh-like pattern on what should be a smooth, solid surface."
    },
    {
      name: "First Layer Issues",
      description: "Poor bed adhesion",
      icon: <SquareStack className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/first-layer-issues.jpg",
      detailedDescription: "First layer issues involve problems with the initial layer of the print adhering to the bed. This can appear as gaps, inconsistent extrusion, or the print detaching from the bed entirely."
    },
    {
      name: "Layer Adhesion",
      description: "Layers separating or weak prints",
      icon: <Waves className="h-4 w-4 mr-2" />,
      imagePath: "/images/issues/layer-adhesion.jpg",
      detailedDescription: "Layer adhesion problems occur when the layers of a print don't bond well together. This results in a print that can be easily split or broken along layer lines, significantly reducing strength."
    },
  ]

  const handleSelect = (issue: IssueType) => {
    onSelectIssue(issue.name);
  }

  const handleOpenDetail = (issue: IssueType) => {
    setSelectedIssue(issue);
  }

  return (
    <div>
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Common 3D Printing Issues</CardTitle>
          <CardDescription>Click an issue to get help or view example images</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonIssues.map((issue) => (
                <div key={issue.name} className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-32 bg-gray-100">
                    {/* This will display a placeholder if the image is not found */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
                      <ImageIcon className="h-8 w-8 mb-1" />
                      <span className="text-xs">Example image</span>
                    </div>
                    {/* Real image overlay */}
                    <Image
                      src={issue.imagePath}
                      alt={`Example of ${issue.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        // Keep the placeholder visible on error
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start mb-2">
                      <span className="flex-shrink-0 mt-0.5">{issue.icon}</span>
                      <div>
                        <div className="font-medium">{issue.name}</div>
                        <div className="text-xs text-muted-foreground">{issue.description}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleSelect(issue)}
                      >
                        Get Help
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(issue)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              {issue.icon}
                              <span className="ml-2">{issue.name}</span>
                            </DialogTitle>
                            <DialogDescription>
                              {issue.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="relative h-64 w-full my-4 bg-gray-100 rounded-md overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
                              <ImageIcon className="h-12 w-12 mb-2" />
                              <span className="text-sm">Example image not available</span>
                            </div>
                            <Image
                              src={issue.imagePath}
                              alt={`Example of ${issue.name}`}
                              fill
                              style={{ objectFit: 'contain' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          {issue.detailedDescription && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {issue.detailedDescription}
                            </p>
                          )}
                          <div className="mt-4">
                            <Button
                              className="w-full"
                              onClick={() => {
                                onSelectIssue(issue.name);
                                document.querySelector<HTMLButtonElement>('[data-state="open"][aria-label="Close"]')?.click();
                              }}
                            >
                              Get Help With This Issue
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

