import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/cloudflare";
import { Toaster } from "@/components/ui/toaster";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { useEffect } from "react";
import { Workbox } from 'workbox-window';
import stylesheet from "./index.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico?v=2" },
  { rel: "canonical", href: "https://nearprotocol.eco" },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "apple-touch-icon", href: "/icon-192x192.png" }
];

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');
      wb.register().catch(error => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Explore the comprehensive ecosystem map of NEAR Protocol. Discover DeFi, NFTs, AI, Gaming projects and more."
        />
        <meta name="theme-color" content="#0A0F1C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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