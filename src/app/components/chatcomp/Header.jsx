'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const { data: session } = useSession();
  const [emailToAdd, setEmailToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdd = async () => {
    const friendEmail = emailToAdd.trim();

    if (!friendEmail || !session?.user?.id) {
      setMessage('Invalid input or user not logged in.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          friendEmail,
        }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setEmailToAdd('');
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm py-3 px-4 rounded-xl">
  <div className="flex items-center justify-between">
    {/* User Info */}
    <div className="flex items-center space-x-4">
      <Image
        src={session?.user?.image || '/default-avatar.png'}
        alt="Avatar"
        width={40}
        height={40}
        className="rounded-full border-2 border-blue-600"
      />
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">
          {session?.user?.name || 'User'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="email"
        placeholder="Add user by email"
        className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={emailToAdd}
        onChange={(e) => setEmailToAdd(e.target.value)}
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
      >
        {loading ? 'Adding...' : 'Add'}
      </button>
      <Link
        href="/profile"
        className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-full hover:bg-green-700 transition"
      >
        Profile
      </Link>
    
    </div>
  </div>

  {message && <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">{message}</p>}
</div>

  );
};

export default Header;
