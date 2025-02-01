import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

const LoadingComponent = () => <div className="loading-spinner">Cargando...</div>;

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingComponent />}>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
