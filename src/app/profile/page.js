'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.username || '');
      setEmail(session.user.email || '');
      setImage(session.user.image || '');
    }
  }, [session]);

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>You must be logged in to view this page.</p>;

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('userId', session.user._id || session.user.id);
    formData.append('username', username);
    formData.append('email', email);
    if (newImageFile) {
      formData.append('image', newImageFile);
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.message}`);
        return;
      }

      const result = await res.json();
      setMessage('Profile updated successfully.');
      setEditMode(false);
      await update(); // Refresh the session to reflect changes 
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-md max-w-md w-full text-center">
        <Image
          src={
            newImageFile
              ? URL.createObjectURL(newImageFile)
              : image || '/default-avatar.png'
          }
          alt="User Image"
          width={100}
          height={100}
          className="rounded-full mx-auto mb-4 object-cover"
        />

        {editMode ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImageFile(e.target.files[0])}
              className="mb-3 block mx-auto"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="Username"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="Email"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">{username}</h2>
            <p className="text-gray-600">{email}</p>
            <p className="mt-4 text-sm text-gray-500">
              Welcome to your profile page.
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </>
        )}

        {message && (
          <p className="mt-4 text-sm text-red-500 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
