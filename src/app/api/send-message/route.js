import dbConnect from '../../lib/dbconnect';
import Message from '../../models/Messages';
// src/app/api/send-message/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { sender, receiver, text } = await req.json();

  if (!sender || !receiver || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await dbConnect();

    const message = await Message.create({
      sender,
      receiver,
      text,
      timestamp: new Date(),
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error('Message save error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
