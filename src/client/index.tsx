import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./app";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

function showBootstrapError(message: string): void {
  const wrapper = document.createElement("div");

  wrapper.setAttribute(
    "style",
    "color: #b00020; background: #fff5f5; border: 1px solid #f5c2c7; padding: 16px; margin: 16px; font-family: sans-serif;",
  );

  const heading = document.createElement("h1");

  heading.setAttribute("style", "margin-top: 0;");
  heading.textContent = "App failed to load";

  const pre = document.createElement("pre");

  pre.setAttribute("style", "white-space: pre-wrap; margin-bottom: 0;");
  pre.textContent = message;

  wrapper.appendChild(heading);
  wrapper.appendChild(pre);
  rootElement!.replaceChildren(wrapper);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
const root = createRoot(rootElement);

void (async () => {
  try {
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <Router>
            <App />
          </Router>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  } catch (error) {
    showBootstrapError(String(error));
  }
})();
