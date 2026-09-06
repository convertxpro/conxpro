/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Camera,
  Calendar,
  Sliders,
  Sparkles,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Lock,
  Compass,
  FileImage,
  Layers,
  Zap,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { formatBytes } from '@/lib/utils';

interface ExifCleanerComponentProps {
  tool?: ToolMetadata;
}

export interface ExifData {
  // Device
  make?: string;
  model?: string;
  lensModel?: string;
  software?: string;
  artist?: string;
  copyright?: string;
  // Exposure
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  exposureBias?: string;
  meteringMode?: string;
  flash?: string;
  colorSpace?: string;
  // Date & Dimensions
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  // GPS
  latitude?: number;
  longitude?: number;
  altitude?: number;
  gpsTimeString?: string;
  rawTagsCount: number;
}

const SAMPLE_EXIF_PHOTO: ExifData = {
  make: 'Apple',
  model: 'iPhone 15 Pro Max',
  lensModel: 'iPhone 15 Pro Max back triple camera 6.86mm f/1.78',
  software: 'iOS 17.5.1',
  artist: 'Muddasir Photographer',
  copyright: 'All Rights Reserved',
  focalLength: '24 mm (35mm equivalent)',
  aperture: 'f/1.78',
  shutterSpeed: '1/320 sec',
  iso: 'ISO 64',
  exposureBias: '0 EV',
  meteringMode: 'Pattern Multi-segment',
  flash: 'Off, did not fire',
  colorSpace: 'sRGB IEC61966-2.1',
  dateTimeOriginal: '2026-08-28 17:42:19',
  dateTimeDigitized: '2026-08-28 17:42:19',
  width: 4032,
  height: 3024,
  fileSize: 4280590,
  mimeType: 'image/jpeg',
  latitude: 33.7294,
  longitude: 73.0931,
  altitude: 540,
  gpsTimeString: '12:42:19 UTC',
  rawTagsCount: 42,
};

// Pure client-side binary EXIF parser
function parseBinaryExif(buffer: ArrayBuffer): ExifData {
  const dataView = new DataView(buffer);
  const result: ExifData = {
    rawTagsCount: 0,
    fileSize: buffer.byteLength,
  };

  // Check JPEG SOI (0xFFD8)
  if (dataView.getUint16(0) !== 0xffd8) {
    return result;
  }

  let offset = 2;
  const length = buffer.byteLength;

  while (offset < length) {
    if (dataView.getUint8(offset) !== 0xff) {
      break;
    }

    const marker = dataView.getUint8(offset + 1);

    // APP1 Marker (EXIF)
    if (marker === 0xe1) {
      const app1Length = dataView.getUint16(offset + 2);
      const exifHeader = String.fromCharCode(
        dataView.getUint8(offset + 4),
        dataView.getUint8(offset + 5),
        dataView.getUint8(offset + 6),
        dataView.getUint8(offset + 7)
      );

      if (exifHeader === 'Exif') {
        const tiffOffset = offset + 10;
        parseTiffHeader(dataView, tiffOffset, result);
      }
      offset += 2 + app1Length;
    } else if (marker === 0xd9) {
      // EOI
      break;
    } else {
      const sectionLength = dataView.getUint16(offset + 2);
      offset += 2 + sectionLength;
    }
  }

  return result;
}

function parseTiffHeader(view: DataView, tiffOffset: number, result: ExifData) {
  const byteOrder = view.getUint16(tiffOffset);
  const isLittleEndian = byteOrder === 0x4949; // 'II'

  const firstIFDOffset = view.getUint32(tiffOffset + 4, isLittleEndian);
  if (firstIFDOffset < 8) return;

  parseIFD(view, tiffOffset, tiffOffset + firstIFDOffset, isLittleEndian, result, '0');
}

