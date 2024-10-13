import { NextResponse } from 'next/server';
import axios from 'axios';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const response = await axios.get(`https://slack.com/api/users.info`, {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`, // Bot token
      },
      params: {
        user: userId, // Pass the user ID
      },
    });

    const { user, ok, error } = response.data;

    if (!ok) {
      return NextResponse.json({ message: `Error: ${error}` }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user info from Slack:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
