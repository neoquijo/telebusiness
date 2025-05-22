import React, { useEffect } from "react";
import { ModuleRegistry } from "../Registry";
import { AppRouter } from "./router/AppRouter";
import { Provider, useDispatch } from "react-redux";
import { mainStore } from "../store/MainStore";
import { ThemeProvider } from "./theme/themeProvider";
import { authModule } from "../../modules/AuthModule/AuthModule";
import { Bounce, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { authService } from "../../services/auth/authService";


import { ModalProvider } from "./modal/ModalProvider";
import { BrowserRouter } from "react-router-dom";
import { accountsModule } from "../../modules/AccountsModule/AccountsModule";
import { dialogsModule } from "../../modules/DialogsModule/DialogsModule";
import { tasksModule } from "../../modules/TasksModule/TasksModule";
import { filtersModule } from "../../modules/FiltersModule/FiltersModule";
import { messagesModule } from "../../modules/MessagesModule/MessagesModule";
import { leadsModule } from "../../modules/LeadsModule/LeadsModule";
import { setAuth, setUser } from "../store/slices/authSlice";

const registry = ModuleRegistry.getInstance();
const router = new AppRouter();

registry.registerModules([
  authModule,
  accountsModule,
  dialogsModule,
  filtersModule,
  messagesModule,
  tasksModule,
  leadsModule
]);
router.addRoutes(registry.getAllRoutes());

const RouterComponent = router.getRouter();

// Компонент для инициализации проверки токена
const AuthInitializer: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const isValid = await authService.checkAuth(token);
          if (!isValid) {
            console.log("Invalid token detected on startup, cleaning state");
            dispatch(setAuth(false));
            dispatch(setUser(undefined));
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Error checking auth on startup:", error);
          dispatch(setAuth(false));
          dispatch(setUser(undefined));
          localStorage.removeItem('token');
        }
      } else {
        console.log("No token found on startup, ensuring logged out state");
        dispatch(setAuth(false));
        dispatch(setUser(undefined));
      }
    };
    
    initAuth();
  }, [dispatch]);
  
  return <>{children}</>;
};

const AppProvider: React.FC = () => {
  return <>
    <Provider store={mainStore}>
      <BrowserRouter>
        <ModalProvider>
          <ThemeProvider>
            <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
            <AuthInitializer>
              {<RouterComponent />}
            </AuthInitializer>
          </ThemeProvider>
        </ModalProvider>
      </BrowserRouter>
    </Provider>
  </>
};

export default AppProvider;