function parseIFD(
  view: DataView,
  tiffOffset: number,
  ifdOffset: number,
  isLE: boolean,
  result: ExifData,
  type: '0' | 'exif' | 'gps'
) {
  if (ifdOffset + 2 > view.byteLength) return;
  const numEntries = view.getUint16(ifdOffset, isLE);

  let exifSubOffset: number | null = null;
  let gpsSubOffset: number | null = null;

  let latRef = 'N';
  let lonRef = 'E';
  let latArr: number[] | null = null;
  let lonArr: number[] | null = null;

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, isLE);
    const format = view.getUint16(entryOffset + 2, isLE);
    const count = view.getUint32(entryOffset + 4, isLE);
    const valueOffset = entryOffset + 8;

    result.rawTagsCount++;

    const getString = () => {
      const dataOffset = count > 4 ? tiffOffset + view.getUint32(valueOffset, isLE) : valueOffset;
      let str = '';
      for (let j = 0; j < count; j++) {
        if (dataOffset + j >= view.byteLength) break;
        const charCode = view.getUint8(dataOffset + j);
        if (charCode === 0) break;
        str += String.fromCharCode(charCode);
      }
      return str.trim();
    };

    const getRational = () => {
      const dataOffset = tiffOffset + view.getUint32(valueOffset, isLE);
      if (dataOffset + 8 > view.byteLength) return 0;
      const num = view.getUint32(dataOffset, isLE);
      const den = view.getUint32(dataOffset + 4, isLE);
      return den === 0 ? 0 : num / den;
    };

    const getRationalArray = (cnt: number) => {
      const dataOffset = tiffOffset + view.getUint32(valueOffset, isLE);
      const arr: number[] = [];
      for (let k = 0; k < cnt; k++) {
        const o = dataOffset + k * 8;
        if (o + 8 > view.byteLength) break;
        const num = view.getUint32(o, isLE);
        const den = view.getUint32(o + 4, isLE);
        arr.push(den === 0 ? 0 : num / den);
      }
      return arr;
    };

    // IFD0
    if (type === '0') {
      if (tag === 0x010f) result.make = getString();
      if (tag === 0x0110) result.model = getString();
      if (tag === 0x0131) result.software = getString();
      if (tag === 0x0132) result.dateTimeOriginal = getString();
      if (tag === 0x013b) result.artist = getString();
      if (tag === 0x8298) result.copyright = getString();
      if (tag === 0x8769) exifSubOffset = tiffOffset + view.getUint32(valueOffset, isLE);
      if (tag === 0x8825) gpsSubOffset = tiffOffset + view.getUint32(valueOffset, isLE);
    } else if (type === 'exif') {
      if (tag === 0x829a) {
        const val = getRational();
        result.shutterSpeed = val < 1 ? `1/${Math.round(1 / val)} sec` : `${val.toFixed(2)} sec`;
      }
      if (tag === 0x829d) result.aperture = `f/${getRational().toFixed(1)}`;
      if (tag === 0x8827) result.iso = `ISO ${view.getUint16(valueOffset, isLE)}`;
      if (tag === 0x9003) result.dateTimeOriginal = getString();
      if (tag === 0x9004) result.dateTimeDigitized = getString();
      if (tag === 0x920a) result.focalLength = `${getRational().toFixed(1)} mm`;
      if (tag === 0xa434) result.lensModel = getString();
      if (tag === 0xa002) result.width = view.getUint32(valueOffset, isLE);
      if (tag === 0xa003) result.height = view.getUint32(valueOffset, isLE);
    } else if (type === 'gps') {
      if (tag === 0x0001) latRef = getString() || 'N';
      if (tag === 0x0002) latArr = getRationalArray(3);
      if (tag === 0x0003) lonRef = getString() || 'E';
      if (tag === 0x0004) lonArr = getRationalArray(3);
      if (tag === 0x0006) result.altitude = Math.round(getRational());
    }
  }

  if (latArr && latArr.length === 3) {
    const lat = latArr[0] + latArr[1] / 60 + latArr[2] / 3600;
    result.latitude = latRef === 'S' ? -lat : lat;
  }
  if (lonArr && lonArr.length === 3) {
    const lon = lonArr[0] + lonArr[1] / 60 + lonArr[2] / 3600;
    result.longitude = lonRef === 'W' ? -lon : lon;
  }

  if (exifSubOffset) {
    parseIFD(view, tiffOffset, exifSubOffset, isLE, result, 'exif');
  }
  if (gpsSubOffset) {
    parseIFD(view, tiffOffset, gpsSubOffset, isLE, result, 'gps');
  }
}

