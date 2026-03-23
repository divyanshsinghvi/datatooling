#!/bin/bash
# RunPod setup script: creates a non-root user for Claude Code with --dangerously-skip-permissions

set -e

USERNAME="devuser"

# Create user if it doesn't exist
if ! id "$USERNAME" &>/dev/null; then
    useradd -m -s /bin/zsh "$USERNAME"
    echo "Created user $USERNAME"
else
    echo "User $USERNAME already exists"
fi

# Copy shell configs from root
cp /root/.zshrc /home/$USERNAME/.zshrc 2>/dev/null || true
cp /root/.bashrc /home/$USERNAME/.bashrc 2>/dev/null || true

# Copy claude config if present
if [ -d /root/.claude ]; then
    cp -r /root/.claude /home/$USERNAME/.claude
fi

# Set ownership
chown -R $USERNAME:$USERNAME /home/$USERNAME
chown -R $USERNAME:$USERNAME /workspace

echo "Setup complete. Run:"
echo "  su - $USERNAME"
echo "  cd /workspace/vllm-omni"
echo "  claude --dangerously-skip-permissions"
