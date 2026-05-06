// ES: Componente de escaneo de código de barras con cámara o entrada manual
// EN: Barcode scanning component with camera or manual input

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ErrorMessage from '../../shared/components/ErrorMessage';
import type { Product } from '../../core/types/product.types';

interface BarcodeScannerProps {
  onProductFound: (product: Product) => void;
  searchByBarcode: (barcode: string) => Promise<Product | null>;
  disabled?: boolean;
}

export default function BarcodeScanner({ onProductFound, searchByBarcode, disabled = false }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<{ reset: () => void; decodeFromVideoDevice: (...args: unknown[]) => Promise<unknown> } | null>(null);

  // ES: Limpia el lector de barcode al desmontar
  // EN: Cleans up barcode reader on unmount
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  // ES: Activa el escáner de cámara usando @zxing/browser
  // EN: Activates camera scanner using @zxing/browser
  const startCamera = useCallback(async () => {
    setError(null);
    setIsCameraActive(true);
    setIsScanning(true);

    try {
      // ES: Importación dinámica para evitar errores en entornos sin cámara
      // EN: Dynamic import to avoid errors in environments without camera
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const codeReader = new BrowserMultiFormatReader() as any;
      codeReaderRef.current = codeReader;

      if (!videoRef.current) return;

      await codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result, err) => {
          if (result) {
            const barcode = result.getText();
            codeReader.reset();
            setIsCameraActive(false);
            setIsScanning(false);

            const product = await searchByBarcode(barcode);
            if (product) {
              onProductFound(product);
            }
          }
          if (err && !(err instanceof Error && err.message.includes('No MultiFormat'))) {
            // ES: Ignorar errores de "no barcode found" durante el escaneo continuo
            // EN: Ignore "no barcode found" errors during continuous scanning
          }
        }
      );
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifique los permisos. / Could not access camera. Check permissions.');
      setIsCameraActive(false);
      setIsScanning(false);
    }
  }, [searchByBarcode, onProductFound]);

  // ES: Detiene el escáner de cámara
  // EN: Stops the camera scanner
  const stopCamera = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  }, []);

  // ES: Maneja la entrada manual de barcode con Enter
  // EN: Handles manual barcode input with Enter
  const handleManualInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manualBarcode.trim()) {
      setError(null);
      const product = await searchByBarcode(manualBarcode.trim());
      if (product) {
        onProductFound(product);
        setManualBarcode('');
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ES: Entrada manual de barcode / EN: Manual barcode input */}
      <div>
        <label htmlFor="barcode-input" className="block text-sm font-medium text-gray-700 mb-1">
          Código de Barras / Barcode
        </label>
        <div className="flex gap-2">
          <input
            id="barcode-input"
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyDown={handleManualInput}
            placeholder="Escanear o ingresar código (Enter) / Scan or enter code (Enter)"
            disabled={disabled}
            aria-label="Código de barras manual / Manual barcode"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {/* ES: Botón de cámara / EN: Camera button */}
          <button
            onClick={isCameraActive ? stopCamera : startCamera}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg font-medium transition-colors min-h-[44px] min-w-[44px] ${
              isCameraActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            } disabled:opacity-50`}
            aria-label={isCameraActive ? 'Detener cámara / Stop camera' : 'Activar cámara / Activate camera'}
          >
            {isCameraActive ? '⏹ Detener' : '📷 Cámara'}
          </button>
        </div>
      </div>

      {/* ES: Vista previa de cámara / EN: Camera preview */}
      {isCameraActive && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg border border-gray-300"
            aria-label="Vista previa de cámara para escaneo / Camera preview for scanning"
          />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                Escaneando... / Scanning...
              </div>
            </div>
          )}
        </div>
      )}

      {/* ES: Mensaje de error / EN: Error message */}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
