import { createRoot } from "react-dom/client"

import "./index.css"
import App from "@/main/App.tsx"
import { ThemeProvider } from "@/components/providers/theme-provider"
import AppProviders from "@/main/AppProviders.tsx"

createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="system">
        <AppProviders>
            <App />
        </AppProviders>
    </ThemeProvider>
)
