import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center app-mesh-bg p-6">
          <div className="glass-strong max-w-md w-full rounded-2xl p-10 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-danger-500/10 flex items-center justify-center mb-6">
              <AlertCircle className="h-7 w-7 text-danger-600 dark:text-danger-500" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-theme-muted mb-8">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <Button onClick={() => window.location.reload()}>Reload application</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
