import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F0E6] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#FFFCF7] border border-[#2A1C15]/15 rounded-2xl p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-[24px] text-[#191A1D] font-semibold">
              Something went wrong
            </h2>
            <p className="text-[13px] text-[#77736D] leading-relaxed">
              DukaanShield AI encountered an interface loading error. Your data and security session are intact.
            </p>
            {this.state.error && (
              <div className="p-3 bg-[#F0E8DC] rounded-xl text-[11px] font-mono text-[#5A4A40] text-left overflow-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#221610] text-[#FAF6F0] text-[13px] font-medium hover:bg-[#3B281E] transition-all cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
