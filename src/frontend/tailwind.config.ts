import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";
import colors from "tailwindcss/colors";

const baseColors = [
   "gray",
   "red",
   "yellow",
   "green",
   "blue",
   "indigo",
   "purple",
   "pink",
];

const shadeMapping = {
   // Invert color shades
   "50": "900",
   "100": "800",
   "200": "700",
   "300": "600",
   "400": "500",
   "500": "400",
   "600": "300",
   "700": "200",
   "800": "100",
   "900": "50",
};

const generateThemeObject = (colors: any, mapping: any, invert: boolean) => {
   const theme: any = {};
   baseColors.forEach((color) => {
      theme[color] = {};
      Object.entries(mapping).forEach(([key, value]: any) => {
         const shadeKey = invert ? value : key;
         theme[color][key] = colors[color][shadeKey];
      });
   });
   return theme;
};


const themes = {
   light: {
      ...generateThemeObject(colors, shadeMapping, false),
      white: "#ffffff",
   },
   dark: {
      ...generateThemeObject(colors, shadeMapping, true),
      white: colors.gray["950"],
      black: colors.gray["50"],
   },
};

const config: Config = {
   darkMode: "class",
   content: [
      "./index.html",
      "./app/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      extend: {},
   },
   plugins: [createThemes(themes)],
};

export default config;
