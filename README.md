# GenAI Kitchen - Redesign kitchens with AI

This project allows you to transform any kitchen using AI. Upload a photo of your kitchen and see it redesigned in various styles.

[![Kitchen Redesign](./public/screenshot.png)](https://genai-kitchen.vercel.app)

## How it works

It uses an ML model called [Flux Canny Pro](https://replicate.com/black-forest-labs/flux-canny-pro) to generate styled variations of kitchens. This application gives you the ability to upload a photo of any kitchen, which will send it through this ML Model using a Next.js API route, and return your generated kitchen. The ML Model is hosted on [Replicate](https://replicate.com) and [Bytescale](https://www.bytescale.com/) is used for image storage.

## Running Locally

### Cloning the repository the local machine.

```bash
git clone https://github.com/yourusername/GenAI_Kitchen
```

### Creating a account on Replicate to get an API key.

1. Go to [Replicate](https://replicate.com/) to make an account.
2. Click on your profile picture in the top left corner, and click on "API Tokens".
3. Here you can find your API token. Copy it.

### Storing the API keys in .env

Create a file in root directory of project with env. And store your API key in it, as shown in the .example.env file.

If you'd also like to do rate limiting, create an account on UpStash, create a Redis database, and populate the two environment variables in `.env` as well. If you don't want to do rate limiting, you don't need to make any changes.

### Installing the dependencies.

```bash
npm install
```

### Running the application.

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
npm run dev
```

## One-Click Deploy

Deploy the example using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/GenAI_Kitchen&env=REPLICATE_API_KEY&project-name=genai-kitchen&repo-name=GenAI_Kitchen)

## License

This repo is MIT licensed.
