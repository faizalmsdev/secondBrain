npm init -y
npm install -d typescript
npx tsc --init

npm install express
npm install -d @types/express
and install dependencies and types accordingly

then to run add 
    build: "tsc -b"
    start: "node dist/index.js",
    dev: "npm run build && npm run start"