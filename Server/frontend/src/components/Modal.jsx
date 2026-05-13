'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden"
        style={{
          background: 'rgb(16,17,17)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: 'rgba(0,0,0,0.6) 0px 0px 0px 2px, rgba(255,255,255,0.06) 0px 0px 40px, rgba(0,0,0,0.8) 0px 24px 64px',
        }}
      >
        <DialogHeader
          className="px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <DialogTitle
            className="font-display text-xl tracking-widest"
            style={{ color: '#f9f9f9' }}
          >
            {title?.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
