import React, { useState, useEffect } from 'react';
import { MessageSquare, Mic, MicOff, Waves, Leaf, Settings, History, FileText, Zap, CheckCircle2, Clock, Play, Upload, Paperclip, LogOut, User, Menu, X } from 'lucide-react';
import { GeminiService } from '../services/gemini';
import { FileUpload } from './FileUpload';
import { ImageDisplay } from './ImageDisplay';
import { OrderDisplay } from './OrderDisplay';
import { ExtractedFile, extractTextFromFile } from '../utils/fileExtractor';
import { FoodBookingResult } from '../services/foodBooking';
import { TicketBookingResult } from '../services/ticketBooking';
import { FoodBookingResponse, MovieBookingResponse, BookingsResponse, AvailableItemsResponse } from '../services/fasterbook';
import TaskCenter from './TaskCenter';
import Markdown from '../utils/markdown';
import FilesView from './FilesView';
import MemoryLogs from './MemoryLogs';
import { handleBookingWithTask } from '../utils/bookingHelper';
import { authService, AuthUser } from '../services/auth';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  imagePrompt?: string;
  orderType?: 'food' | 'ticket' | 'fasterbook_food' | 'fasterbook_movie' | 'fasterbook_bookings' | 'fasterbook_menu' | 'restaurant' | 'hotel' | 'flight' | 'ride';
  orderData?: FoodBookingResult | TicketBookingResult | FoodBookingResponse | MovieBookingResponse | BookingsResponse | AvailableItemsResponse;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed';
  description: string;
  timestamp: Date;
}

interface MainAppProps {
  user: AuthUser;
  onSignOut: () => void;
}

