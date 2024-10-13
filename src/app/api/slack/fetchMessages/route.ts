import { NextResponse } from 'next/server';
import axios from 'axios';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID; // Replace with your Slack channel ID

export async function GET() {
  try {
    const response = await axios.get('https://slack.com/api/conversations.history', {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`, // Bot token
      },
      params: {
        channel: SLACK_CHANNEL_ID, // Slack channel ID
        limit: 100, // Specify the number of messages to fetch (max: 100)
      },
    });

    console.log('Slack API response:', response.data); // Log Slack's response

    const { messages, ok, error } = response.data;

    if (!ok) {
      return NextResponse.json({ message: `Error: ${error}` }, { status: 400 });
    }

    // Handle pagination if there are more messages
    let allMessages = [...messages];

    // Check if there's a 'response_metadata' field for pagination
    let cursor = response.data.response_metadata?.next_cursor;
    
    while (cursor) {
      const nextResponse = await axios.get('https://slack.com/api/conversations.info', {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        },
        params: {
          channel: SLACK_CHANNEL_ID,
          limit: 100, // You can adjust the limit if needed
          cursor, // Use the cursor for pagination
        },
      });

      const { messages: nextMessages, ok: nextOk, error: nextError } = nextResponse.data;

      if (!nextOk) {
        console.error(`Error fetching next batch of messages: ${nextError}`);
        break; // Stop fetching if an error occurs
      }

      allMessages = [...allMessages, ...nextMessages]; // Append new messages to the list
      cursor = nextResponse.data.response_metadata?.next_cursor; // Update cursor for the next iteration
    }

    return NextResponse.json(allMessages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages from Slack:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
