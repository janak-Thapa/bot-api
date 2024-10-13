"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface SlackMessage {
  user?: string; // The user field might not always be present
  ts: string; // Timestamp, should be unique for messages
}

interface User {
  id: string; // Slack User ID
  real_name: string; // Real name of the user
  profile?: {
    title?: string;
    linkedin?: string;
    location?: string;
    company?: string;
    firstIdentified?: string;
    about?: string;
    website?: string;
    industry?: string;
  };
}

const SlackMessages = () => {
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async (userId: string): Promise<User | null> => {
    try {
      const { data } = await axios.get(`/api/slack/users/${userId}`);
      if (data) {
        return data; // Return the user info directly
      }
      console.error(`Error fetching user info for ${userId}: User not found`);
      return null;
    } catch (err) {
      console.error(`Failed to fetch user info for ${userId}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data: fetchedMessages } = await axios.get("/api/slack/fetchMessages");
        setMessages(fetchedMessages);

        // Filter out any messages without a user ID
        const userIds = Array.from(new Set(fetchedMessages
          .filter((msg: SlackMessage) => msg.user !== undefined) // Only take messages with valid user IDs
          .map((msg: SlackMessage) => msg.user as string) // Extract user IDs
        ));

        console.log("Unique User IDs:", userIds); // Debugging step

        // Fetch user info for all valid user IDs
        const usersData = await Promise.all(userIds.map((userId) => fetchUserInfo(userId as string)));
        setUsers(usersData.filter((user): user is User => user !== null));
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const getUserDetails = (userId: string) => {
    return users.find((u) => u.id === userId) || null;
  };

  if (loading) return <p className="text-center">Loading messages...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4">Customer Details</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Customer Name</th>
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Company</th>
            <th className="border border-gray-300 p-2">LinkedIn</th>
            <th className="border border-gray-300 p-2">Location</th>
            <th className="border border-gray-300 p-2">First Identified</th>
            <th className="border border-gray-300 p-2">About</th>
            <th className="border border-gray-300 p-2">Website</th>
            <th className="border border-gray-300 p-2">Industry</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => {
            const userDetails = getUserDetails(message.user || '');
            return (
              <tr key={message.ts}>
                <td className="border border-gray-300 p-2">{userDetails?.real_name || "Unknown User"}</td>
                <td className="border border-gray-300 p-2">{userDetails?.profile?.title || "-"}</td>
                <td className="border border-gray-300 p-2">{userDetails?.profile?.company || "-"}</td>
                <td className="border border-gray-300 p-2">
                  {userDetails?.profile?.linkedin ? (
                    <a href={userDetails.profile.linkedin} target="_blank" rel="noopener noreferrer">Profile</a>
                  ) : "-" }
                </td>
                <td className="border border-gray-300 p-2">{userDetails?.profile?.location || "-"}</td>
                <td className="border border-gray-300 p-2">{userDetails?.profile?.firstIdentified || "-"}</td>
                <td className="border border-gray-300 p-2">{userDetails?.profile?.about || "-"}</td>
                <td className="border border-gray-300 p-2">
                  {userDetails?.profile?.website ? (
                    <a href={userDetails.profile.website} target="_blank" rel="noopener noreferrer">Website</a>
                  ) : "-"}
                </td>
                <td className="border border-gray-300 p-2">{userDetails?.profile?.industry || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SlackMessages;
