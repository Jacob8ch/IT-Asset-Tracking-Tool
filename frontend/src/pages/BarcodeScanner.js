import React, { useState, useRef } from 'react';
import { assetService } from '../services/api';
import { FiCamera, FiX } from 'react-icons/fi';

export default function BarcodeScanner() {
  const [scannedAsset, setScannedAsset] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleScan = async (barcode) => {
    setError('');
    try {
      const response = await assetService.scanBarcode(barcode);
      setScannedAsset(response.data);
    } catch (err) {
      setError('Asset not found. Please verify the barcode.');
      setScannedAsset(null);
    }
  };

  const handleManualInput = (e) => {
    if (e.key === 'Enter') {
      handleScan(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Barcode Scanner</h1>
        <p className="text-gray-400">Quickly scan or lookup asset barcodes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <FiCamera size={40} className="text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-4">Ready to Scan</h2>
            <p className="text-center text-gray-400 mb-6">
              Position the barcode in front of your scanner or enter it manually below
            </p>

            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="Barcode will appear here or enter manually..."
                onKeyDown={handleManualInput}
                className="glass-input text-center text-lg font-mono"
                autoFocus
              />

              {error && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
                  {error}
                </div>
              )}

              <button
                onClick={() => {
                  const value = inputRef.current.value;
                  if (value) {
                    handleScan(value);
                    inputRef.current.value = '';
                  }
                }}
                className="w-full glass-button"
              >
                Manual Lookup
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {scannedAsset ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Scanned Asset</h3>
                <button
                  onClick={() => {
                    setScannedAsset(null);
                    inputRef.current?.focus();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Asset Tag</p>
                  <p className="text-white font-mono font-bold">{scannedAsset.asset_tag}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Name</p>
                  <p className="text-white font-medium">{scannedAsset.asset_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className={`badge-${scannedAsset.status} px-3 py-1 rounded-full text-sm font-medium`}>
                    {scannedAsset.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Assigned To</p>
                  <p className="text-white font-medium">{scannedAsset.assigned_to_user || 'Unassigned'}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <a
                    href={`/assets/${scannedAsset.id}`}
                    className="flex-1 glass-button text-center py-2 text-sm"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <div className="text-gray-400">
                <FiCamera size={40} className="mx-auto mb-4 opacity-50" />
                <p>Scan a barcode to view asset details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
