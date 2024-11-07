import "../styles/globals.css";

import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <html lang="en">
    <head>
      <link rel="stylesheet" href="/fonts/Eudoxus-Sans.css" />
    </head>
    <body>{children}</body>
  </html>
);

export default RootLayout;
