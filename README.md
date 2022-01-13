# Party With Me

Manage all your parties!

## Installation

Use the package manager [yarn](https://yarnpkg.com/) to install all the dependencies.

```bash
yarn install
```

Generate new RSA-Keypair for authentication.

```bash
cd cli-util && ./generate-keypair.sh
```

Build all apps located in apps folder.

```bash
npm run build
```

Start all apps in a process manager (preferred pm2)

```bash
pm2 ecosystem.config.js
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
