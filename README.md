# Base ExpressJS

Base Express JS is a foundational application for constructing RESTful APIs with Node.js.

## Requirements

- node >= 20

## Usage

1. Clone project
2. Create `.env` file, copy content from [.env.example](./.env.example) to `.env` file and config in `.env`:

- Config Runtime Environment

```bash
HOST=localhost
PORT=3456
```

- Config Project

```bash
APP_NAME=Express App
# server domain name
APP_URL_API=http://localhost:3456
# primary client domain name
APP_URL_CLIENT=http://localhost:3000
# other client domain name
# Eg: ["http://localhost:3001", "http://localhost:3002"]
OTHER_URLS_CLIENT=
# primary secret key
SECRET_KEY=
# expressed in seconds or a string describing a time span
# Eg: 60, 2 days, 10h, 7d
LOGIN_EXPIRE_IN=7d
# maximum number of requests per minute
REQUESTS_LIMIT_PER_MINUTE=100
```

- Config MongoDb Database

```bash
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_AUTH_SOURCE=admin
```

- Config Email

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=no-reply@gmail.com
MAIL_FROM_NAME=
```

3. Install package & setup

```bash
npm i
```

4. Initialize data (Required for new database)

```bash
npm run seed
```

5. Runs the app

```bash
npm start
```

6. Builds the app for production to the `build` folder

```bash
npm run build
```

7. Runs the app on `production` mode

```bash
node build/main.js
```

##### Default account

```yaml
Email: admin@zent.vn
Password: Zent@123.edu.vn
```

## Credits

[Vũ Xuân Hoàng](https://gitlab.com/hoangvxzentvn).
