import React from 'react';

/**
 * Catches render errors so one broken page does not white-screen the whole app.
 *
 * Without this, anything thrown while rendering — a malformed API payload
 * reaching a component, a scrape that returned an unexpected shape — unmounts
 * the entire React tree and leaves the user staring at a blank page with no way
 * back except a manual reload.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          color: '#ffffff',
          fontWeight: 'bold',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h2>Something went wrong on this page.</h2>
        <p style={{ fontWeight: 'normal' }}>
          The rest of the site still works — head back and try again.
        </p>
        <button
          onClick={this.handleReload}
          className="auth-button"
          style={{ marginTop: '1rem', cursor: 'pointer' }}
        >
          Back to home
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
