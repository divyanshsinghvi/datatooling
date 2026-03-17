!/bin/bash
# RunPod Development Environment Setup
# Sets up Zsh with autosuggestions, Starship prompt, and essential dev tools

set -e

echo "🚀 Setting up RunPod development environment..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configure HuggingFace cache location
echo -e "${BLUE}⚙️  Configuring environment variables...${NC}"
if ! grep -q "HF_HOME" ~/.bashrc; then
    echo "export HF_HOME=/workspace/hf_home/" >> ~/.bashrc
fi
if ! grep -q "HF_HOME" ~/.zshrc 2>/dev/null; then
    echo "export HF_HOME=/workspace/hf_home/" >> ~/.zshrc 2>/dev/null || true
fi
export HF_HOME=/workspace/hf_home/
export TRITON_CACHE_DIR=/workspace/.triton/cache

# Update and upgrade system
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt-get update -qq
apt-get upgrade -y -qq

# Install essential tools
echo -e "${BLUE}🛠️  Installing essential tools...${NC}"
apt-get install -y -qq \
    sudo \
    git \
    vim \
    ssh \
    net-tools \
    htop \
    curl \
    zip \
    unzip \
    tmux \
    rsync \
    libopenmpi-dev \
    iputils-ping \
    make \
    fzf \
    restic \
    ripgrep \
    wget \
    pandoc \
    poppler-utils \
    pigz \
    bzip2 \
    nano \
    locales \
    zsh \
    tree \
    jq \
    build-essential \
    python3-pip

# Install browser dependencies (for headless browser automation)
echo -e "${BLUE}🌐 Installing browser dependencies...${NC}"
apt-get install -y -qq \
    libnss3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2t64 2>/dev/null || apt-get install -y -qq libasound2 2>/dev/null || true

# Install Zsh
echo -e "${BLUE}🐚 Setting up Zsh...${NC}"

# Install Oh-My-Zsh
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo -e "${GREEN}Installing Oh-My-Zsh...${NC}"
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
else
    echo -e "${GREEN}Oh-My-Zsh already installed${NC}"
fi

# Install zsh-autosuggestions
ZSH_CUSTOM=${ZSH_CUSTOM:-~/.oh-my-zsh/custom}
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
    echo -e "${GREEN}Installing zsh-autosuggestions...${NC}"
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM}/plugins/zsh-autosuggestions
else
    echo -e "${GREEN}zsh-autosuggestions already installed${NC}"
fi

# Configure .zshrc
echo -e "${BLUE}⚙️  Configuring Zsh...${NC}"

# Enable zsh-autosuggestions plugin
if ! grep -q "zsh-autosuggestions" ~/.zshrc; then
    sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions)/' ~/.zshrc
fi

# Add autosuggestions configuration if not present
if ! grep -q "ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE" ~/.zshrc; then
    cat >> ~/.zshrc << 'EOF'

# Autosuggestions appearance (gray ghost text)
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=#808080"
ZSH_AUTOSUGGEST_STRATEGY=(history completion)
ZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20
EOF
fi

# Install Starship prompt
echo -e "${BLUE}⭐ Installing Starship prompt...${NC}"
if ! command -v starship &> /dev/null; then
    curl -sS https://starship.rs/install.sh | sh -s -- -y
else
    echo -e "${GREEN}Starship already installed${NC}"
fi

# Add Starship to .zshrc
if ! grep -q "starship init zsh" ~/.zshrc; then
    echo 'eval "$(starship init zsh)"' >> ~/.zshrc
fi

# Create Starship config
mkdir -p ~/.config
cat > ~/.config/starship.toml << 'EOF'
# Starship configuration for RunPod

[character]
success_symbol = "[➜](bold green)"
error_symbol = "[➜](bold red)"

[directory]
truncation_length = 3
truncate_to_repo = true
style = "bold cyan"

[git_branch]
symbol = " "
style = "bold purple"

[git_status]
conflicted = "🏳"
ahead = "⇡${count}"
behind = "⇣${count}"
diverged = "⇕⇡${ahead_count}⇣${behind_count}"
untracked = "🤷"
stashed = "📦"
modified = "📝"
staged = '[++\($count\)](green)'
renamed = "👅"
deleted = "🗑"

[python]
symbol = " "
style = "yellow bold"

[nodejs]
symbol = " "
style = "bold green"

[rust]
symbol = " "
style = "bold red"

[docker_context]
symbol = " "
style = "bold blue"

[package]
symbol = "📦 "
disabled = false

[cmd_duration]
min_time = 500
format = "took [$duration](bold yellow)"
EOF

# Change default shell to Zsh
echo -e "${BLUE}🔄 Setting Zsh as default shell...${NC}"
chsh -s $(which zsh) || echo -e "${GREEN}Note: Run 'chsh -s \$(which zsh)' manually if needed${NC}"

