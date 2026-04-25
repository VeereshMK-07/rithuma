import Header from "./Header";
import BottomNav from "./BottomNav";
import "../../styles/navigation.css";

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Header />

      <main className="flex-1 px-10 py-8 w-full pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

export default AppLayout;
