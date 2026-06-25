'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Signal, ScreenshotAnalysisResult } from '@/types';

interface ScreenshotAnalyzerProps {
  onSignalReceived?: (signal: Signal) => void;
}

export const ScreenshotAnalyzer = ({ onSignalReceived }: ScreenshotAnalyzerProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenshotAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeMB = parseFloat(process.env.NEXT_PUBLIC_MAX_SCREENSHOT_SIZE_MB || '10');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)');
      return;
    }

    setImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BOT_API_URL}/api/analyze-screenshot`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ screenshot_base64: base64 }),
          }
        );

        const data: ScreenshotAnalysisResult = await response.json();

        if (data.success) {
          setResult(data);
          onSignalReceived?.(data.signal!);
        } else {
          setError(data.message || 'Analysis failed');
        }
      };
      reader.readAsDataURL(image);
    } catch (err) {
      setError('Error uploading screenshot');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setPreview(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-card p-5">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="w-5 h-5 text-neon-green" />
        <h2 className="text-text-primary font-bold text-lg">Upload Chart Screenshot</h2>
      </div>

      {!preview && (
        <div
          className="border-2 border-dashed border-dark-border rounded-card p-8 text-center cursor-pointer hover:border-neon-green transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary font-medium">Drag and drop your chart screenshot here</p>
          <p className="text-text-tertiary text-body mt-1">or click to browse</p>
          <p className="text-text-tertiary text-small mt-3">Max size: {maxSizeMB}MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Chart preview"
              className="w-full rounded-card border border-dark-border"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            {!isLoading && !result && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 bg-alert-loss hover:bg-alert-loss/80 text-white p-2 rounded-btn"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-neon-green hover:bg-neon-green-hover disabled:bg-dark-border text-dark-bg font-semibold py-2 rounded-btn transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyze Chart
                </>
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-alert-loss/5 border border-alert-loss rounded-card p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-alert-loss flex-shrink-0 mt-0.5" />
          <p className="text-alert-loss">{error}</p>
        </div>
      )}

      {result && <AnalysisResult result={result} onClear={handleClear} />}
    </div>
  );
};

interface AnalysisResultProps {
  result: ScreenshotAnalysisResult;
  onClear: () => void;
}

const AnalysisResult = ({ result, onClear }: AnalysisResultProps) => {
  const verification = result.verification;
  const signal = result.signal;

  const getVerificationColor = (score: number) => {
    if (score >= 80) return 'text-neon-green';
    if (score >= 60) return 'text-alert-warning';
    return 'text-alert-loss';
  };

  return (
    <div className="mt-6 space-y-4">
      <div className={`rounded-card p-4 border ${verification.score >= 80 ? 'border-neon-green/30 bg-neon-green/5' : verification.score >= 60 ? 'border-alert-warning/30 bg-alert-warning/5' : 'border-alert-loss/30 bg-alert-loss/5'}`}>
        <div className="flex items-center gap-3 mb-3">
          {verification.score >= 60 ? (
            <CheckCircle className={`w-5 h-5 ${getVerificationColor(verification.score)}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${getVerificationColor(verification.score)}`} />
          )}
          <div>
            <p className="text-text-secondary text-body font-medium">Verification Score</p>
            <p className={`text-h2 font-bold ${getVerificationColor(verification.score)}`}>
              {verification.score}/100
            </p>
          </div>
        </div>
        <div className="space-y-2 text-body">
          <p className="text-text-tertiary">
            <span className="font-medium">Source:</span> {verification.data_source}
          </p>
          <p className="text-text-tertiary">
            <span className="font-medium">Confidence Boost:</span> {verification.confidence_boost}
          </p>
          {verification.vision_confidence !== undefined && (
            <p className="text-text-tertiary">
              <span className="font-medium">Chart Confidence:</span> {(verification.vision_confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      </div>

      <div className="bg-dark-sidebar rounded-card p-4">
        <p className="text-text-secondary font-medium mb-3">Signal Details</p>
        <div className="space-y-2 text-body">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Trend:</span>
            <span className="text-text-primary font-medium">{signal?.trend}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Support:</span>
            <span className="text-text-primary font-medium font-mono-num">${signal?.supportLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Resistance:</span>
            <span className="text-text-primary font-medium font-mono-num">${signal?.resistanceLevel}</span>
          </div>
        </div>
      </div>

      {verification.discrepancies && verification.discrepancies.length > 0 && (
        <div className="bg-dark-sidebar rounded-card p-4">
          <p className="text-text-secondary font-medium mb-3">Notes & Discrepancies</p>
          <ul className="space-y-2 text-body">
            {verification.discrepancies.map((disc: string, idx: number) => (
              <li key={idx} className="text-text-tertiary flex gap-2">
                <span className="text-alert-warning">•</span>
                {disc}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClear}
          className="flex-1 bg-dark-sidebar hover:bg-dark-card text-text-secondary font-semibold py-2 rounded-btn transition text-body"
        >
          Analyze Another
        </button>
        <button className="flex-1 bg-neon-green hover:bg-neon-green-hover text-dark-bg font-semibold py-2 rounded-btn transition text-body">
          Copy Signal
        </button>
      </div>
    </div>
  );
};
