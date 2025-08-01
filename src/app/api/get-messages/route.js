import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbconnect';
import Message from '../../models/Messages';

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const friendId = searchParams.get('friendId');
  const userId = searchParams.get('userId');
  const beforeId = searchParams.get('beforeId');

  if (!friendId || !userId) {
    return NextResponse.json({ message: 'Missing IDs' }, { status: 400 });
  }

  const query = {
    $or: [
      { sender: userId, receiver: friendId },
      { sender: friendId, receiver: userId },
    ],
  };

  if (beforeId) {
    const beforeMessage = await Message.findById(beforeId);
    if (beforeMessage) {
      query.timestamp = { $lt: beforeMessage.timestamp };
    }
  }

  const messages = await Message.find(query)
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  return NextResponse.json({ messages: messages.reverse() }, { status: 200 });
}
