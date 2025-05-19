# Competitive Programming Utility

A Node.js CLI tool that integrates with the [Competitive Companion](https://github.com/jmerle/competitive-companion) browser extension to streamline the workflow of competitive programming. It listens for problem data sent via HTTP POST, extracts test cases and metadata, and prepares everything locally so you can focus on solving the problem.

## Features

- Accepts problem data from the Competitive Companion browser extension
- Automatically extracts and saves test cases
- CLI interface to run, test, and configure problems
- Runs a local Express server to listen for incoming problem data
- Uses PM2 to manage the background server
- Configurable settings (like file paths, template locations, etc.)
- Clipboard integration for ease of use

---

## Installation

```bash
git clone https://github.com/<your-username>/cp_utility.git
cd cp_utility
npm install
chmod +x bin/cu
./install.sh
```

This will install dependencies and set up the CLI command cu globally.


---

Usage

1. Start the server:



cu start

2. Send a problem from the browser:



Install the Competitive Companion extension and click the plugin icon while viewing a problem.

3. Run test cases:



cu test

4. Show test cases:



cu show

5. Update configuration:



cu config set key value


---

Example Workflow

Go to a Codeforces problem in your browser

Click the Competitive Companion extension button

Problem data is POSTed to localhost:3000

This utility saves the problem and its test cases locally

Run and verify your code with cu test



---

Configuration

You can customize the behavior and paths used by the tool with:

cu config show         # View current config
cu config set key val  # Set a config value

Config is stored in a local .cuconfig.json file.


---

Technologies Used

Node.js

Commander (CLI commands)

Express (local server)

PM2 (background process manager)

Chalk (terminal colors)

Clipboardy (copy/paste support)



---

License

ISC


---

Author
Abhijeet Adarsh
