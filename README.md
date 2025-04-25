# KubeIntel

A modern desktop application for Kubernetes cluster management built with Tauri, Rust, React, TypeScript, Shadcn UI, and Tailwind CSS.

<img src="kubeintel.png" alt="KubeIntel Screenshot" width="200px" height="auto" />

## Overview

KubeIntel provides a powerful, user-friendly interface for browsing Kubernetes resources and leveraging AI to quickly troubleshoot pods and containers.

## Installation

### Downloads

Available for Windows, macOS, and Linux.
Ready to try KubeIntel? Download the latest version for your operating system:

<a href="https://github.com/misoukrane/kubeintel-app/releases" target="_blank">
    <img src="https://img.shields.io/github/v/release/misoukrane/kubeintel-app?label=Download%20Latest%20Release&style=for-the-badge" alt="Download KubeIntel" />
</a>




## Features

- 🔍 Browse and manage Kubernetes cluster resources
- 🤖 AI-powered debugging for pods and containers
- 📊 Real-time log and event monitoring
- 🖥️ Integrated container shell access
- 🌐 Multi-cluster support
- 💻 Cross-platform (Windows, macOS, Linux)

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/en/download/) (v16+)
- [pnpm](https://pnpm.io/installation)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Development

### Installation

1. **Install Rust and Tauri CLI**
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    ```

2. **Install Node.js**
    ```bash
    # macOS
    brew install node
    
    # Ubuntu
    sudo apt install nodejs npm
    
    # Windows
    choco install nodejs
    ```

3. **Install pnpm**
    ```bash
    npm install -g pnpm
    ```

4. **Install project dependencies**
    ```bash
    pnpm install
    ```

### Development Workflow

**Start the development server:**
```bash
pnpm tauri dev
```

**Build for production:**
```bash
pnpm tauri build
```

## Technology Stack

### Frontend
- ⚛️ **React** - Component-based UI library
- 📘 **TypeScript** - Type-safe JavaScript
- 🎨 **Shadcn UI** - Beautiful, accessible components ([ui.shadcn.com](https://ui.shadcn.com/))
- 🌊 **Tailwind CSS** - Utility-first CSS framework

### Backend
- 🦀 **Rust** - Performance and reliability
- 🚀 **Tauri** - Native app framework with web frontend

### Kubernetes Integration
- 🔄 **TypeScript Client** - [@kubernetes/client-node](https://github.com/kubernetes-client/javascript)
- 🔧 **Rust Client** - [kube-rs](https://github.com/kube-rs/kube)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.
