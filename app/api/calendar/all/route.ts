import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Event from '@/lib/models/Event';
import Post from '@/lib/models/Post';

// Force dynamic rendering for this route since it uses authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    // Clean up any existing scheduled_post events to avoid duplication
    await Event.deleteMany({ 
      userId, 
      eventType: 'scheduled_post' 
    });

    // Fetch events (excluding scheduled_post events to avoid duplication)
    const events = await Event.find({ 
      userId, 
      eventType: { $ne: 'scheduled_post' } 
    }).sort({ startDateTime: 1 });

    // Fetch scheduled posts (status: scheduled)
    const scheduledPosts = await Post.find({ userId, status: 'scheduled' });
    
    console.log('Calendar API - Found scheduled posts:', scheduledPosts.length);
    console.log('Calendar API - Scheduled posts data:', scheduledPosts.map(p => ({
      id: p._id,
      title: p.title,
      status: p.status,
      scheduledDate: p.scheduledDate,
      platforms: p.platforms
    })));

    return NextResponse.json({ events, scheduledPosts });
  } catch (error) {
    console.error('Error loading calendar data:', error);
    return NextResponse.json({ error: 'Failed to load calendar data' }, { status: 500 });
  }
} 