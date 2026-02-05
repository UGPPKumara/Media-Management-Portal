'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/api';
import {
  MessageSquare, Send, Plus, Search, Clock, User, Check, CheckCheck,
  X, Loader2, ChevronLeft, MoreVertical, XCircle, Trash2
} from 'lucide-react';

type Conversation = {
  id: string;
  subject: string;
  creator_id: { id: string; username: string; profile_picture?: string; role: string };
  last_message: string;
  last_message_at: string;
  status: string;
  unread_count: number;
};

type Message = {
  id: string;
  content: string;
  sender_id: { id: string; username: string; profile_picture?: string; role: string };
  created_at: string;
  read_by: string[];
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConvoRef = useRef<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConvoId, setDeleteConvoId] = useState<string | null>(null);

  // Keep ref updated with latest selectedConvo
  useEffect(() => {
    selectedConvoRef.current = selectedConvo?.id || null;
  }, [selectedConvo?.id]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchConversations();

    // Poll for new messages every 2 seconds for real-time feel
    const interval = setInterval(() => {
      fetchConversations();
      // Use ref to get current selectedConvo
      if (selectedConvoRef.current) {
        fetchMessages(selectedConvoRef.current, true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvo) {
      fetchMessages(selectedConvo.id);
    }
  }, [selectedConvo?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId: string, silent = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/chat/conversations/${convoId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/chat/conversations/${selectedConvo.id}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages(selectedConvo.id);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          subject: newChatSubject || 'Support Request',
          message: newChatMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowNewChat(false);
      setNewChatSubject('');
      setNewChatMessage('');
      fetchConversations();
      setSelectedConvo(res.data);
    } catch (err) {
      console.error('Failed to start conversation', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseConversation = async (convoId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/chat/conversations/${convoId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchConversations();
      setSelectedConvo(null);
    } catch (err) {
      console.error('Failed to close conversation', err);
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteConvoId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/chat/conversations/${deleteConvoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConversations();
      if (selectedConvo?.id === deleteConvoId) {
        setSelectedConvo(null);
      }
      setShowDeleteModal(false);
      setDeleteConvoId(null);
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const confirmDelete = (convoId: string) => {
    setDeleteConvoId(convoId);
    setShowDeleteModal(true);
  };

  const filteredConversations = conversations.filter(c =>
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.creator_id?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const isMyMessage = (msg: Message) => msg.sender_id?.id === user?.id;

  return (
    <div className="h-[calc(100vh-120px)] flex bg-theme-secondary rounded-2xl overflow-hidden border border-theme">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 bg-theme-card border-r border-theme flex flex-col ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-theme">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-theme-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Messages
            </h1>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-sm text-theme-primary placeholder:text-theme-muted focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="w-12 h-12 text-theme-muted mb-3" />
              <p className="text-theme-secondary font-medium">No conversations yet</p>
              <p className="text-theme-muted text-sm mt-1">Start a new chat to get help</p>
            </div>
          ) : (
            filteredConversations.map(convo => (
              <div
                key={convo.id}
                className={`w-full p-4 flex items-start gap-3 hover:bg-theme-tertiary transition-colors border-b border-theme cursor-pointer group relative ${selectedConvo?.id === convo.id ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : ''}`}
                onClick={() => setSelectedConvo(convo)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {convo.creator_id?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-theme-primary truncate">
                      {user?.role === 'CREATOR' ? 'Support' : convo.creator_id?.username}
                    </span>
                    <span className="text-xs text-theme-muted">{formatTime(convo.last_message_at)}</span>
                  </div>
                  <p className="text-sm text-theme-secondary truncate">{convo.subject}</p>
                  <p className="text-xs text-theme-muted truncate mt-0.5">{convo.last_message}</p>
                </div>

                {/* Delete Button (Visible on Hover or if active) */}
                {(['ADMIN', 'MANAGER'].includes(user?.role) || user?.id === convo.creator_id?.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(convo.id);
                    }}
                    className="absolute right-2 top-10 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {convo.unread_count > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full ml-2">
                    {convo.unread_count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConvo ? 'hidden md:flex' : 'flex'}`}>
        {selectedConvo ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-theme bg-theme-card flex items-center gap-3">
              <button
                onClick={() => setSelectedConvo(null)}
                className="md:hidden p-2 hover:bg-theme-tertiary rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-theme-primary" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                {selectedConvo.creator_id?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-theme-primary">
                  {user?.role === 'CREATOR' ? 'Support Team' : selectedConvo.creator_id?.username}
                </h2>
                <p className="text-sm text-theme-muted">{selectedConvo.subject}</p>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1">
                {(['ADMIN', 'MANAGER'].includes(user?.role) || user?.id === selectedConvo.creator_id?.id) && (
                  <button
                    onClick={() => confirmDelete(selectedConvo.id)}
                    className="p-2 text-theme-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                {['MANAGER', 'ADMIN'].includes(user?.role) && selectedConvo.status === 'OPEN' && (
                  <button
                    onClick={() => handleCloseConversation(selectedConvo.id)}
                    className="p-2 text-theme-muted hover:text-orange-500 hover:bg-orange-500/10 rounded-lg"
                    title="Close conversation"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-theme-secondary">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMyMessage(msg) ? 'order-2' : ''}`}>
                    {!isMyMessage(msg) && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-theme-secondary">
                          {msg.sender_id?.username}
                        </span>
                        {['MANAGER', 'ADMIN'].includes(msg.sender_id?.role) && (
                          <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded font-medium">
                            {msg.sender_id?.role}
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${isMyMessage(msg)
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-md'
                        : 'bg-theme-card border border-theme text-theme-primary rounded-bl-md'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isMyMessage(msg) ? 'justify-end' : ''}`}>
                      <span className="text-[10px] text-theme-muted">
                        {formatTime(msg.created_at)}
                      </span>
                      {isMyMessage(msg) && (
                        <CheckCheck className="w-3 h-3 text-indigo-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {selectedConvo.status === 'OPEN' ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-theme bg-theme-card">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-theme-tertiary border border-theme rounded-xl text-theme-primary placeholder:text-theme-muted focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-theme bg-theme-tertiary text-center text-theme-muted text-sm">
                This conversation has been closed
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-theme-primary mb-2">Select a conversation</h2>
            <p className="text-theme-muted max-w-sm">
              Choose a conversation from the list or start a new chat to get help from the support team.
            </p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-card rounded-2xl shadow-xl w-full max-w-md mx-4 border border-theme">
            <div className="flex items-center justify-between p-4 border-b border-theme">
              <h3 className="text-lg font-semibold text-theme-primary">New Support Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="p-1 hover:bg-theme-tertiary rounded">
                <X className="w-5 h-5 text-theme-muted" />
              </button>
            </div>
            <form onSubmit={handleStartNewChat} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Subject</label>
                <input
                  type="text"
                  value={newChatSubject}
                  onChange={e => setNewChatSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder:text-theme-muted focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">Message</label>
                <textarea
                  value={newChatMessage}
                  onChange={e => setNewChatMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  rows={4}
                  className="w-full px-4 py-2 bg-theme-tertiary border border-theme rounded-lg text-theme-primary placeholder:text-theme-muted focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!newChatMessage.trim() || sendingMessage}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Start Conversation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-theme-card rounded-2xl shadow-2xl w-full max-w-sm border border-theme transform transition-all scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">Delete Conversation?</h3>
              <p className="text-theme-secondary text-sm">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-theme-tertiary border-t border-theme rounded-b-2xl flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary transition bg-theme-card border border-theme rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
