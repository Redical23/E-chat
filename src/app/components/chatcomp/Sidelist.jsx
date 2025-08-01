'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Badge } from '../badge';

const Sidelist = ({ onSelectFriend }) => {
  const { data: session, status } = useSession();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/get-friends?userId=${session.user.id}`, {
          method: 'GET',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch friends');
        }

        setFriends(data.friends || []);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchFriends();
    }
  }, [session, status]);

  // Filter friends by search term
  const filteredFriends = friends.filter(friend =>
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-white font-semibold">Recent Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <p className="text-sm text-white/70 px-4">Loading...</p>}
        {error && <p className="text-sm text-red-400 px-4">{error}</p>}
        {!loading && !error && filteredFriends.length === 0 && (
          <p className="text-sm text-white/50 px-4">No chats found.</p>
        )}
        {!loading && !error && filteredFriends.map((friend) => (
          <div 
            key={friend._id} 
            className="px-3 py-2.5 cursor-pointer hover:bg-white/10"
            onClick={() => onSelectFriend(friend)}
          >
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10 border-2 border-white/50">
                  <AvatarImage src={friend.avatar || ''} alt={friend.username} />
                  <AvatarFallback>{friend.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                {friend.status === 'online' && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white truncate">{friend.username}</h3>
                  <span className="text-xs text-white/70">{friend.time || ''}</span>
                </div>
                <p className="text-xs text-white/80 truncate">{friend.lastMessage || 'No messages yet.'}</p>
              </div>
              {friend.unread > 0 && (
                <Badge className="ml-1 bg-white text-blue-700">{friend.unread}</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidelist;
