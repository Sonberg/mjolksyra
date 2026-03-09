import addonPerformancePanel from "@github-ui/storybook-addon-performance-panel";
import { definePreview } from "@storybook/nextjs";
import "../app/globals.css";

const preview = definePreview({
  addons: [addonPerformancePanel()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
});

export default preview;
