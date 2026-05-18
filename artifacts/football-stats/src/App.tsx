import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LiveEntry from "@/pages/enter/index";
import OffenseEntry from "@/pages/enter/offense/index";
import DefenseEntry from "@/pages/enter/defense/index";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/enter" component={LiveEntry} />
      <Route path="/enter/offense" component={OffenseEntry} />
      <Route path="/enter/defense" component={DefenseEntry} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
