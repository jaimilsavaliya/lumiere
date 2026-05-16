import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
    opts?: CarouselOptions
    plugins?: CarouselPlugin
    orientation?: "horizontal" | "vertical"
    setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
    carouselRef: ReturnType<typeof useEmblaCarousel>[0]
    api: ReturnType<typeof useEmblaCarousel>[1]
    scrollPrev: () => void
    scrollNext: () => void
    canScrollPrev: boolean
    canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
    const context = React.useContext(CarouselContext)
    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />")
    }
    return context
}

function Carousel({
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
}: React.ComponentProps<"div"> & CarouselProps) {
    const [carouselRef, api] = useEmblaCarousel(
        { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
        plugins
    )

    const containerRef = React.useRef<HTMLDivElement>(null)

    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
        if (!api) return
        setCanScrollPrev(api.canScrollPrev())
        setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => { api?.scrollPrev() }, [api])
    const scrollNext = React.useCallback(() => { api?.scrollNext() }, [api])

    const handleKeyDown = React.useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); scrollPrev() }
            else if (event.key === "ArrowRight") { event.preventDefault(); scrollNext() }
        },
        [scrollPrev, scrollNext]
    )

    // Attach a NON-PASSIVE native wheel listener so we can scroll the embla viewport
    React.useEffect(() => {
        if (orientation !== "horizontal") return
        const el = containerRef.current
        if (!el) return

        const onWheel = (e: WheelEvent) => {
            // Only intercept when there's meaningful horizontal or diagonal intent
            const emblaViewport = el.querySelector<HTMLElement>("[data-slot='carousel-content']")
            if (!emblaViewport) return

            // If mostly vertical — let page scroll
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 2) return

            e.preventDefault()
            e.stopPropagation()

            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            if (delta > 0) scrollNext()
            else scrollPrev()
        }

        // { passive: false } is the critical part — React cannot do this
        el.addEventListener("wheel", onWheel, { passive: false })
        return () => el.removeEventListener("wheel", onWheel)
    }, [orientation, scrollNext, scrollPrev])

    React.useEffect(() => {
        if (!api || !setApi) return
        setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
        if (!api) return
        onSelect(api)
        api.on("reInit", onSelect)
        api.on("select", onSelect)
        return () => { api?.off("select", onSelect) }
    }, [api, onSelect])

    return (
        <CarouselContext.Provider
            value={{
                carouselRef,
                api,
                opts,
                orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
            }}
        >
            <div
                ref={containerRef}
                onKeyDownCapture={handleKeyDown}
                className={cn("relative", className)}
                role="region"
                aria-roledescription="carousel"
                data-slot="carousel"
                {...props}
            >
                {children}
            </div>
        </CarouselContext.Provider>
    )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
    const { carouselRef, orientation } = useCarousel()

    return (
        <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
            <div
                className={cn(
                    "flex",
                    orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
                    className
                )}
                {...props}
            />
        </div>
    )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
    const { orientation } = useCarousel()

    return (
        <div
            role="group"
            aria-roledescription="slide"
            data-slot="carousel-item"
            className={cn(
                "min-w-0 shrink-0 grow-0 basis-full",
                orientation === "horizontal" ? "pl-4" : "pt-4",
                className
            )}
            {...props}
        />
    )
}

function CarouselPrevious({
    className,
    variant = "outline",
    size = "icon",
    ...props
}: React.ComponentProps<typeof Button>) {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel()

    return (
        <Button
            data-slot="carousel-previous"
            variant={variant}
            size={size}
            className={cn(
                "absolute z-10 touch-manipulation rounded-full shadow-lg transition-all duration-200",
                "opacity-0 group-hover/carousel:opacity-100",
                "disabled:opacity-0 disabled:pointer-events-none",
                orientation === "horizontal"
                    ? "top-1/2 left-2 -translate-y-1/2"
                    : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
                className
            )}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            {...props}
        >
            <ChevronLeftIcon className="h-5 w-5" />
            <span className="sr-only">Previous slide</span>
        </Button>
    )
}

function CarouselNext({
    className,
    variant = "outline",
    size = "icon",
    ...props
}: React.ComponentProps<typeof Button>) {
    const { orientation, scrollNext, canScrollNext } = useCarousel()

    return (
        <Button
            data-slot="carousel-next"
            variant={variant}
            size={size}
            className={cn(
                "absolute z-10 touch-manipulation rounded-full shadow-lg transition-all duration-200",
                "opacity-0 group-hover/carousel:opacity-100",
                "disabled:opacity-0 disabled:pointer-events-none",
                orientation === "horizontal"
                    ? "top-1/2 right-2 -translate-y-1/2"
                    : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
                className
            )}
            disabled={!canScrollNext}
            onClick={scrollNext}
            {...props}
        >
            <ChevronRightIcon className="h-5 w-5" />
            <span className="sr-only">Next slide</span>
        </Button>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel }
