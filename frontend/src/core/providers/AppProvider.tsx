import React from "react";
import { ModuleRegistry } from "../Registry";
import { AppRouter } from "./router/AppRouter";
import { Provider } from "react-redux";
import { mainStore } from "../store/MainStore";
import { ThemeProvider } from "./theme/themeProvider";
import { authModule } from "../../modules/AuthModule/AuthModule";
import { Bounce, ToastContainer } from "react-toastify";


import { ModalProvider } from "./modal/ModalProvider";
import { BrowserRouter } from "react-router-dom";
import { accountsModule } from "../../modules/AccountsModule/AccountsModule";
import { dialogsModule } from "../../modules/DialogsModule/DialogsModule";
import { tasksModule } from "../../modules/TasksModule/TasksModule";
import { filtersModule } from "../../modules/FiltersModule/FiltersModule";
import { messagesModule } from "../../modules/MessagesModule/MessagesModule";

const registry = ModuleRegistry.getInstance();
const router = new AppRouter();

registry.registerModules([
  authModule,
  accountsModule,
  dialogsModule,
  filtersModule,
  messagesModule,
  tasksModule
]);
router.addRoutes(registry.getAllRoutes());

const RouterComponent = router.getRouter();

const AppProvider: React.FC = () => {
  return <>
    <Provider store={mainStore}>
      <BrowserRouter>
        <ModalProvider>

          {/* <ModalProvider /> */}
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
            {<RouterComponent />}
          </ThemeProvider>
        </ModalProvider>
      </BrowserRouter>
    </Provider>
  </>
};

export default AppProvider;
