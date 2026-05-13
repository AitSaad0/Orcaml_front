import NavBar from "@/components/ui/NavBar";
import Sidebar from "@/components/ui/SideBar";
export default function MainLayout({
    children, 
} : {
    children: React.ReactNode
}){
    return(
        <div className="flex flex-col h-screen">
            <NavBar page="dashboard" />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    )
}