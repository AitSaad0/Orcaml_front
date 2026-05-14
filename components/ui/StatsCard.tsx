import { StatsCardProps } from "@/types/StatsCardProps";

export default function StatsCard({title, value, icon}: StatsCardProps) {
    return(
        <div className="bg-card text-card-foreground border border-border p-4 rounded-lg shadow-md w-full">
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className="text-muted-foreground shrink-0">
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
    )
}   