import { NextRequest, NextResponse } from 'next/server';
import { ChatStorage } from '@/lib/storage';

export async function GET() {
  try {
    const chats = await ChatStorage.getAllChats();
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, model, mode, webSearch, browserSearch } = body;

    if (!title || !model) {
      return NextResponse.json({ error: 'Title and model are required' }, { status: 400 });
    }

    const chat = await ChatStorage.createChat({
      title,
      messages: [],
      model,
      mode: mode || 'regular',
      webSearch: webSearch || false,
      browserSearch: browserSearch || false,
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}
