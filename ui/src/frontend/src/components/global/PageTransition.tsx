import { motion } from "framer-motion"
import { ReactNode } from "react"

const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1], // fluid ease-out
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.3,
            ease: [0.25, 1, 0.5, 1],
        },
    },
}

interface PageTransitionProps {
    children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full w-full"
        >
            {children}
        </motion.div>
    )
}
