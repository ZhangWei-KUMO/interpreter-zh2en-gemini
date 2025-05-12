'use client';

import SidePanel from "./SidePanel";

// This component simply wraps SidePanel to ensure it's treated as a client boundary.
export default function SidePanelClientOnly() {
  return <SidePanel />;
} 