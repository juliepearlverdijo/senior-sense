import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HistoryItem } from '../lib/types'
import { jsPDF } from 'jspdf'
import { Loader, Download } from 'lucide-react'
import { log } from '../lib/logger'

type SenseAnalysisModalProps = {
  isOpen: boolean
  onClose: () => void
  history: HistoryItem[]
}

type AnalysisResult = {
  time: {
    consistency: string
    typicalConversationTime: string
    durationInsight: string
    score: string
  }
  emotion: {
    consistency: string
    detectedEmotions: string[]
    score: string
  }
  alertness: {
    consistency: string
    contextualResponse: string
    score: string
  }
  medicalInformation: {
    painLevels: { status: string; description: string }
    medicationAdherence: { status: string; description: string }
    fatigueOrTiredness: { status: string; description: string }
  }
  supportSystemReliability: {
    caregiverAvailability: { status: string; description: string }
    trustInCaregivers: { status: string; description: string }
  }
  independenceAutonomy: {
    needForAssistance: { status: string; description: string }
    abilityToManageDailyTasks: { status: string; description: string }
  }
  emotionalMentalHealth: {
    emotionalWellbeing: { status: string; description: string }
    emotionalExpression: { status: string; description: string }
  }
  socialInteractionsIsolation: {
    communicationWithFamilyFriends: { status: string; description: string }
  }
  engagementInDailyActivities: {
    selfCare: { status: string; description: string }
  }
}

type StoredAnalysis = {
  result: AnalysisResult
  historyLength: number
  timestamp: number
}

type AnalysisItem = {
  status: string
  description?: string
}

export function SenseAnalysisModal({ isOpen, onClose, history }: SenseAnalysisModalProps) {
  const [analysisReport, setAnalysisReport] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.removeItem('senseAnalysis')
  }, [])

  useEffect(() => {
    if (isOpen && history.length >= 3) {
      const storedAnalysis = localStorage.getItem('senseAnalysis')
      if (storedAnalysis) {
        const parsedAnalysis: StoredAnalysis = JSON.parse(storedAnalysis)
        const currentTime = new Date().getTime()
        if (parsedAnalysis.historyLength === history.length && 
            currentTime - parsedAnalysis.timestamp < 24 * 60 * 60 * 1000) {
          setAnalysisReport(parsedAnalysis.result)
          return
        }
      }
      generateAnalysis()
    }
  }, [isOpen, history])

  const generateAnalysis = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const conversationTexts = history.map(item => ({
        text: item.rawText,
        timestamp: item.timestamp,
        duration: item.duration
      }))

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationTexts }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analysis')
      }

      const data: AnalysisResult = await response.json()
      setAnalysisReport(data)

      const storedAnalysis: StoredAnalysis = {
        result: data,
        historyLength: history.length,
        timestamp: new Date().getTime()
      }
      localStorage.setItem('senseAnalysis', JSON.stringify(storedAnalysis))
    } catch (err) {
      setError('An error occurred while generating the analysis. Please try again.')
      log.error('Analysis error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!analysisReport) return

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.setTextColor(46, 70, 114);
    doc.setFont('Helvetica', 'bold');
    doc.text('Sense Analysis Report', 20, 20)
    doc.setFontSize(12)

    let yPos = 40
    const addSection = (title: string, content: string) => {
      doc.setFontSize(14)
      doc.setTextColor(213, 162, 178);
      doc.setFont('Helvetica', 'bold');
      let titleCaseText = title
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
      .join(' ');
      doc.text(titleCaseText, 20, yPos)
      yPos += 10
      doc.setFontSize(12)
      const splitContent = doc.splitTextToSize(content, 170)
      doc.setTextColor(0,0,0);
      doc.setFont('Helvetica', 'normal');
      doc.text(splitContent, 20, yPos)
      yPos += splitContent.length * 7 + 5
    }

    Object.entries(analysisReport).forEach(([key, value]) => {
      if (hasValidAnalysis(value)) {
        const content = formatSectionContent(key, value)
        addSection(formatSectionTitle(key), content)
      }
    })

    doc.save('sense-analysis-report.pdf')
  }

  const hasValidAnalysis = (data: any): boolean => {
    if (typeof data === 'object' && data !== null) {
      return Object.values(data).some(value => 
        (typeof value === 'string' && value !== 'Not available') ||
        (Array.isArray(value) && value.length > 0 && value[0] !== 'Not available') ||
        (isAnalysisItem(value) && value.status !== 'Not available')
      )
    }
    return false
  }

  const isAnalysisItem = (value: any): value is AnalysisItem => {
    return typeof value === 'object' && value !== null && 'status' in value
  }

  const formatSectionTitle = (key: string): string => {
    const title = key.replace(/([A-Z])/g, ' $1').trim();
    const newTitle = title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return newTitle;
  }

  const formatSectionContent = (key: string, data: any): string => {
    let content = ''
    Object.entries(data).forEach(([subKey, value]) => {
      if (isAnalysisItem(value)) {
        if (value.status !== 'Not available') {
          content += `${formatSectionTitle(subKey)}:\nStatus: ${value.status}\n${value.description || 'No description available'}\n\n`
        }
      } else if (typeof value === 'string' && value !== 'Not available') {
        content += `${formatSectionTitle(subKey)}: ${value}\n`
      } else if (Array.isArray(value) && value.length > 0 && value[0] !== 'Not available') {
        content += `${formatSectionTitle(subKey)}: ${value.join(', ')}\n`
      }
    })
    return content.trim()
  }

  const renderAnalysisSection = (title: string, data: any) => {
    if (!hasValidAnalysis(data)) return null

    return (
      <div className="border p-4 rounded mb-4" key={title}>
        <h3 className="text-lg font-semibold text-primary capitalize pb-4">{formatSectionTitle(title)}</h3>
        {Object.entries(data).map(([key, value]: [string, any], index) => {
          if (isAnalysisItem(value)) {
            if (value.status !== 'Not available') {
              return (
                <div key={key + index} className="mb-2">
                  <p className="font-semibold capitalize">{formatSectionTitle(key)}:</p>
                  <p>Status: {value.status}</p>
                  <p>{value.description || 'No description available'}</p>
                </div>
              )
            }
          } else if (typeof value === 'string' && value !== 'Not available') {
            return (
              <div key={key + index} className="mb-2">
                <p className="font-semibold capitalize">{formatSectionTitle(key)}:</p>
                <p>{value}</p>
              </div>
            )
          } else if (Array.isArray(value) && value.length > 0 && value[0] !== 'Not available') {
            return (
              <div key={key + index} className="mb-2">
                <p className="font-semibold capitalize">{formatSectionTitle(key)}:</p>
                <p>{value.join(', ')}</p>
              </div>
            )
          }
          return null
        })}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-accent">Sense Analysis Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-gray-500">Generating analysis...</p>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : analysisReport ? (
            <>
              <div className="max-h-[60vh] overflow-y-auto space-y-4">
                {Object.entries(analysisReport).map(([key, value]) => 
                  renderAnalysisSection(key, value)
                )}
              </div>
              <Button onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </>
          ) : (
            <p>No analysis available. Please ensure you have at least 3 conversations in history.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}