export default function MainApp({ user, onSignOut }: MainAppProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello ${user.full_name || user.email}! I'm A.U.R.A, your Universal Reasoning Agent. I can help you think through complex problems, manage tasks, and understand the world around you. How can I assist you today?`,
      timestamp: new Date()
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'tasks' | 'files' | 'memory'>('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [geminiService] = useState(() => new GeminiService());

  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({length: 12}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  const handleFileUploaded = (file: ExtractedFile) => {
    geminiService.addUploadedFile(file);
    setShowFileUpload(false);

    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I've successfully processed "${file.name}" and can now reference its content in our conversation. Feel free to ask me questions about the document or request analysis of its contents.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleRemoveFile = (fileName: string) => {
    geminiService.removeUploadedFile(fileName);
  };

  const handleQuickFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File size must be less than 100MB.');
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const extractedFile = await extractTextFromFile(file);
      handleFileUploaded(extractedFile);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsUploadingFile(false);
      event.target.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await geminiService.sendMessage(input);

      if (aiResponse.startsWith('IMAGE_GENERATION:')) {
        const imagePrompt = aiResponse.replace('IMAGE_GENERATION:', '');
        setIsGeneratingImage(true);

        try {
          const imageUrl = await geminiService.generateImage(imagePrompt);

          const imageResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `I've generated an image based on your request: "${imagePrompt}"`,
            timestamp: new Date(),
            imageUrl,
            imagePrompt
          };
          setMessages(prev => [...prev, imageResponse]);
        } catch (error) {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'I apologize, but I encountered an issue generating the image. Please try again with a different prompt.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorResponse]);
        } finally {
          setIsGeneratingImage(false);
        }
      } else if (aiResponse === 'FOOD_BOOKING_REQUEST' || aiResponse === 'TICKET_BOOKING_REQUEST' ||
                 aiResponse === 'FASTERBOOK_FOOD_REQUEST' || aiResponse === 'FASTERBOOK_MOVIE_REQUEST' ||
                 aiResponse === 'FASTERBOOK_BOOKINGS_REQUEST' || aiResponse === 'FASTERBOOK_MENU_REQUEST' ||
                 aiResponse === 'RESTAURANT_ORDER_REQUEST' || aiResponse === 'HOTEL_BOOKING_REQUEST' ||
                 aiResponse === 'FLIGHT_BOOKING_REQUEST' || aiResponse === 'RIDE_BOOKING_REQUEST') {
        setIsTyping(true);

        try {
          const agenticAction = await geminiService.executeAgenticAction(input);

          if (agenticAction) {
            const result = await handleBookingWithTask(agenticAction, input);
            if (result) {
              const orderResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: result.message,
                timestamp: new Date(),
                orderType: result.orderType as any,
                orderData: result.orderData
              };
              setMessages(prev => [...prev, orderResponse]);
            }
          }
        } catch (error) {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: 'I apologize, but I encountered an issue processing your request. Please try again.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorResponse]);
        } finally {
          setIsTyping(false);
        }
      } else {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }

      const suggestions = await geminiService.generateTaskSuggestions(input);
      if (suggestions.length > 0) {
        const newTasks = suggestions.map((suggestion, index) => ({
          id: `task-${Date.now()}-${index}`,
          title: suggestion,
          status: 'pending' as const,
          description: `Generated from your conversation with A.U.R.A`,
          timestamp: new Date()
        }));
        setTasks(prev => [...newTasks, ...prev]);
      }
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered a brief connection issue. Please try your message again, and I\'ll be ready to assist you.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-slate-200/20 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.id * 0.5}s`,
              animationDuration: `${particle.speed + 3}s`
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl border-r border-slate-200/50 transform transition-transform duration-300 ease-out z-40 shadow-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">AURA</h2>
              <p className="text-xs text-slate-600">Universal Reasoning Agent</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setCurrentView('chat'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Conversations</span>
          </button>

          <button
            onClick={() => { setCurrentView('tasks'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'tasks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Zap className="w-5 h-5" />
            <span>Task Center</span>
          </button>

          <button
            onClick={() => { setShowFileUpload(!showFileUpload); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${showFileUpload ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Files</span>
          </button>

          <button
            onClick={() => { setCurrentView('memory'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'memory' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <History className="w-5 h-5" />
            <span>Memory Logs</span>
          </button>

          <button
            onClick={() => { setCurrentView('files'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'files' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FileText className="w-5 h-5" />
            <span>Files</span>
          </button>

          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-200">
            <button
              onClick={onSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-out ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg sm:text-xl text-slate-900">A.U.R.A</h1>
                  <p className="text-xs text-slate-600 hidden sm:block">Ready to assist</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-slate-100 rounded-full">
                <User className="w-4 h-4 text-slate-700" />
                <span className="text-sm text-slate-700">{user.full_name || user.email}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat View */}
        {currentView === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-5rem)]">
            {showFileUpload && (
              <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  uploadedFiles={geminiService.getUploadedFiles()}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            )}

            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6`}>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                  <div className={`max-w-[85%] sm:max-w-2xl ${message.type === 'user'
                    ? 'bg-slate-900 text-white rounded-3xl rounded-br-lg'
                    : 'bg-white/80 backdrop-blur-sm text-slate-800 rounded-3xl rounded-bl-lg border border-slate-200/50'
                  } px-4 sm:px-6 py-3 sm:py-4 shadow-sm hover:shadow-md transition-all duration-200`}>
                    {message.type === 'assistant' ? (
                      <Markdown content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    )}
                    {message.imageUrl && message.imagePrompt && (
                      <div className="mt-4">
                        <ImageDisplay
                          imageUrl={message.imageUrl}
                          prompt={message.imagePrompt}
                        />
                      </div>
                    )}
                    {message.orderType && message.orderData && (
                      <div className="mt-4">
                        <OrderDisplay
                          orderType={message.orderType}
                          orderData={message.orderData}
                        />
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {(isTyping || isGeneratingImage) && (
                <div className="flex justify-start animate-slide-in">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl rounded-bl-lg px-6 py-4 border border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      {isGeneratingImage && (
                        <span className="text-sm text-slate-600">Generating image...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/50">
              {uploadError && (
                <div className="mb-3 sm:mb-4 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <span>{uploadError}</span>
                  <button
                    onClick={() => setUploadError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-end space-x-2 sm:space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Message AURA..."
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 text-slate-900 placeholder-slate-500"
                  />

                  {geminiService.getUploadedFiles().length > 0 && (
                    <div className="absolute -top-7 left-2 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      📎 {geminiService.getUploadedFiles().length} file(s)
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="*"
                  onChange={handleQuickFileUpload}
                  className="hidden"
                  id="quick-file-upload"
                  disabled={isUploadingFile}
                />
                <button
                  onClick={() => document.getElementById('quick-file-upload')?.click()}
                  disabled={isUploadingFile}
                  className="p-3 sm:p-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Upload file"
                >
                  {isUploadingFile ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  onClick={toggleVoice}
                  className={`hidden sm:block p-3 sm:p-4 rounded-xl transition-all duration-200 ${isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping || isGeneratingImage}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'tasks' && <TaskCenter />}
        {currentView === 'files' && (
          <FilesView
            files={geminiService.getUploadedFiles()}
            onRemoveFile={handleRemoveFile}
          />
        )}
        {currentView === 'memory' && <MemoryLogs messages={messages} />}
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
