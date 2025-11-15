# Guide to build and run your Vue.js application as an Android App using Capacitor

This guide will walk you through the process of building your Vue.js application and running it on an Android device or emulator.

## Prerequisites

*   Android Studio installed on your machine.
*   An Android device or a configured Android emulator.

## Steps

1.  **Build your Vue.js application**

    First, you need to build your Vue.js application to generate the static assets that will be used by Capacitor. Run the following command in the `metainflu/frontend/client-app` directory:

    ```bash
    npm run build
    ```

    This command will create a `dist` directory containing the production-ready assets of your web app.

2.  **Sync your build with Capacitor**

    After the build is complete, you need to sync the web assets with your native Android project. Run the following command in the `metainflu/frontend/client-app` directory:

    ```bash
    npx cap sync android
    ```

    This command will copy the contents of the `dist` directory into the Android project.

3.  **Open the project in Android Studio**

    Now, open your native Android project in Android Studio.

    ```bash
    npx cap open android
    ```

    This command will launch Android Studio and open your project.

4.  **Run the application**

    In Android Studio, you can run your application on a connected Android device or an emulator.

    *   Select your device from the device dropdown menu.
    *   Click the "Run" button (the green play icon).

    Android Studio will build and run your application on the selected device.

## Additional Notes

*   Whenever you make changes to your Vue.js application, you need to rebuild it and sync the changes with your Android project.
*   You can find more information in the [Capacitor documentation](https://capacitorjs.com/docs).
