import React from 'react';
import './CSS/ideapage.css'; // Assuming your styles are in a file called App.css
import Grid from './ideagrid';

function IdeaPage() {
  return (
    <div className="App">
      <div>
        <h1>Grid Highlighter</h1>
      </div>
      <div className="ideagrid-center-container">
        <Grid />
      </div>
    </div>
  );
}

export default IdeaPage;
