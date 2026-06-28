# ForgeLog CI/CD Setup Guide

Based on the agent debate, the most robust and pain-free way to set up CI/CD for a Go + Expo stack is a **Hybrid Approach**:
- **GitHub Actions**: Acts as the central orchestrator to run automated tests on every push.
- **EAS (Expo Application Services)**: Handles the complex iOS/Android code signing and builds.
- **PaaS (Render/Fly.io)**: Handles the backend hosting, triggered by a webhook.

Here is your step-by-step setup guide.

---

## 1. Directory Setup
Create the GitHub Actions workflow directory in the root of your project:
```bash
mkdir -p .github/workflows
```

## 2. Backend CI/CD Workflow
This pipeline will run your Go tests every time you push. If you push to `main`, it will also trigger a deployment to your hosting provider (e.g., Render) using a Deploy Hook.

Create `.github/workflows/backend.yml`:
```yaml
name: Backend CI/CD

on:
  push:
    paths:
      - 'backend/**'
      - '.github/workflows/backend.yml'
  pull_request:
    paths:
      - 'backend/**'

jobs:
  test:
    name: Run Go Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
        
    steps:
      - name: Check out code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'
          cache-dependency-path: backend/go.sum

      - name: Download dependencies
        run: go mod download

      - name: Run Tests
        run: go test -v ./...

  deploy:
    name: Deploy to Production
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - name: Trigger Deploy Hook
        # Replace this URL with the Deploy Hook URL from Render, Fly.io, or your hosting provider
        run: curl -X POST ${{ secrets.BACKEND_DEPLOY_HOOK_URL }}
```

## 3. Mobile CI/CD Workflow (EAS)
This pipeline triggers Expo to build your mobile app in the cloud whenever you push to `main`. It hands off the complex code-signing to EAS.

Create `.github/workflows/mobile.yml`:
```yaml
name: Mobile CI/CD

on:
  push:
    branches:
      - main
    paths:
      - 'mobile/**'
      - '.github/workflows/mobile.yml'

jobs:
  build:
    name: Build via EAS
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./mobile

    steps:
      - name: Check out code
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Install Dependencies
        run: npm ci

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android & iOS
        # This triggers builds on Expo's servers (not using GitHub Actions minutes!)
        # The --non-interactive flag ensures it doesn't wait for user input
        run: eas build --platform all --non-interactive
```

---

## 4. Required Secrets
To make this work, you need to add two **Repository Secrets** in your GitHub repository (`Settings > Secrets and variables > Actions > New repository secret`):

1. `BACKEND_DEPLOY_HOOK_URL`: When you create a Web Service on a platform like Render, they give you a "Deploy Hook URL". Paste that here.
2. `EXPO_TOKEN`: Create this by logging into your Expo account on the web, going to **Access Tokens**, and generating a new token.

## 5. Next Steps
Once you commit and push these files to GitHub, your pipelines will automatically spring to life!
- Pushing backend code will run your Go tests.
- Pushing to `main` will automatically deploy your backend API and queue up an EAS build for your mobile apps.
