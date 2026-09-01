import type { CapacitorConfig } from "@capacitor/cli";

const liveUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.travelrecords.app",
  appName: "Travel Records",
  webDir: "client/dist",
  server: liveUrl
    ? {
        url: liveUrl,
        cleartext: liveUrl.startsWith("http://"),
      }
    : {
        androidScheme: "https",
      },
  android: {
    allowMixedContent: true,
  },
};

export default config;
