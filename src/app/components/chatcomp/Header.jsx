'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useModelContext } from '../../context/Context'; // adjust path as needed

const Header = () => {
  const { data: session } = useSession();
  const { updateAvtarURL } = useModelContext(); // avatar URL from context
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
    <div className="bg-gradient-to-r from-[#1c2c3b] to-[#243544] text-white shadow-md px-6 py-4 rounded-b-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Image
            src={updateAvtarURL || session?.user?.image || '/default-avatar.png'}
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full border-2 border-blue-500"
          />
          <div>
            <p className="font-semibold">{session?.user?.name || 'User'}</p>
            <p className="text-sm text-gray-300">{session?.user?.email}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            type="email"
            placeholder="Add user by email"
            className="bg-[#2e3e4e] text-white placeholder-gray-400 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            value={emailToAdd}
            onChange={(e) => setEmailToAdd(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm transition"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
          <Link
            href="/profile"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm transition"
          >
            Profile
          </Link>
        </div>
      </div>

      {message && (
        <p className="text-sm text-gray-300 mt-2 text-center sm:text-left">
          {message}
        </p>
      )}
    </div>
  );
};

export default Header;
