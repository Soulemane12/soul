'use client';

import { useState } from 'react';
import { X, Settings, Brain, Globe, Monitor } from 'lucide-react';
import { GROQ_MODELS, getModelById } from '@/lib/models';
import { Chat } from '@/types';

interface ChatSettingsProps {
  chat: Chat | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateChat: (updates: Partial<Chat>) => void;
}

export default function ChatSettings({ chat, isOpen, onClose, onUpdateChat }: ChatSettingsProps) {
  const [selectedModel, setSelectedModel] = useState(chat?.model || 'llama-3.3-70b-versatile');
  const [mode, setMode] = useState<'regular' | 'reasoning'>(chat?.mode || 'regular');
  const [webSearch, setWebSearch] = useState(chat?.webSearch || false);
  const [browserSearch, setBrowserSearch] = useState(chat?.browserSearch || false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);

  const selectedModelInfo = getModelById(selectedModel);

  const handleSave = () => {
    if (chat) {
      onUpdateChat({
        model: selectedModel,
        mode,
        webSearch,
        browserSearch,
      });
    }
    onClose();
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const modelInfo = getModelById(modelId);
    
    // Reset capabilities when model changes
    if (!modelInfo?.supportsReasoning) {
      setMode('regular');
    }
    if (!modelInfo?.supportsWebSearch) {
      setWebSearch(false);
    }
    if (!modelInfo?.supportsBrowserSearch) {
      setBrowserSearch(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chat Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              AI Model
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {GROQ_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {model.description}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {model.supportsReasoning && (
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                          <Brain size={12} className="inline mr-1" />
                          Reasoning
                        </span>
                      )}
                      {model.supportsWebSearch && (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                          <Globe size={12} className="inline mr-1" />
                          Web Search
                        </span>
                      )}
                      {model.supportsBrowserSearch && (
                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                          <Monitor size={12} className="inline mr-1" />
                          Browser Search
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          {selectedModelInfo?.supportsReasoning && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Chat Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="regular"
                    checked={mode === 'regular'}
                    onChange={(e) => setMode(e.target.value as 'regular')}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Regular Chat</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Standard conversational responses
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="reasoning"
                    checked={mode === 'reasoning'}
                    onChange={(e) => setMode(e.target.value as 'reasoning')}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Reasoning Mode</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Step-by-step analysis and problem solving
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Search Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Search Capabilities</h3>
            
            {selectedModelInfo?.supportsWebSearch && (
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe size={16} />
                    Web Search
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Access real-time web information
                  </div>
                </div>
              </label>
            )}

            {selectedModelInfo?.supportsBrowserSearch && (
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserSearch}
                  onChange={(e) => setBrowserSearch(e.target.checked)}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Monitor size={16} />
                    Browser Search
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Interactive web browsing and navigation
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens: {maxTokens}
              </label>
              <input
                type="range"
                min="100"
                max="8192"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
