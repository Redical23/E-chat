'use client';

import React, { useState } from 'react';
import Header from './Header';
import Messagescreen from './Messagescreen';
import Send from './Send';
import Slidelist from './Sidelist';

const Chat = () => {
  const [selectedFriend, setSelectedFriend] = useState(null); // Track selected friend

  return (
    <div className="h-screen flex flex-col"
     style={{
    backgroundImage: "url('/h3.jpg')",
   
  }}>
      {/* Top Header */}
      <Header />

      {/* Main Chat Section */}
      <section className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 border-r overflow-y-auto hidden md:block">
          <Slidelist onSelectFriend={setSelectedFriend} />
        </aside>

        {/* Chat Area */}
        <div className="flex flex-col flex-1">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full w-full overflow-y-auto rounded-tr-lg shadow-inner">
              <Messagescreen friend={selectedFriend} />
            </div>
          </div>

     
        </div>
      </section>
    </div>
  );
};

export default Chat;
