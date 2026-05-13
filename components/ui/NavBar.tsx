"use client";
import Link from "next/link";
import Toggle from "./Toggle";
import Notification from "./Notification";

type NavBarProps = {
    page ?: string;
}
export default function NavBar({ page }: NavBarProps) {
    return(
        <nav className="flex justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold">OrcaML</h1>
                <Link href={`/${page}`} className="px-32">{page}</Link>
            </div>
            <div className="flex items-center gap-6 px-4">
                <Notification />
                <Toggle />
            </div>
          
        </nav>
    )
}
