import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Error Boundary : capture les erreurs de rendu React et affiche un
 * fallback UI au lieu d'un écran blanc.
 *
 * Place-le autour du contenu d'une route (pas autour de la Nav/Footer)
 * pour que la navigation reste accessible même en cas d'erreur dans
 * une page.
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur en console (en prod, brancher Sentry plus tard)
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Erreur capturée :", error, errorInfo);

    // En prod, hook ici : Sentry, Vercel Analytics, etc.
    // if (import.meta.env.PROD) { Sentry.captureException(error); }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="min-h-[60vh] flex items-center justify-center p-6"
          style={{ backgroundColor: "var(--color-cream)" }}
        >
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4" aria-hidden="true">😔</div>
            <h1
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Oups, une erreur s'est produite
            </h1>
            <p className="text-[var(--color-muted)] mb-6 leading-relaxed">
              Notre équipe a été notifiée. Vous pouvez réessayer ou revenir à l'accueil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-6 py-3 bg-[var(--color-orange)] text-white rounded-full font-semibold hover:bg-[var(--color-orange-d)] transition-colors min-h-[44px]"
              >
                Réessayer
              </button>
              <a
                href="/"
                className="px-6 py-3 border-2 border-[var(--color-orange)] text-[var(--color-orange)] rounded-full font-semibold hover:bg-[var(--color-orange)] hover:text-white transition-colors min-h-[44px] flex items-center justify-center"
              >
                Retour à l'accueil
              </a>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left text-xs">
                <summary className="cursor-pointer text-[var(--color-muted)]">
                  Détails techniques (dev only)
                </summary>
                <pre className="mt-2 p-3 bg-[var(--color-rose-soft)] rounded overflow-auto text-[10px]">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
