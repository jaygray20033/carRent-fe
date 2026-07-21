import { Component } from 'react';
import { Link } from 'react-router-dom';

// Day 44 — top-level React error boundary. Catches render/runtime errors in the
// component tree so a single broken page doesn't blank the whole app, and logs
// the error to Sentry when it's available (window.Sentry is set by the Sentry
// snippet in prod; in dev we just log to the console).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Report to Sentry if the SDK is loaded; otherwise fall back to console.
    if (typeof window !== 'undefined' && window.Sentry?.captureException) {
      window.Sentry.captureException(error, { extra: info });
    } else {
      console.error('Uncaught render error:', error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-ink-900">Đã có lỗi xảy ra</h1>
        <p className="mt-3 text-ink-500">
          Rất tiếc, trang gặp sự cố ngoài ý muốn. Vui lòng thử lại.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            Tải lại trang
          </button>
          <Link
            to="/"
            onClick={this.handleReload}
            className="rounded-lg border border-primary-600 px-5 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }
}
