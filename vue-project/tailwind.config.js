/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9f9',
                    100: '#d9f2f2',
                    200: '#b8e5e5',
                    300: '#8bd1d1',
                    400: '#5ab6b6',
                    500: '#3f9a9a',
                    600: '#317d7d',
                    700: '#2c6565',
                    800: '#285252',
                    900: '#254646',
                    950: '#112a2a',
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
