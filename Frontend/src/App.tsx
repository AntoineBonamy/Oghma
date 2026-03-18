import AppRouter from "./router";
import { AuthProvider } from "./contexts/Authcontext";

function App() {
  return <AuthProvider>
    <AppRouter />
  </AuthProvider>
}

export default App;
