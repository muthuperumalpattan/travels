import type { CapacitorConfig } from "@capacitor/cli";

const liveUrl = process.env.CAPACITOR_SERVER_URL ?? "https://manitravelstuti.netlify.app";

const config: CapacitorConfig = {
  appId: "com.travelrecords.app",
  appName: "Mani Cars",
  webDir: "client/dist",
  server: liveUrl
    ? {
        url: liveUrl,
        cleartext: liveUrl.startsWith("http://"),
        allowNavigation: ["manitravelstuti.netlify.app"],
      }
    : {
        androidScheme: "https",
      },
  android: {
    allowMixedContent: true,
  },
};

export default config;
