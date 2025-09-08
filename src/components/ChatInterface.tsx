'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, Bot, User, FileText } from 'lucide-react';
import { Chat, FileAttachment } from '@/types';

interface ChatInterfaceProps {
  chat: Chat | null;
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  isLoading: boolean;
}

export default function ChatInterface({ chat, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || attachments.length > 0) {
      onSendMessage(input.trim(), attachments);
      setInput('');
      setAttachments([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const uploadPromises = [];
    
    try {
      for (const file of Array.from(files)) {
        // Check file size before upload (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const uploadPromise = fetch('/api/upload', {
          method: 'POST',
          body: formData,
        }).then(async (response) => {
          if (response.ok) {
            const attachment = await response.json();
            setAttachments(prev => [...prev, attachment]);
            return { success: true, file: file.name };
          } else {
            const errorText = await response.text();
            console.error('Upload failed:', errorText);
            return { success: false, file: file.name, error: errorText };
          }
        }).catch((error) => {
          console.error('Upload error:', error);
          return { success: false, file: file.name, error: error.message };
        });

        uploadPromises.push(uploadPromise);
      }

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      // Show results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        console.log(`Successfully uploaded ${successful.length} file(s)`);
      }
      
      if (failed.length > 0) {
        const failedFiles = failed.map(f => f.file).join(', ');
        alert(`Failed to upload: ${failedFiles}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <Bot size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Welcome to Groq AI Chatbot
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Start a new conversation to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {chat.title}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Model: {chat.model.split('/').pop()}
          </span>
          {chat.mode === 'reasoning' && (
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
              Reasoning Mode
            </span>
          )}
          {chat.webSearch && (
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              Web Search
            </span>
          )}
          {chat.browserSearch && (
            <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
              Browser Search
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="p-3 bg-gray-200 dark:bg-gray-600 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} />
                        <span className="text-sm font-medium">{attachment.name}</span>
                        <span className="text-xs opacity-75">
                          ({formatFileSize(attachment.size)})
                        </span>
                      </div>
                      {attachment.textContent && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs max-h-32 overflow-y-auto">
                          <div className="font-medium mb-1">File Content:</div>
                          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {attachment.textContent.length > 500 
                              ? `${attachment.textContent.substring(0, 500)}...` 
                              : attachment.textContent}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap">{message.content}</div>

              {/* Reasoning */}
              {message.reasoning && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100">
                    Show reasoning
                  </summary>
                  <div className="mt-2 p-3 bg-gray-200 dark:bg-gray-600 rounded text-sm">
                    <pre className="whitespace-pre-wrap">{message.reasoning}</pre>
                  </div>
                </details>
              )}

              <div className="text-xs opacity-75 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-gray-600 dark:text-gray-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span className="text-sm font-medium">{attachment.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(attachment.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ×
                  </button>
                </div>
                {attachment.textContent && (
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs max-h-24 overflow-y-auto">
                    <div className="font-medium mb-1 text-gray-600 dark:text-gray-400">Preview:</div>
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {attachment.textContent.length > 200 
                        ? `${attachment.textContent.substring(0, 200)}...` 
                        : attachment.textContent}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {isUploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Paperclip size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.txt,.doc,.docx,.md"
        />
      </div>
    </div>
  );
}