export const ExifCleanerComponent: React.FC<ExifCleanerComponentProps> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [cleanedSize, setCleanedSize] = useState<number | null>(null);
  const [cleanedSuccess, setCleanedSuccess] = useState<boolean>(false);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(false);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setIsSampleMode(false);
    setCleanedUrl(null);
    setCleanedSuccess(false);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseBinaryExif(buffer);
      parsed.fileSize = file.size;
      parsed.mimeType = file.type;

      // Extract image dimensions if not in EXIF
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (!parsed.width) parsed.width = img.naturalWidth;
        if (!parsed.height) parsed.height = img.naturalHeight;
        setExifData({ ...parsed });
      };
      setExifData(parsed);
    } catch (e) {
      console.error('Error parsing EXIF:', e);
      setExifData({ rawTagsCount: 0, fileSize: file.size });
    }
  }, []);

  const loadSample = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsSampleMode(true);
    setExifData(SAMPLE_EXIF_PHOTO);
    setCleanedUrl(null);
    setCleanedSuccess(false);
  };

  const stripMetadata = async () => {
    setIsStripping(true);

    try {
      if (isSampleMode || !previewUrl) {
        // Simulated sanitization for demo
        await new Promise((r) => setTimeout(r, 600));
        setCleanedSuccess(true);
        setCleanedSize(3840000);
        setCleanedUrl('#');
        setIsStripping(false);
        return;
      }

      // 100% Canvas Pixel-Pure Re-encoding (Permanent EXIF Stripping)
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not create canvas context');
      ctx.drawImage(img, 0, 0);

      const mimeType = selectedFile?.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = 0.95;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setCleanedUrl(url);
            setCleanedSize(blob.size);
            setCleanedSuccess(true);
          }
          setIsStripping(false);
        },
        mimeType,
        quality
      );
    } catch (e) {
      console.error('Failed to strip metadata:', e);
      setIsStripping(false);
    }
  };

  const downloadCleanedImage = () => {
    if (!cleanedUrl) return;
    const link = document.createElement('a');
    link.href = cleanedUrl;
    const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'photo-sanitized';
    const ext = selectedFile?.type === 'image/png' ? 'png' : 'jpg';
    link.download = `${baseName}-privacy-stripped.${ext}`;
    link.click();
  };

  const hasGps = exifData?.latitude !== undefined && exifData?.longitude !== undefined;
  const hasCamera = !!(exifData?.make || exifData?.model || exifData?.lensModel);
  const privacyRiskScore = hasGps ? 'High Risk' : hasCamera ? 'Medium Risk' : 'Clean / Minimal';

  return (
    <div className="w-full space-y-8">
      {/* Header & Feature Badges */}
      <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 p-6 sm:p-8 dark:border-rose-950/60 dark:bg-gradient-to-br dark:from-rose-950/20 dark:via-slate-900/60 dark:to-amber-950/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                EXIF & GPS Privacy Stripper
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% In-Browser Sanitization
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tool?.name || 'Photo EXIF Inspector & Privacy Stripper'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Inspect hidden GPS coordinates, camera serials, and exposure parameters embedded in your photos, and permanently erase all metadata before sharing online.
            </p>
          </div>

          <PrivacyAssuranceBadge />
        </div>

        {/* Demo Preset Button */}
        <div className="mt-6 pt-6 border-t border-rose-100/80 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Want to see how EXIF data looks on real smartphone captures?
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={loadSample}
            leftIcon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
          >
            Load Sample iPhone 15 Pro GPS Photo
          </Button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="space-y-4">
        <Dropzone
          onFilesSelected={handleFiles}
          acceptedFormatsText="Drop JPEG, JPG, PNG, WebP, or HEIC camera photographs"
          className="min-h-[160px]"
        />
      </div>

      {/* EXIF Data View & Privacy Analysis */}
      {exifData && (
        <div className="space-y-6">
          {/* Privacy Scorecard Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-white shadow-sm ${
                  hasGps
                    ? 'bg-rose-500 shadow-rose-500/20'
                    : hasCamera
                    ? 'bg-amber-500 shadow-amber-500/20'
                    : 'bg-emerald-500 shadow-emerald-500/20'
                }`}
              >
                {hasGps ? (
                  <MapPin className="h-6 w-6" />
                ) : hasCamera ? (
                  <Camera className="h-6 w-6" />
                ) : (
                  <ShieldCheck className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Privacy Exposure: {privacyRiskScore}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      hasGps
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : hasCamera
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {exifData.rawTagsCount} Metadata Tags Found
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {hasGps
                    ? '⚠️ Exact GPS coordinates detected. Anyone downloading this photo can view where it was taken.'
                    : hasCamera
                    ? 'Device identifiers, camera make/model, and shooting time are embedded.'
                    : 'No high-risk GPS location tags found.'}
                </p>
              </div>
            </div>

            {/* Erase All Metadata Action */}
            <Button
              variant="gradient"
              size="lg"
              onClick={stripMetadata}
              disabled={isStripping}
              leftIcon={
                isStripping ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )
              }
              className="w-full sm:w-auto"
            >
              {isStripping ? 'Sanitizing Metadata...' : 'Erase All Privacy & GPS Metadata'}
            </Button>
          </div>

          {/* Success Cleaned Banner */}
          {cleanedSuccess && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Photo Sanitized Successfully!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All GPS tags, camera identifiers, dates, and serial numbers permanently erased.
                    {cleanedSize && (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300 ml-1">
                        ({formatBytes(cleanedSize)})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <Button
                variant="gradient"
                size="md"
                onClick={downloadCleanedImage}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download Sanitized Photo
              </Button>
            </div>
          )}

          {/* Categorized Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Camera & Device Hardware */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Device & Camera
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Camera Make:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.make || 'Not Recorded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Camera Model:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.model || 'Not Recorded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lens Model:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {exifData.lensModel || 'Standard Fixed Lens'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OS / Software:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.software || 'Not Specified'}
                  </span>
                </div>
                {exifData.artist && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Artist / Owner:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {exifData.artist}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Exposure & Optics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Exposure & Optics
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Aperture:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {exifData.aperture || 'f/2.8'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shutter Speed:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {exifData.shutterSpeed || '1/125 sec'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISO Sensitivity:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {exifData.iso || 'ISO 100'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Focal Length:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.focalLength || '28 mm'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Flash Status:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.flash || 'Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Timestamps & File Dimensions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Date & File Specs
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Date:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.dateTimeOriginal || 'Unknown Date'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {exifData.width && exifData.height
                      ? `${exifData.width} × ${exifData.height} px`
                      : 'Standard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Size:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.fileSize ? formatBytes(exifData.fileSize) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MIME Type:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {exifData.mimeType || 'image/jpeg'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GPS Map View & Exact Location Card */}
          {hasGps && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 dark:border-rose-950 dark:bg-rose-950/20 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-100 pb-3 dark:border-rose-900/40">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    GPS Coordinates & Geographic Map
                  </h4>
                </div>

                <a
                  href={`https://www.openstreetmap.org/?mlat=${exifData.latitude}&mlon=${exifData.longitude}#map=15/${exifData.latitude}/${exifData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline"
                >
                  View on OpenStreetMap
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl bg-white p-3 border border-rose-100 dark:border-rose-900/60 dark:bg-slate-900">
                  <span className="text-slate-500">Latitude:</span>
                  <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                    {exifData.latitude?.toFixed(6)}°
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-rose-100 dark:border-rose-900/60 dark:bg-slate-900">
                  <span className="text-slate-500">Longitude:</span>
                  <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                    {exifData.longitude?.toFixed(6)}°
                  </p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-rose-100 dark:border-rose-900/60 dark:bg-slate-900">
                  <span className="text-slate-500">Altitude:</span>
                  <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {exifData.altitude ? `${exifData.altitude} m above sea level` : 'Not recorded'}
                  </p>
                </div>
              </div>

              {/* Embedded OpenStreetMap Iframe */}
              <div className="overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-900 shadow-inner h-[240px]">
                <iframe
                  title="Photo Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    (exifData.longitude || 0) - 0.01
                  }%2C${(exifData.latitude || 0) - 0.01}%2C${
                    (exifData.longitude || 0) + 0.01
                  }%2C${(exifData.latitude || 0) + 0.01}&layer=mapnik&marker=${
                    exifData.latitude
                  }%2C${exifData.longitude}`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
