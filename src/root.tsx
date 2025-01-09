import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import { Toaster } from "@/components/ui/toaster";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import stylesheet from "./index.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico?v=2" },
  { rel: "canonical", href: "https://nearprotocol.eco" },
];

export default function App() {
  const location = useLocation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Explore the comprehensive ecosystem map of NEAR Protocol. Discover DeFi, NFTs, AI, Gaming projects and more."
        />
        <Meta />
        <Links />
        <script
          defer
          data-domain="nearprotocol.eco"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>
        <CategoriesProvider key="categories-provider">
          <Outlet />
          <Toaster />
        </CategoriesProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
} 