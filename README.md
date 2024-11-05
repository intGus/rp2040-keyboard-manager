# Keycode Configuration and Serial Communication App

A React-based application designed to configure and manage keycodes and LED intensities via JSON files. The app enables users to edit keycode mappings for multiple GPIO pins and adjust LED intensity values. It supports loading configurations from JSON files and saving updates back to the file system. Additionally, the app communicates with a serial device to reset and apply configurations.

## Features

- **Configurable Keycodes and LED Intensities**: Allows users to load, edit, and save configurations for key mappings and LED intensities.
- **String and Array Modes**: Supports both string and array formats for keycodes, with toggleable string mode for each pin.
- **Serial Communication**: Sends a reset signal to a connected device to apply configuration changes.
- **Interactive UI**: Provides a clear UI with editable fields, keyboard-based keycode inputs, and real-time validation.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/intGus/rp2040-keyboard-manager.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd rp2040-keyboard-manager
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Start the application**:
    ```bash
    npm run dev
    ```

## Usage

1. **Load Configuration and Connect to the Board**:
   - Click the **Load Config File** button to open the `keyboard_config.json` file located in the root directory of the CircuitPython board. The board should appear as "CircuitPython" in your file explorer.
   - After selecting the configuration file, the app will establish a serial connection with the board, which should appear as "Pico W" or "CircuitPython" in the list of available devices. This connection initializes the UI with the current values for pin mappings and LED intensities.
   - Refer to the [repository for the board](https://github.com/intGus/rp2040-keyboard) for more details on configuration options and setup requirements.

2. **Edit Keycodes and Intensities**:
   - **Keycodes**: Click on a pin to edit its keycodes. You can toggle between array mode (multiple keycodes) and string mode for each pin using the checkbox.
   - **String Mode**: Switch to string mode to enter a custom string, and click the checkbox again to return to keycode array mode.
   - **LED Intensities**: Adjust LED intensities using sliders.

3. **Reset Device**:
   - Use the **Reset Board** button to to write changes back to the JSON file and send a reset command to the serial device. Click "Save Changes" if prompted.

## File Structure

- **App Component**: Main application logic for loading, saving, and managing keycodes and intensities.
- **Components**:
  - **KeycodeInput**: Handles keycode array inputs.
  - **LEDIntensityInput**: Provides an adjustable slider for LED intensities.
  - **SerialTerminal**: Displays serial output.

## Configuration Format

The JSON configuration file should follow this structure:

```json
{
  "button_pins": {
    "GP1": ["E"],
    "GP2": ["R"],
    "GP14": { "string": "this is a test\n" },
    "GP15": ["R"]
  },
  "led_intensities": [25, 50, 75, 100]
}
