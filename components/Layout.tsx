import { Footer } from "@/components/Footer";
import Header from "@/components/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <div className="w-full h-screen overflow-hidden absolute left-0 top-0 z-[2] pointer-events-none">
        <div className="border-0 bg-[url('/background.svg')] bg-center bg-no-repeat bg-cover w-full h-1/2 absolute left-0 top-0 z-[1] max-h-[400px]"></div>
        <div className="absolute left-1/2 top-[270px] w-[670px] lg:w-3/5 lg:min-w-[907px] aspect-square rounded-full bg-white z-[2] -translate-x-1/2"></div>
      </div>
      <div className="w-full flex-1 border-0 relative z-[3] bg-transparent shadow-none flex flex-col">
        <Header />
        <div className="pb-12 pt-16 max-w-[614px] lg:w-3/5 w-full mx-auto flex-1">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