# Install uv (fast Python package installer)
echo -e "${BLUE}🐍 Installing uv and Python packages...${NC}"
if ! command -v uv &> /dev/null; then
    pip install uv -q --break-system-packages 2>/dev/null || pip install uv -q
fi

# Create virtual environment first to avoid externally-managed error
echo -e "${BLUE}🔧 Creating virtual environment...${NC}"
python_version=$(python --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1-2)
#if [ ! -d "$HOME/.venv" ]; then
if [ ! -d "/workspace/.venv" ]; then
    uv venv /workspace/.venv --python "$python_version" --system-site-packages
    echo -e "${GREEN}Virtual environment created at /workspace/.venv${NC}"
else
    echo -e "${GREEN}Virtual environment already exists at /workspace/.venv${NC}"
fi

# Install Python packages into the virtual environment
echo -e "${BLUE}📦 Installing Python ML/AI packages into venv...${NC}"
source /workspace/.venv/bin/activate
uv pip install --compile-bytecode -q \
    ipykernel \
    kaleido \
    nbformat \
    numpy \
    scipy \
    scikit-learn \
    scikit-image \
    transformers \
    datasets \
    torchvision \
    pandas \
    matplotlib \
    seaborn \
    plotly \
    jaxtyping \
    einops \
    tqdm \
    ruff \
    basedpyright \
    umap-learn \
    ipywidgets \
    virtualenv \
    pytest \
    "git+https://github.com/callummcdougall/eindex.git" \
    transformer_lens \
    nnsight

# Auto-activate venv in shell configs
if ! grep -q "source ~/.venv/bin/activate" ~/.zshrc 2>/dev/null; then
    echo -e "\n# Auto-activate virtual environment\nsource /workspace/.venv/bin/activate" >> ~/.zshrc 2>/dev/null || true
fi
if ! grep -q "source ~/.venv/bin/activate" ~/.bashrc; then
    echo -e "\n# Auto-activate virtual environment\nsource /workspace/.venv/bin/activate" >> ~/.bashrc
fi

# Import bash history to zsh if it exists
if [ -f ~/.bash_history ] && [ ! -f ~/.zsh_history ]; then
    echo -e "${BLUE}📜 Importing bash history...${NC}"
    if command -v python3 &> /dev/null; then
        python3 << 'PYTHON'
import time
import os

bash_hist = os.path.expanduser('~/.bash_history')
zsh_hist = os.path.expanduser('~/.zsh_history')

if os.path.exists(bash_hist):
    with open(bash_hist, 'r', errors='ignore') as bf:
        commands = bf.readlines()

    with open(zsh_hist, 'w') as zf:
        timestamp = int(time.time())
        for cmd in commands:
            cmd = cmd.strip()
            if cmd:
                zf.write(f': {timestamp}:0;{cmd}\n')
                timestamp += 1
    print(f"Imported {len(commands)} commands to Zsh history")
PYTHON
    fi
fi

#echo "IdentityFile /workspace/.ssh/id_rsa" >> ~/.ssh/config
mkdir -p ~/.ssh
cp /workspace/.ssh/id_rsa ~/.ssh/
cp /workspace/.ssh/id_rsa.pub ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa.pub
mkdir -p /mnt/d/code/open_source/mats/reasoning_resample/
ln -s /workspace/data /mnt/d/code/open_source/mats/reasoning_resample/data
mkdir -p /home/dsinghvi/code/open_source/mats/
ln -s /workspace/exploring_mech_interp /home/dsinghvi/code/open_source/mats/exploring_mech_interp

git config --global user.email divyanshsinghvi@gmail.com
git config --global user.name "Divyansh Singhvi"
git config --global credential.helper store

echo "export HF_HOME=/workspace/hf_home" >> ~/.zshrc
echo "source /workspace/.venv/bin/activate" >> ~/.zshrc
echo "export UV_CACHE_DIR=/workspace/.cache/.uv" >> ~/.zshrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
sudo apt install -y nodejs npm
npm install -g @anthropic-ai/claude-code




############### INSTALLING AGENTS ################

echo -e "${GREEN}✅ RunPod environment setup complete!${NC}"
echo ""
echo -e "${BLUE}To start using Zsh with inline ghost text:${NC}"
echo "  zsh"
echo ""
echo -e "${BLUE}Features installed:${NC}"
echo "  • Zsh with Oh-My-Zsh + inline command suggestions"
echo "  • Starship prompt with git status"
echo "  • Essential dev tools (git, vim, htop, tmux, fzf, ripgrep, etc.)"
echo "  • Browser dependencies for automation"
echo "  • Python ML/AI packages (transformers, torch, pandas, etc.)"
echo "  • uv package manager"
echo "  • Virtual environment at ~/.venv"
echo ""
echo -e "${BLUE}Environment variables:${NC}"
echo "  • HF_HOME=/workspace/hf_home/ (HuggingFace cache)"
echo ""
echo -e "${BLUE}Reminder:${NC}"
echo "  • Add your SSH key to your RunPod account for git operations"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"

