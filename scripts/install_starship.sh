#!/bin/bash
# Install Starship - A beautiful, fast, customizable prompt for any shell!

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║        Installing Starship Prompt for Zsh        ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Install Starship
if command -v starship &> /dev/null; then
    echo "✓ Starship already installed: $(starship --version)"
else
    echo "Installing Starship..."
    curl -sS https://starship.rs/install.sh | sh -s -- -y
    echo "✓ Starship installed"
fi

# Add to .zshrc
if grep -q "starship init zsh" ~/.zshrc 2>/dev/null; then
    echo "✓ Starship already in .zshrc"
else
    echo "" >> ~/.zshrc
    echo "# Starship prompt" >> ~/.zshrc
    echo 'eval "$(starship init zsh)"' >> ~/.zshrc
    echo "✓ Added Starship to .zshrc"
fi

# Create Starship config
mkdir -p ~/.config
cat > ~/.config/starship.toml << 'EOF'
# Starship configuration

# Use custom format
format = """
[┌─](#9A348E)$username[@](#9A348E)$hostname[─](#9A348E)$directory$git_branch$git_status$python
[└─](#9A348E)$character"""

# Disable the blank line at the start of the prompt
add_newline = false

# Username
[username]
style_user = "bold green"
style_root = "bold red"
format = "[$user]($style)"
disabled = false
show_always = true

# Hostname
[hostname]
ssh_only = false
format = "[$hostname](bold yellow)"
disabled = false

# Directory
[directory]
style = "bold cyan"
truncation_length = 3
truncate_to_repo = true
format = "[ in $path]($style) "

# Git Branch
[git_branch]
symbol = "🌱 "
style = "bold purple"
format = "[on $symbol$branch]($style) "

# Git Status
[git_status]
style = "bold red"
format = "([$all_status$ahead_behind]($style) )"
conflicted = "⚔️ "
ahead = "⇡${count} "
behind = "⇣${count} "
diverged = "⇕⇡${ahead_count}⇣${behind_count} "
untracked = "🤷 "
stashed = "📦 "
modified = "📝 "
staged = '[++\($count\)](green) '
renamed = "👅 "
deleted = "🗑️ "

# Python
[python]
symbol = "🐍 "
style = "bold yellow"
format = '[${symbol}${pyenv_prefix}(${version} )(\($virtualenv\) )]($style)'

# Character (prompt symbol)
[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"

# Time
[time]
disabled = false
format = '[ $time]($style) '
style = "bold gray"
time_format = "%T"

# Command Duration
[cmd_duration]
min_time = 500
format = "took [$duration](bold yellow) "
EOF

echo "✓ Created Starship config at ~/.config/starship.toml"
echo ""

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║              Installation Complete!               ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "Your new prompt includes:"
echo "  • Username and hostname in color"
echo "  • Current directory (truncated)"
echo "  • Git branch and status with icons"
echo "  • Python virtual environment"
echo "  • Command duration (if >500ms)"
echo "  • Time on the right"
echo ""
echo "To activate:"
echo "  1. Reload: source ~/.zshrc"
echo "  2. Or restart Zsh: zsh"
echo ""
echo "To customize: edit ~/.config/starship.toml"
echo ""
