# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based Installation Command Generator for Stonebranch Universal Agent/Controller. It's a static HTML/CSS/JavaScript application that helps users generate installation commands for:

- Universal Agent (Linux) - `sh ./unvinst` with various parameters
- Universal Agent (Windows) - `unvinst.exe` with various parameters  
- Universal Controller - `unvinst.sh` with database and admin configuration

## Architecture

The application follows a simple client-side architecture:

- **Static HTML pages**: `index.html`, `agent_linux.html`, `agent_windows.html`, `controller.html`
- **Single JavaScript file**: `script.js` - contains all form handling, command generation, and UI logic
- **Single CSS file**: `style.css` - contains all styling
- **Installation files**: Located in `ua/` directory containing actual Universal Agent installation files

### Core Components

- **Form Configuration**: All form definitions and defaults are centralized in the `forms` object in `script.js:3-63`
- **Dynamic Form Handler**: `setupForm()` function handles command generation for all installation types
- **Conditional UI Logic**: Toggle sections based on checkbox states (user options, advanced options, etc.)
- **Command Generation**: Builds installation commands by comparing form values against defaults

## Development Commands

Since this is a static web application, there are no build tools or package managers. Development involves:

- **Local Development**: Open `index.html` directly in a browser or serve via local HTTP server
- **Testing**: Manual testing in browser - no automated test framework present
- **File Serving**: Use `python -m http.server` or similar to serve files locally if needed

## Key Implementation Details

- Form defaults are defined per installation type in `script.js:7-62`
- Command generation logic only includes parameters that differ from defaults
- Checkbox parameters are converted to `yes`/`no` values in the command
- Additional parameters field allows arbitrary command-line additions
- Clipboard functionality for copying generated commands

## Files Structure

- `/` - Main application files (HTML, CSS, JS)
- `/ua/` - Universal Agent installation files and documentation
- `ua/Readme.unv` - Contains installation instructions and parameter documentation