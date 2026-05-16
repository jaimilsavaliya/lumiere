import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "@/components/global/SearchDialog.tsx"
import { LucideSearch, Moon, Star, Sun } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { Link } from "react-router-dom"
import { useTheme } from "@/components/providers/theme-provider"

export default function Header() {
    const [openCommand, setOpenCommand] = useState(false)
    const { theme, setTheme } = useTheme()

    const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    useEffect(() => {
        const handleOpenSearchCommand = () => {
            setOpenCommand(true)
        }

        window.addEventListener("open-search-command", handleOpenSearchCommand)

        return () => {
            window.removeEventListener("open-search-command", handleOpenSearchCommand)
        }
    }, [])

    return (
        <header className="relative flex h-16 items-center border-b border-border backdrop-blur-sm">
            {/* Left */}
            <SidebarTrigger className="z-10 ml-4" />

            {/* Center */}
            <div className="absolute left-1/2 w-full max-w-[70%] -translate-x-1/2 px-2 sm:max-w-md md:max-w-lg lg:max-w-xl">
                <Button
                    variant="outline"
                    className="flex w-full items-center justify-start text-sm text-muted-foreground"
                    onClick={() => setOpenCommand(true)}
                >
                    <LucideSearch className="mr-2 h-4 w-4 shrink-0" />

                    {/* Hidden on very small screens */}
                    <span className="hidden sm:inline">Search Movie or TV Show...</span>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Hidden on mobile */}
                    <span className="hidden items-center gap-1 md:flex">
                        <Kbd>⌘</Kbd>+<Kbd>J</Kbd>
                    </span>
                </Button>

                <SearchDialog open={openCommand} setOpen={setOpenCommand} />
            </div>

            {/* Right */}
            <div className="z-10 mr-4 ml-auto flex items-center gap-1">
                <Button
                    id="theme-toggle-btn"
                    variant="ghost"
                    size="icon"
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Button variant="ghost" asChild>
                    <Link to="https://github.com/jaimilsavaliya/lumiere" target="_blank" rel="noopener">
                        <Star />
                        <span className="ml-1 hidden sm:inline">GitHub</span>
                    </Link>
                </Button>
            </div>
        </header>
    )
}
