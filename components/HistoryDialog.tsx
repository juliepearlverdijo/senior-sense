'use client';
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { HistoryItem, Insight } from '../lib/types'
import { configureStatusColor } from '@/lib/utils';

type HistoryDialogProps = {
  selectedConversation: HistoryItem | null
  setSelectedConversation: (conversation: HistoryItem | null) => void
}

export function HistoryDialog({ selectedConversation, setSelectedConversation }: HistoryDialogProps) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  
  const downloadAsPDF = (conversation: HistoryItem) => {
    const doc = new jsPDF()
    doc.setFontSize(16);
    doc.setTextColor(46, 70, 114);
    doc.setFont('Poppins', 'bold');
    doc.text('Conversation Details', 20, 20)
    
    doc.setFontSize(12);
    doc.setTextColor(213, 162, 178);
    doc.text('Raw Text:', 20, 40)
    const splitRawText = doc.splitTextToSize(conversation.rawText, 170);
    doc.setTextColor(0,0,0);
    doc.setFont('Poppins', 'normal');
    doc.text(splitRawText, 20, 45)

    doc.setTextColor(213, 162, 178);
    doc.setFont('Poppins', 'bold');
    doc.text('Care taker insights:', 20, 110);
    doc.setTextColor(0,0,0);
    doc.setFont('Poppins', 'normal');
    let yPosition = 120
    conversation.caretakerInsight.forEach((insight: Insight) => {
      const insightText = `${insight.title}: ${insight.time || ''} - ${insight.status}`
      const splitInsight = doc.splitTextToSize(insightText, 170)
      doc.text(splitInsight, 20, yPosition)
      yPosition += 10 * splitInsight.length
    })

    doc.save('conversation.pdf')
  }

  const appendMessages = (text: string) => {
    const messages = text.split('\n').filter(msg => msg.trim() !== '');

    messages.forEach((msg) => {
      const colonIndex = msg.indexOf(':');
      if (colonIndex !== -1) {
        const sender = msg.substring(0, colonIndex).trim();
        const message = msg.substring(colonIndex + 1).trim();
        
        const messageElem = document.createElement('div');
        const senderSpan = document.createElement('span');
        senderSpan.textContent = `${sender}:`;
        const messageContent = document.createElement('span');
        messageContent.textContent = message;

        if (sender === 'User') {
          messageElem.className = "message flex my-5 user-message gap-2 w-full";
          senderSpan.className = "message-sender w-1/4";
          messageContent.className = "message-content w-3/4";
        } else if (sender === 'AI Assist') {
          messageElem.className = "message flex my-5 ai-message gap-2 w-full";
          senderSpan.className = "message-sender w-1/4";
          messageContent.className = "message-content w-3/4";
        }

        messageElem.appendChild(senderSpan);
        messageElem.appendChild(messageContent);

        if(chatContainerRef.current && chatContainerRef.current.parentElement) {
          chatContainerRef.current.appendChild(messageElem);
          if(chatContainerRef.current.scrollHeight > 320) {
            chatContainerRef.current.parentElement.style.height = `320px`;
          } else {
            chatContainerRef.current.parentElement.style.height = `${chatContainerRef.current.scrollHeight}`;
          }
          //chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    });
  }

  useEffect(() => {
    if (selectedConversation) {
      const timer = setTimeout(() => {
        if (chatContainerRef.current) {
          const rawText = selectedConversation.rawText
          if(rawText.trim() !== '') {
            appendMessages(selectedConversation.rawText)
          } else {
            chatContainerRef.current.innerHTML = '';
          }
        }
      }, 0); 

      return () => clearTimeout(timer);
    }
  }, [selectedConversation]);

  return (
    <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
      <DialogContent className="bg-white text-gray-900" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-accent">Conversation Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden h-[70vh]">
          <div className="h-full overflow-y-scroll">
            <div>
              <h3 className="text-lg font-semibold text-primary pb-4">Raw Text</h3>
              <div className="text-black overflow-hidden">
                <div className="overflow-y-auto h-full" id="chat-container" ref={chatContainerRef}>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-primary">Care taker insight</h3>
              <div>
                {selectedConversation?.caretakerInsight && selectedConversation.caretakerInsight.length > 0 ? (
                  selectedConversation.caretakerInsight.map((insight: Insight, index: number) => (
                    <div className="border-b border-slate-300 py-3" key={index}>
                      <p className="font-semibold text-base">{insight.title}</p>
                      {insight.time && <p>{insight.time}</p>}
                      <p className={`${configureStatusColor(insight.status)}`}>{insight.status}</p>
                    </div>
                  ))
                ) : (
                  <p>No insights available.</p>
                )}
              </div>
            </div>
            <Button 
              onClick={() => selectedConversation && downloadAsPDF(selectedConversation)}
              disabled={!selectedConversation}
              className="mt-5"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}