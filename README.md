# 🎨 AI Git Artist

**AI Git Artist** is a professional command-line tool that transforms your GitHub contribution graph into a pixel art canvas using AI-powered analysis, workflow automation, and robust safety features.

Whether you want to write your name, draw a rocket, or generate abstract art, this tool makes it easy and safe to express yourself on your GitHub profile.

---

## ✨ Features

- **🧠 Intelligent Art Generation:**
  - **AI Triage:** Understands natural language prompts like "draw a heart" or "write my name" and routes them correctly.
  - **Generative AI Artist:** Creates unique pixel art from creative descriptions using Google's Gemini AI.
  - **Deterministic Text Rendering:** Renders any text with a clean, 7-pixel-high monospace font.
  - **Curated Pattern Library:** Includes high-quality, pre-made shapes like hearts, stars, and more.

- **🚀 Automated Workflow:**
  - **Automatic Repository Management:** Creates a new private repository on your GitHub account to house the commits.
  - **Seamless Authentication:** Uses your Personal Access Token (PAT) for all GitHub operations.
  - **Persistent Project Manager:** Manages multiple art repositories, so you can switch between projects easily.

- **🎨 Creative Control:**
  - **Multi-Level Density:** Uses 4 levels of commit density to create shading and depth in your artwork.
  - **Flexible Positioning:** Place your artwork anywhere on the graph with a simple week offset.

- **🛡️ Safety First:**
  - **Undo Last Action:** Instantly revert the last drawing operation with a single command.
  - **Resilient History Wipe:** Safely reset your art repository to a blank slate, with a double-confirmation prompt to prevent accidents.
  - **Live Preview:** See an ASCII representation of your art in the terminal *before* a single commit is made.

---

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-git-artist.git
    cd ai-git-artist
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Copy the example `.env` file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and add your credentials:
        -   `GITHUB_PAT`: A [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope.
        -   `GEMINI_API_KEY`: Your [Google AI API key](https://makersuite.google.com/app/apikey).

4.  **Make the tool globally available (Optional but Recommended):**
    ```bash
    npm link
    ```
    Now you can run `ai-git-artist` from any directory.

---

## Usage

The tool is organized into intuitive commands.

### `draw` - Create artwork

This is the main command for creating art.

```bash
ai-git-artist draw "<prompt>" [options]# artist
