#!/bin/bash
# Quick setup for Zsh autosuggestions (inline ghost text)

echo "Setting up Zsh with inline ghost text..."
echo ""

# Install Oh-My-Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "Installing Oh-My-Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
    echo "✓ Oh-My-Zsh installed"
else
    echo "✓ Oh-My-Zsh already installed"
fi

# Install zsh-autosuggestions
PLUGIN_DIR="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions"
if [ ! -d "$PLUGIN_DIR" ]; then
    echo "Installing zsh-autosuggestions..."
    git clone https://github.com/zsh-users/zsh-autosuggestions "$PLUGIN_DIR"
    echo "✓ zsh-autosuggestions installed"
else
    echo "✓ zsh-autosuggestions already installed"
fi

# Configure .zshrc
if [ ! -f "$HOME/.zshrc" ]; then
    cat > "$HOME/.zshrc" << 'EOF'
# Path to oh-my-zsh
export ZSH="$HOME/.oh-my-zsh"

# Theme
ZSH_THEME="robbyrussell"

# Plugins (including autosuggestions)
plugins=(git zsh-autosuggestions)

source $ZSH/oh-my-zsh.sh

# Autosuggestions appearance
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#808080"
ZSH_AUTOSUGGEST_STRATEGY=(history completion)
EOF
    echo "✓ Created .zshrc with autosuggestions"
else
    # Add plugin if not present
    if ! grep -q "zsh-autosuggestions" "$HOME/.zshrc"; then
        sed -i 's/^plugins=(\(.*\))/plugins=(\1 zsh-autosuggestions)/' "$HOME/.zshrc"
        echo "✓ Added zsh-autosuggestions to plugins"
    fi

    # Add appearance config if not present
    if ! grep -q "ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE" "$HOME/.zshrc"; then
        cat >> "$HOME/.zshrc" << 'EOF'

# Autosuggestions appearance (gray ghost text)
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#808080"
ZSH_AUTOSUGGEST_STRATEGY=(history completion)
EOF
        echo "✓ Added autosuggestions configuration"
    fi
fi

# Import bash history
if [ -f "$HOME/.bash_history" ] && [ ! -f "$HOME/.zsh_history" ]; then
    echo "Importing bash history..."
    awk '{ print ": " systime() ":0;" $0 }' "$HOME/.bash_history" > "$HOME/.zsh_history"
    echo "✓ Imported $(wc -l < ~/.bash_history) commands"
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  Setup Complete!                      ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "To start using inline ghost text:"
echo ""
echo "1. Start Zsh:"
echo "   zsh"
echo ""
echo "2. Type a command (e.g., 'git s')"
echo "   You'll see gray text appear: git status"
echo "                                     ^^^^^^"
echo ""
echo "3. Press → (Right Arrow) to accept"
echo ""
echo "To make Zsh your default shell:"
echo "   chsh -s \$(which zsh)"
echo ""
