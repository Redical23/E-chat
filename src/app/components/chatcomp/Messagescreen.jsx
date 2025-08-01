'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';
import { Button } from '../button';

import { Phone, Video, Mic, MicOff, VideoOff, MoreHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../dropdown-menu';

const Messagescreen = ({ friend }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const socketRef = useRef(null);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  };

  const fetchMessages = async (isInitial = false) => {
    if (!friend?._id || !session?.user?.id || loading || (!isInitial && !hasMore)) return;
    setLoading(true);
    const lastId = isInitial ? null : messages[0]?._id;
    const res = await fetch(`/api/get-messages?friendId=${friend._id}&userId=${session.user.id}${lastId ? `&beforeId=${lastId}` : ''}`);
    const data = await res.json();
    if (isInitial) {
      setMessages(data.messages || []);
    } else {
      setMessages((prev) => [...(data.messages || []), ...prev]);
    }
    if (!data.messages || data.messages.length === 0) setHasMore(false);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(true); }, [friend]);

  useEffect(() => {
    fetch('/api/socket');
    const socket = io(undefined, { path: '/api/socket' });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('message', (msg) => {
      if (msg.sender !== session?.user?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('call-offer', async ({ offer, from, video }) => {
      if (!socketRef.current) return;
      setIsCalling(true);
      setIsVideoCall(video);
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit('ice-candidate', { candidate: e.candidate, to: from });
        }
      };

      pc.ontrack = (e) => {
        const remoteStream = remoteStreamRef.current?.srcObject || new MediaStream();
        remoteStream.addTrack(e.track);
        remoteStreamRef.current.srcObject = remoteStream;
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('call-answer', { answer, to: from });
    });

    socket.on('call-answer', async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('ICE error', err);
      }
    });

    return () => socket.disconnect();
  }, [session?.user?.id, friend?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (containerRef.current.scrollTop === 0) fetchMessages();
  };

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    const msg = { text: newMsg, sender: session?.user?.id, receiver: friend._id };
    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Send message failed:', res.status, errorText);
      return;
    }
    const savedMsg = await res.json();
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', savedMsg);
    }
    setMessages((prev) => [...prev, savedMsg]);
    setNewMsg('');
  };

   const startCall = async (video = false) => {
    setIsCalling(true);
    setIsVideoCall(video);
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
    localStreamRef.current = stream;
    setupPeerConnection();
    peerConnectionRef.current.onicecandidate = e => e.candidate && socketRef.current.emit('ice-candidate', { candidate: e.candidate, to: friend._id });
    peerConnectionRef.current.ontrack = e => {
      const rs = remoteStreamRef.current.srcObject || new MediaStream();
      rs.addTrack(e.track);
      remoteStreamRef.current.srcObject = rs;
    };
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socketRef.current.emit('call-offer', { offer, to: friend._id, from: session.user.id, video });
  };

  const endCall = () => {
    setIsCalling(false);
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    remoteStreamRef.current.srcObject = null;
    localStreamRef.current = null;
    setMuted(false);
    setVideoOff(false);
  };
  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }
  };
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = videoOff);
      setVideoOff(!videoOff);
    }
  };

  const handleVoiceCall = () => startCall(false);
  const handleVideoCall = () => startCall(true);

  const handleDeleteChatAndFriend = async () => {
    if (!confirm("Are you sure you want to delete all messages and remove this friend?")) return;
    try {
      const res = await fetch(`/api/delete-chat-and-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, friendId: friend._id }),
      });
      if (res.ok) {
        alert("Deleted successfully.");
        window.location.reload();
      } else {
        const error = await res.text();
        console.error('Failed to delete:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!friend) {
    return <div className="flex items-center justify-center h-full text-gray-500">Select a friend to start chatting</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-t-lg shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-blue-600">
            <AvatarImage src={friend.avatar} alt={friend.username} />
            <AvatarFallback>{friend.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{friend.username}</h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span className={`w-2 h-2 rounded-full mr-1.5 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {friend.status === 'online' ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleVoiceCall} variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
            <Phone className="h-5 w-5" />
          </Button>
          <Button onClick={handleVideoCall} variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDeleteChatAndFriend}>Delete Chat & Friend</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll} ref={containerRef}>
        {loading && <div className="text-center text-sm text-gray-400">Loading...</div>}
        {messages.map((msg, index) => {
          const isMe = msg.sender === session?.user?.id;
          return (
            <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-end space-x-2 max-w-[80%]">
                {!isMe && (
                  <Avatar className="h-8 w-8 mb-1">
                    <AvatarImage src={friend.avatar} alt={friend.username} />
                    <AvatarFallback>{friend.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                {isMe && (
                  <Avatar className="h-8 w-8 mb-1">
                    <AvatarImage src={session.user.image} alt="Me" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="mt-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition"
        >
          Send
        </button>
      </div>
       {isCalling && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center space-y-6 z-50">
          <div className="flex space-x-4">
            <video ref={el => el && (el.srcObject = localStreamRef.current)} autoPlay muted playsInline className="w-64 h-48 rounded-md" />
            <video ref={remoteStreamRef} autoPlay playsInline className="w-64 h-48 rounded-md" />
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {muted ? <MicOff /> : <Mic />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleVideo}>
              {videoOff ? <VideoOff /> : <Video />}
            </Button>
            <Button variant="destructive" size="icon" onClick={endCall}>
              <X />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messagescreen;