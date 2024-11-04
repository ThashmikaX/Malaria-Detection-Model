"use client";

import { SetStateAction, useState } from 'react';
import { Upload, X } from 'lucide-react';
import * as Toast from '@radix-ui/react-toast';
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

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    const selectedFile = (e as React.ChangeEvent<HTMLInputElement>).target?.files?.[0] 
      || (e as React.DragEvent<HTMLDivElement>).dataTransfer?.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
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
      const response = await fetch('https://malaria-detection-model-production.up.railway.app/predict/svm', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Validation failed');

      const data = await response.json();

      // Map the response to the simplified ValidationResult interface
      const validationResult: ValidationResult = {
        predicted_class: data.class,
        confidence_score: data.confidence,
      };

      setResult(validationResult);
      showToast('Image processed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      showToast('Error validating poster: ' + errorMessage);
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
    <div className="max-w-4xl mx-auto p-6 h-full relative flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Malaria Detection using Cell Images</h1>

      <div className={`flex flex-col lg:flex-row w-full ${result ? 'items-center justify-center gap-x-2' : 'justify-center items-center'}`}>
        {/* Image Upload Component */}
        <div
          className={`flex-1 transition-all duration-500 transform h-full ${result ? 'lg:-translate-x-20' : 'flex justify-center items-center h-full'}`}
        >
          <div
            className="h-full w-full lg:w-5/6 relative p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-gray-400 hover:shadow-lg transition-shadow duration-300"
            onDrop={handleFileChange}
            onDragOver={(e) => e.preventDefault()}
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
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">Drag & drop your image here or click to upload</p>
              </div>
            ) : (
              <div className="relative">
                {file && <Image src={preview} alt="Preview" width={500} height={500} className="max-w-full h-auto" />}
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Conditionally Render Result Display */}
        {result && (
          <div className={`flex-1 mt-6 lg:mt-0 transition-all duration-500 transform lg:translate-x-20 opacity-100`}>
            <div className="p-6 border rounded-lg shadow-lg transition duration-300 ease-in-out transform translate-x-0">
              <h2 className="font-bold text-xl mb-2 text-gray-800">Result</h2>
              <p className="mb-1"><strong>Prediction:</strong> {result.predicted_class}</p>
              <p><strong>Confidence Score:</strong> {result.confidence_score.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Validate Button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full mt-6 py-2 px-4 rounded ${!file || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold transition-colors`}
      >
        {loading ? 'Detecting...' : 'Detect'}
      </button>
      
      {/* Source Link */}
      <a
        href="https://github.com/ThashmikaX/Malaria-Detection-Model"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-blue-500 hover:underline text-sm"
      >
        Source of the project
      </a>

      {/* Toast Notification */}
      <Toast.Provider>
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed top-4 right-4 border p-4 rounded shadow-lg ${result?.predicted_class ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}
        >
          <Toast.Title className="font-bold text-lg">{result?.predicted_class ? 'Success' : 'Error'}</Toast.Title>
          <Toast.Description className="mt-2">
            {toastMessage}
          </Toast.Description>
          <Toast.Close className="absolute top-2 right-2 text-white">✕</Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 w-full max-w-xs" />
      </Toast.Provider>
    </div>
  );
};

export default UI;
