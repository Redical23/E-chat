'use client';

import React, { useState } from 'react';
import Header from './Header';
import Messagescreen from './Messagescreen';
import Send from './Send';
import Slidelist from './Sidelist';

const Chat = () => {
  const [selectedFriend, setSelectedFriend] = useState(null); // Track selected friend

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Chat Section */}
      <section className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 bg-blue-600 border-r overflow-y-auto hidden md:block">
          <Slidelist onSelectFriend={setSelectedFriend} />
        </aside>

        {/* Chat Area */}
        <div className="flex flex-col flex-1">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full w-full overflow-y-auto bg-gradient-to-r from-amber-200 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-tr-lg shadow-inner">
              <Messagescreen friend={selectedFriend} />
            </div>
          </div>

     
        </div>
      </section>
    </div>
  );
};

export default Chat;
