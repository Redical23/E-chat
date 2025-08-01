import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbconnect';
import User from '../../models/User';

        // Adjust this path to your project

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId).populate('friends', 'username email status');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ friends: user.friends }, { status: 200 });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
