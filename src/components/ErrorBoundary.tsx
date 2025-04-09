import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium">Erro no módulo: {this.props.moduleName}</h3>
          </div>
          <p className="text-red-400 text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;