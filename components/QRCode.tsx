import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext.tsx';

interface QRCodeProps {
  saleId: string;
  storeId: string;
  totalAmount: number;
  date: string;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ saleId, storeId, totalAmount, date }) => {
  const { settings } = useAppContext();
  const qrData = {
    saleId,
    storeId,
    totalAmount,
    date,
    storeName: settings?.name || 'Store',
    currency: settings?.currency || 'UZS'
  };

  const qrString = JSON.stringify(qrData);

  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isScanning) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setIsScanning(false);
        }
      };

      startCamera();

      const scanQR = () => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            // Here you would implement QR code decoding logic
            // For now, we'll just simulate scanning
            setTimeout(() => {
              const simulatedData = `https://soliq.uz/qr?data=${encodeURIComponent(qrString)}`;
              setScannedData(simulatedData);
              setIsScanning(false);
              window.location.href = simulatedData;
            }, 2000);
          }
        }
      };

      const interval = setInterval(scanQR, 1000);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <div className="mt-2 flex flex-col items-center">
      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
        <QRCodeSVG
          value={qrString}
          size={90}
          level="H"
          includeMargin={true}
          className="mb-2"
          title="Chek QR kodi"
        />
        
        <div className="text-center">
          <p className="text-xs font-bold text-blue-700 mb-1">SOLIQ INSPEKTSIYASI</p>
          <p className="text-xs text-gray-600 mb-1">Ushbu chek soliq.uz saytida</p>
          <p className="text-xs text-gray-600 mb-2">tasdiqlangan elektron hujjat</p>
          
          <button 
            onClick={() => setIsScanning(!isScanning)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            {isScanning ? "To'xtatish" : 'QR kodni skanerlash'}
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="mt-3 p-2 bg-gray-100 rounded-lg border border-gray-200 w-full">
          <div className="relative w-full">
            <video ref={videoRef} className="w-full rounded-lg" autoPlay playsInline />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-0" />
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">QR kodni kameraga to'g'ri yo'naltiring</p>
        </div>
      )}

      {scannedData && (
        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 w-full">
          <p className="text-center text-xs text-green-700">Skanerlangan ma'lumot: {scannedData}</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeComponent;