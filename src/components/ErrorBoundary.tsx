import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  declare state: State;
  declare readonly props: Readonly<Props>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF8FF] flex flex-col items-center justify-center text-center space-y-6 px-4">
          <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600 text-4xl font-black">!</div>
          <div className="space-y-2 max-w-sm">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-500 text-sm leading-relaxed">An unexpected error occurred. Please refresh the page to continue.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-200 transition-all"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
