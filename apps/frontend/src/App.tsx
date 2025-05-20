import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home/Home.tsx";
import { Game } from "./pages/Game/Game.tsx";
import { Results } from "./pages/Results/Results.tsx";
import { Settings } from "./pages/Settings/Settings.tsx";
import { NotFound } from "./pages/NotFound/NotFound.tsx";
import { GamePage } from "./pages/Game/GamePage.tsx";

const appRouter = createBrowserRouter([
  {
    path: "/",
    Component: Home
  },
  {
    path: "/game",
    // Component: Game
    Component: GamePage
  },
  {
    path: "/results",
    Component: Results
  },
  {
    path: "/settings",
    Component: Settings
  },
  {
    path: "*",
    Component: NotFound
  }
]);

export default appRouter;
