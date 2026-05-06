// ES: Componente de escaneo de código de barras (manual + cámara)
// EN: Barcode scanning component (manual + camera)

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Camera, CameraOff, Hash } from 'lucide-react'
import { ErrorMessage } from '../../shared/components/ErrorMessage'
import type { Product } from '../../core/types/product.types'
import { productApiAdapter } from '../../adapters/http/productApiAdapter'
import { getErrorMessage } from '../../infrastructure/http/ApiError'

interface BarcodeScannerProps {
  onProductFound: (product: Product) => void
}

export function BarcodeScanner({ onProductFound }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<import('@zxing/browser').BrowserMultiFormatReader | null>(null)

  const searchBarcode = async (barcode: string) => {
    if (!barcode.trim()) return
    setIsSearching(true)
    setError(null)
    try {
      const product = await productApiAdapter.searchByBarcode(barcode.trim())
      onProductFound(product)
      setManualBarcode('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSearching(false)
    }
  }

  const handleManualKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchBarcode(manualBarcode)
    }
  }

  const startCamera = async () => {
    setError(null)
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader
      setIsCameraActive(true)

      if (videoRef.current) {
        await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result) {
            searchBarcode(result.getText())
            stopCamera()
          }
        })
      }
    } catch {
      setError('No se pudo acceder a la cámara / Could not access camera')
      setIsCameraActive(false)
    }
  }

  const stopBarcodeReader = (reader: import('@zxing/browser').BrowserMultiFormatReader | null) => {
    if (!reader || typeof reader !== 'object') return
    const r = reader as unknown as { reset?: () => void; stopContinuousDecode?: () => void }
    r.reset?.()
    r.stopContinuousDecode?.()
  }

  const stopCamera = () => {
    stopBarcodeReader(codeReaderRef.current)
    codeReaderRef.current = null
    setIsCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopBarcodeReader(codeReaderRef.current)
      codeReaderRef.current = null
    }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* ES: Entrada manual de barcode / EN: Manual barcode input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyDown={handleManualKeyDown}
            placeholder="Código de barras ↵"
            className="pos-input-search py-3 text-base"
            aria-label="Ingresar código de barras manualmente / Enter barcode manually"
            disabled={isSearching}
          />
        </div>
        <button
          type="button"
          onClick={isCameraActive ? stopCamera : startCamera}
          className={`flex min-h-[44px] min-w-[48px] items-center justify-center rounded-xl px-3 text-white shadow-md transition hover:brightness-105 ${
            isCameraActive
              ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20'
              : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-slate-500/25'
          }`}
          aria-label={
            isCameraActive
              ? 'Detener cámara / Stop camera'
              : 'Activar cámara / Activate camera'
          }
        >
          {isCameraActive ? (
            <CameraOff className="h-5 w-5" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>
      </div>

      {isCameraActive && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner shadow-black/40 ring-4 ring-black/40">
          <video
            ref={videoRef}
            className="w-full opacity-95"
            aria-label="Vista previa de cámara para escaneo / Camera preview for scanning"
          />
          <p className="bg-black/70 py-2.5 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
            Apunte al código / Point at barcode
          </p>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  )
}
