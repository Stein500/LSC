import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, isRouteErrorResponse, Link, Navigate, useRouteError } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { Skeleton } from "@/components/ui/Skeleton";

// Lazy loading par page
const Home = lazy(() => import("@/pages/Home/Home"));
const Services = lazy(() => import("@/pages/Services/Services"));
const Formation = lazy(() => import("@/pages/Formation/Formation"));
const Contact = lazy(() => import("@/pages/Contact/Contact"));
const Merci = lazy(() => import("@/pages/Merci/Merci"));
const Tickets = lazy(() => import("@/pages/Tickets/Tickets"));
const Notifications = lazy(() => import("@/pages/Notifications/Notifications"));
const Parametres = lazy(() => import("@/pages/Parametres/Parametres"));
const Mentions = lazy(() => import("@/pages/Legal/Mentions"));
const NotFound = lazy(() => import("@/pages/NotFound/NotFound"));
const Inspirations = lazy(() => import("@/pages/Inspirations/Inspirations"));

function RouteErrorView() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Une erreur inattendue s'est produite.";

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center rounded-[2rem] bg-white shadow-lg border border-black/5 p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-muted)] mb-3">Erreur temporaire</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          La page n'a pas pu se charger
        </h1>
        <p className="text-sm md:text-base text-[var(--color-ink-soft)] mb-6">{message}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="px-5 py-3 rounded-full bg-[var(--color-citron)] text-[var(--color-ink)] font-semibold">Retour à l'accueil</Link>
          <button type="button" onClick={() => window.location.reload()} className="px-5 py-3 rounded-full border border-[var(--color-line)] font-semibold">Rafraîchir</button>
        </div>
      </div>
    </div>
  );
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<div className="pt-32"><Skeleton /></div>}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorView />,
    children: [
      { index: true, element: withSuspense(Home) },
      { path: "services", element: withSuspense(Services) },
      { path: "formation", element: withSuspense(Formation) },
      { path: "contact", element: withSuspense(Contact) },
      { path: "merci", element: withSuspense(Merci) },
      { path: "tickets", element: withSuspense(Tickets) },
      { path: "notifications", element: withSuspense(Notifications) },
      { path: "parametres", element: withSuspense(Parametres) },
      { path: "mentions-legales", element: withSuspense(Mentions) },
      { path: "inspirations", element: withSuspense(Inspirations) },
      { path: "404", element: withSuspense(NotFound) },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);