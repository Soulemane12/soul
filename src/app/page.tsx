'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import ChatSettings from '@/components/ChatSettings';
import { Chat, FileAttachment } from '@/types';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chatsData = await response.json();
        setChats(chatsData);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
          model: 'llama-3.3-70b-versatile',
          mode: 'regular',
          webSearch: false,
          browserSearch: false,
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setCurrentChat(newChat);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chat = await response.json();
        setCurrentChat(chat);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        const updatedChat = await response.json();
        setChats(prev => prev.map(chat => chat.id === chatId ? updatedChat : chat));
        if (currentChat?.id === chatId) {
          setCurrentChat(updatedChat);
        }
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const updateChat = async (updates: Partial<Chat>) => {
    if (!currentChat) return;

    try {
      const response = await fetch(`/api/chats/${currentChat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedChat = await response.json();
        setCurrentChat(updatedChat);
        setChats(prev => prev.map(chat => chat.id === currentChat.id ? updatedChat : chat));
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const sendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentChat || (!content.trim() && (!attachments || attachments.length === 0))) return;

    setIsLoading(true);

    try {
      // Add user message
      const userMessageResponse = await fetch(`/api/chats/${currentChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content,
          attachments,
        }),
      });

      if (!userMessageResponse.ok) {
        throw new Error('Failed to add user message');
      }

      const userMessage = await userMessageResponse.json();

      // Update current chat with user message
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
      };
      setCurrentChat(updatedChat);

      // Prepare messages for API call
      const messages = updatedChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get AI response
      const completionResponse = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: currentChat.model,
          temperature: 0.7,
          maxTokens: 1024,
          stream: false,
          reasoningFormat: currentChat.mode === 'reasoning' ? 'parsed' : undefined,
          includeReasoning: currentChat.mode === 'reasoning',
          webSearch: currentChat.webSearch,
          browserSearch: currentChat.browserSearch,
        }),
      });

      if (!completionResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const completion = await completionResponse.json();
      const assistantMessage = completion.choices[0]?.message;

      if (assistantMessage) {
        // Add assistant message
        const assistantMessageResponse = await fetch(`/api/chats/${currentChat.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'assistant',
            content: assistantMessage.content,
            reasoning: assistantMessage.reasoning,
          }),
        });

        if (assistantMessageResponse.ok) {
          const newAssistantMessage = await assistantMessageResponse.json();
          
          // Update current chat with assistant message
          const finalChat = {
            ...updatedChat,
            messages: [...updatedChat.messages, newAssistantMessage],
          };
          setCurrentChat(finalChat);
          
          // Update chats list
          setChats(prev => prev.map(chat => chat.id === currentChat.id ? finalChat : chat));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar
        chats={chats}
        currentChatId={currentChat?.id || null}
        onChatSelect={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {process.env.NEXT_PUBLIC_APP_NAME || 'Groq AI Chatbot'}
          </h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <ChatInterface
          chat={currentChat}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      <ChatSettings
        chat={currentChat}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateChat={updateChat}
      />
    </div>
  );
}