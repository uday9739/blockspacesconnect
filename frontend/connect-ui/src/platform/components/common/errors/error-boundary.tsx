import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorState {
  error: any
}

/**
 * An error boundary component that will log unhandled errors and display a custom error screen
 * when the app is not running in development mode
 */
export default class ErrorBoundary extends Component<{children: any}, ErrorState> {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorState {
    console.debug('in getDerivedStateFromError()');
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // TODO send error to Datadog
    console.error('Uncaught error:', error, errorInfo);
  }

  componentDidMount(): void {
    window?.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentWillUnmount(): void {
    window?.removeEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({
      error: event.reason,
    });
  };

  render(): ReactNode {
    if (this.state.error) {
      // TODO update to support using an arbitrary "FallbackComponent" prop
      return (
        <Dialog open fullWidth>
          <DialogTitle sx={{ px: 1.5 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <ErrorIcon color="error" />
              <Typography variant="h6" color="error">An Unexpected Error Has Occurred</Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Stack>
              <pre style={{ whiteSpace: 'pre-wrap', lineHeight: '2rem' }}>
                {typeof this.state.error?.message === 'string' ? this.state.error.message : 'An unexpected error has occurred'}
              </pre>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => { if (window?.location) window.location.reload(); }}
              >
                Reload Page
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}
