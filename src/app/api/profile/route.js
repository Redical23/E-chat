import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbconnect';
import User from '../../models/User';

// Enable formData parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function PATCH(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const userId = formData.get('userId');
    const username = formData.get('username');
    const email = formData.get('email');
    const imageFile = formData.get('image'); // File if provided

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;

    if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
      user.avatar = base64Image;
    }

    await user.save();

    return NextResponse.json({ message: 'Profile updated successfully', user }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
