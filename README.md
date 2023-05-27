# Nostr App Manager

Every day new apps are created by awesome Nostr devs.

Every minute three new event kinds are invented by Pablo.

How could you discover those new apps? How could you control which apps to use? For which event kind? On which device?

Nostr App Manager is here to help:

- Paste a nostr identifier - pubkey, event id, note, npub, nevent, nprofile, naddr, any kind of nostr: link or a url from any Nostr web client.
- Get a list of apps that can be used to view this Nostr event.
- Remember the chosen app to get redirected to it next time.
- Manage your list of apps, recommend apps to followers, etc (coming soon)

This app is open source, it has no backend and no trackers. Your app settings are stored in your browser, and your app list is only published if you choose to do so.

If you're a client dev, consider redirecting users to this app for event kinds that your client does not support, and for "sharing". For microapps to work, we need a smooth way for users to switch between apps. Nostr App Manager is an attempt to lubricate the microapp experience.


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
