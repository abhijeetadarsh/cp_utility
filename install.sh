#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Determine if running as root
if [[ $EUID -ne 0 ]]; then
    SUDO='sudo'
else
    SUDO=''
fi

# Function to compare versions
version_lt() {
    # Compare two versions, returns true if the first is less than the second
    [ "$(printf '%s\n' "$1" "$2" | sort -V | head -n1)" != "$2" ]
}

# Check and install nodejs if needed
package_nodejs="nodejs"
nodejs_installed_version=$(pacman -Q $package_nodejs 2>/dev/null | awk '{print $2}')
nodejs_required_version="22.5.1"

if [[ -z "$nodejs_installed_version" ]]; then
    echo -e "${YELLOW}$package_nodejs is not installed. Installing...${NC}"
    $SUDO pacman -S --noconfirm $package_nodejs
elif version_lt "$nodejs_installed_version" "$nodejs_required_version"; then
    echo -e "${YELLOW}$package_nodejs version $nodejs_installed_version is older than $nodejs_required_version. Installing the latest version...${NC}"
    $SUDO pacman -S --noconfirm $package_nodejs
else
    echo -e "${GREEN}$package_nodejs version $nodejs_installed_version is already up-to-date.${NC}"
fi

# Check and install npm if needed
package_npm="npm"
npm_installed_version=$(pacman -Q $package_npm 2>/dev/null | awk '{print $2}')
npm_required_version="9.0.0"

if [[ -z "$npm_installed_version" ]]; then
    echo -e "${YELLOW}$package_npm is not installed. Installing...${NC}"
    $SUDO pacman -S --noconfirm $package_npm
elif version_lt "$npm_installed_version" "$npm_required_version"; then
    echo -e "${YELLOW}$package_npm version $npm_installed_version is older than $npm_required_version. Installing the latest version...${NC}"
    $SUDO pacman -S --noconfirm $package_npm
else
    echo -e "${GREEN}$package_npm version $npm_installed_version is already up-to-date.${NC}"
fi

# Check and install pm2 if needed
pm2_required_version="5.4.0"
pm2_installed_version=$(pm2 -v 2>/dev/null | awk '{print $1}')

if [[ -z "$pm2_installed_version" ]]; then
    echo -e "${YELLOW}pm2 is not installed. Installing via npm...${NC}"
    $SUDO npm install -g pm2
elif version_lt "$pm2_installed_version" "$pm2_required_version"; then
    echo -e "${YELLOW}pm2 version $pm2_installed_version is older than $pm2_required_version. Updating via npm...${NC}"
    $SUDO npm install -g pm2
else
    echo -e "${GREEN}pm2 version $pm2_installed_version is already up-to-date.${NC}"
fi

# Define the directories
INSTALL_DIR="$HOME/tools/cp_utility"
SOURCE_DIR=$(dirname "$0")
CACHE_DIR="$HOME/.cache/cp_utility"
CONFIG_DIR="$HOME/.config/cp_utility"

# Create the target directory and copy files
echo -e "${YELLOW}Creating directory $INSTALL_DIR and copying files...${NC}"
mkdir -p "$INSTALL_DIR"
cp -r "$SOURCE_DIR/"* "$INSTALL_DIR/"

# Change to the install directory
cd "$INSTALL_DIR"

# Install production dependencies in the install directory
echo -e "${YELLOW}Installing production dependencies in $INSTALL_DIR...${NC}"
npm install --omit=dev

# Create cache and config directories
echo -e "${YELLOW}Creating directories $CACHE_DIR and $CONFIG_DIR...${NC}"
mkdir -p "$CACHE_DIR"
mkdir -p "$CONFIG_DIR"

# Add $INSTALL_DIR/bin to the PATH
path_to_add="$INSTALL_DIR/bin"

# Determine the shell and update the appropriate config file
case "$SHELL" in
    */bash)
        echo -e "${YELLOW}Updating ~/.bashrc to include $path_to_add in PATH...${NC}"
        echo "export PATH=\"$path_to_add:\$PATH\"" >> "$HOME/.bashrc"
        echo -e "${YELLOW}Please run 'source ~/.bashrc' to apply the changes.${NC}"
        ;;
    */zsh)
        echo -e "${YELLOW}Updating ~/.zshrc to include $path_to_add in PATH...${NC}"
        echo "export PATH=\"$path_to_add:\$PATH\"" >> "$HOME/.zshrc"
        echo -e "${YELLOW}Please run 'source ~/.zshrc' to apply the changes.${NC}"
        ;;
    */fish)
        echo -e "${YELLOW}Updating ~/.config/fish/config.fish to include $path_to_add in PATH...${NC}"
        echo "set -gx PATH $path_to_add \$PATH" >> "$HOME/.config/fish/config.fish"
        echo -e "${YELLOW}Please run 'source ~/.config/fish/config.fish' to apply the changes.${NC}"
        ;;
    *)
        echo -e "${RED}Unsupported shell detected ($SHELL). Please manually add $path_to_add to your PATH.${NC}"
        ;;
esac

echo -e "${GREEN}All tasks completed successfully.${NC}"
