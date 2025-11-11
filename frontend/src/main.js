import "./index.css";
import "sweetalert2/dist/sweetalert2.min.css";
import { createApp } from "vue";
import router from "./router";
import App from "./pages/App.vue";
createApp(App).use(router).mount("#app");
