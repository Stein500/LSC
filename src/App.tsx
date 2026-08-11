import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import { router } from "@/routes";
import { ThemeProvider } from "@/theme/ThemeContext";
import { isColombesApp } from "@/utils/appBridge";

export default function App() {
  // 📱 Dans l'app Colombes : animations transform/layout suspendues
  // (reducedMotion="always") — les transitions deviennent de simples
  // fondus instantanés, le scroll natif fait la fluidité. Zéro jitter.
  return (
    <HelmetProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion={isColombesApp() ? "always" : "user"}>
          <RouterProvider router={router} />
        </MotionConfig>
      </ThemeProvider>
    </HelmetProvider>
  );
}
