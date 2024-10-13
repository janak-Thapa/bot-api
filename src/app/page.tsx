import SlackMessages from '@/components/SlackMessages';
import React from 'react';


const Home: React.FC = () => {
  // Replace with your actual Slack channel ID

  return (
    <div>
      <h1>Welcome to the Slack Messages App</h1>
      <SlackMessages  />
    </div>
  );
};

export default Home;
