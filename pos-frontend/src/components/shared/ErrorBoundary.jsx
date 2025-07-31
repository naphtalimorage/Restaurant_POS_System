import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="bg-[#262626] p-4 rounded-lg mb-4 text-[#f5f5f5]">
          <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
          {this.props.fallback || (
            <div className="text-sm text-[#ababab]">
              <p>We couldn't display this item correctly.</p>
              <details className="mt-2">
                <summary>Error details</summary>
                <p className="mt-1">{this.state.error && this.state.error.toString()}</p>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;