import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbconnect';
import User from '../../models/User';

export async function POST(req) {
  try {
    await dbConnect();

    const { userId, friendEmail } = await req.json();

    if (!userId || !friendEmail) {
      return NextResponse.json({ message: 'userId and friendEmail are required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const friend = await User.findOne({ email: friendEmail });
    if (!friend) {
      return NextResponse.json({ message: 'Friend not found' }, { status: 404 });
    }

    // Prevent adding self
    if (user._id.equals(friend._id)) {
      return NextResponse.json({ message: "You can't add yourself" }, { status: 400 });
    }

    // Check if already friends
    const alreadyFriends = user.friends.includes(friend._id) || friend.friends.includes(user._id);
    if (alreadyFriends) {
      return NextResponse.json({ message: 'Friend already added' }, { status: 400 });
    }

    // Add friend to both users
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    return NextResponse.json({ message: 'Friend added successfully (both sides)' }, { status: 200 });
  } catch (error) {
    console.error('Add friend error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId).populate('friends', 'username email status'); // Only fetch specific fields

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ friends: user.friends }, { status: 200 });
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
