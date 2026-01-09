import { Route, Router, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Router>
          <Switch>
            <Route path="/">
              <h1>Home Page</h1>
            </Route>
            <Route>
              <h1>404 - Not Found</h1>
            </Route>
          </Switch>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
