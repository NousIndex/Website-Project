import React, { useEffect, useState } from 'react';

function App() {
  const [apiUsageData, setApiUsageData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://localhost:3000/api/apiusage');
        const data = await response.json();
        setApiUsageData(data);
      } catch (error) {
        console.error('Error fetching API usage data:', error);
      }
    }

    // Call the fetchData function when the component mounts
    fetchData();
  }, []); // Specify an empty dependency array to run only once

  useEffect(() => {
    let isMounted = true; // Create a flag to track component unmounting

    async function fetchCondition() {
      try {
        const userId = '123'; // Replace with the actual user ID
        const response = await fetch(`http://localhost:3000/api/check-fetch-condition?userId=${userId}`);
        const data = await response.json();
        
        if (isMounted) {
          console.log('fetchCondition data:', data);

          if (typeof data.shouldFetch === 'boolean') {
            setShouldFetchData(data.shouldFetch);
          } else {
            console.error('Invalid fetchConditionData format:', data);
          }
        }
      } catch (error) {
        console.error('Error fetching fetchCondition data:', error);
      }
    }

    // Call the fetchCondition function when the component mounts
    fetchCondition();

    // Cleanup function to set the isMounted flag to false when unmounting
    return () => {
      isMounted = false;
    };
  }, []); // Specify an empty dependency array to run only once

  return (
    <div>
      <h1 style={{ color: '#FFFFFF' }}>API Usage Data</h1>
      <ul>
        {apiUsageData.map((apiUsage) => (
          <li key={apiUsage.API_Index}>
            <strong style={{ color: '#FFFFFF' }}>API Name: {apiUsage.API_Name}<br /></strong>
            <strong style={{ color: '#FFFFFF' }}>Last Used: {apiUsage.API_Last_Used.toString()}</strong>
          </li>
        ))}
      </ul>
      <div>
        <strong style={{ color: '#FFFFFF' }}>Should Fetch Data: {shouldFetchData.toString()}<br /></strong>
      </div>
    </div>
  );
}

export default App;
