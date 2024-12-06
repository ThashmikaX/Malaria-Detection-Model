"use client";

import { SetStateAction, useState } from 'react';
import { Upload, X, Info, Shield, FileCheck, FileX } from 'lucide-react';
import * as Toast from '@radix-ui/react-toast';
import * as Tooltip from '@radix-ui/react-tooltip';
import Image from 'next/image';

interface ValidationResult {
  predicted_class: string;
  confidence_score: number;
}

const UI = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('svm');
  const [dragOver, setDragOver] = useState<boolean>(false);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    const selectedFile = (e as React.ChangeEvent<HTMLInputElement>).target?.files?.[0] 
      || (e as React.DragEvent<HTMLDivElement>).dataTransfer?.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setDragOver(false);
    } else {
      showToast('Please upload a valid image file');
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!file) {
      showToast('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`https://malaria-detection-model-production.up.railway.app/predict/${selectedModel}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Validation failed');

      const data = await response.json();

      const validationResult: ValidationResult = {
        predicted_class: data.class,
        confidence_score: data.confidence,
      };

      setResult(validationResult);
      showToast('Image processed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      showToast('Error validating image: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    setPreview('');
    setResult(null);
  };

  const showToast = (message: SetStateAction<string>) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  return (
    <Tooltip.Provider>
      <div className="max-w-full w-full pt-[500px] mx-auto p-6 h-full relative flex flex-col items-center bg-gradient-to-br  min-h-screen">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-900 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-blue-600" />
            Malaria Cell Detection
          </h1>

          {/* Model Selection with Tooltip */}
          <div className="w-full mb-6">
            <Tooltip.Root>
              <div className="flex items-center gap-2">
                <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">
                  Select Prediction Model
                </label>
                <Tooltip.Trigger>
                  <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content 
                    className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-50"
                    sideOffset={5}
                  >
                    Choose between Support Vector Machine (SVM) and Logistic Regression models
                  </Tooltip.Content>
                </Tooltip.Portal>
              </div>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-black"
              >
                <option value="svm">Support Vector Machine (SVM)</option>
                <option value="logistic">Logistic Regression</option>
              </select>
            </Tooltip.Root>
          </div>

          <div className="flex flex-col lg:flex-row w-full gap-6 items-center justify-center">
            {/* File Upload Area */}
            <div className="flex-1 w-full">
              <div
                className={`h-96 w-full relative p-4 border-2 ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg text-center cursor-pointer hover:border-blue-400 transition-all duration-300`}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(e);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!preview ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Upload className="h-16 w-16 text-blue-400 mb-4" />
                    <p className="text-gray-600 font-medium">
                      {dragOver ? 'Drop your image here' : 'Drag & drop your image or click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Supported formats: PNG, JPG, JPEG</p>
                  </div>
                ) : (
                  <div className="relative h-full">
                    <Image 
                      src={preview} 
                      alt="Preview" 
                      fill 
                      className="object-contain rounded-lg" 
                      priority 
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <div className="flex-1 w-full">
                <div className={`p-6 border rounded-lg shadow-lg transition-all duration-500 
                  ${result.predicted_class === 'Parasitized' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'}`}
                >
                  <h2 className="font-bold text-2xl mb-4 flex items-center gap-2 text-black">
                    {result.predicted_class === 'Parasitized' ? <FileX className="text-red-500" /> : <FileCheck className="text-green-500" />}
                    Detection Result
                  </h2>
                  <div className="space-y-3">
                    <p className="text-lg">
                      <strong className="text-gray-700">Prediction:</strong> 
                      <span className={result.predicted_class === 'Parasitized' ? 'text-red-600' : 'text-green-600'}>
                        {' '}{result.predicted_class}
                      </span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${result.predicted_class === 'Parasitized' ? 'bg-red-600' : 'bg-green-600'}`} 
                        style={{width: `${result.confidence_score * 100}%`}}
                      ></div>
                    </div>
                    <p className='text-black'>
                      <strong className="text-gray-700">Confidence:</strong> {(result.confidence_score * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validate Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-bold uppercase tracking-wider transition-all duration-300 
              ${!file || loading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
          >
            {loading ? 'Detecting...' : 'Detect Malaria'}
          </button>
          
          {/* Source Link */}
          <div className="mt-6 text-center">
            <a
              href="https://github.com/ThashmikaX/Malaria-Detection-Model"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 hover:underline text-sm flex items-center justify-center gap-2"
            >
              View Project on GitHub
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast.Provider>
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed top-4 right-4 border p-4 rounded-lg shadow-lg z-50 ${result?.predicted_class ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
        >
          <div className="flex items-center gap-3">
            {result?.predicted_class ? 
              <FileCheck className="w-6 h-6 text-green-600" /> : 
              <FileX className="w-6 h-6 text-red-600" />
            }
            <div>
              <Toast.Title className="font-bold text-lg">{result?.predicted_class ? 'Success' : 'Error'}</Toast.Title>
              <Toast.Description className="mt-1">
                {toastMessage}
              </Toast.Description>
            </div>
          </div>
          <Toast.Close className="absolute top-2 right-2 hover:opacity-70">✕</Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 w-full max-w-xs" />
      </Toast.Provider>
    </Tooltip.Provider>
  );
};

export default UI;