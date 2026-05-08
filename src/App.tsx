import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import { APIProvider } from "@vis.gl/react-google-maps";

const queryClient = new QueryClient();
const API_KEY = "AIzaSyD_UGf6H95xsJ6e_kCjTmUSShXSoWA1P-c";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <APIProvider apiKey={API_KEY} libraries={["marker", "drawing"]}>
          <Toaster />
          <Index />
      </APIProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

