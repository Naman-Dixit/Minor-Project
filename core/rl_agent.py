import torch
import torch.nn as nn
import torch.optim as optim
import os

AGENT_PATH = "agent_weights.pt"

class RLAgent(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, 65),
            nn.Sigmoid()
        )
        self.optimizer = optim.Adam(self.parameters(), lr=0.001)
        self.load()

    def forward(self, x):
        return self.net(x)

    def act(self, state):
        out = self(state)
        positions = out[:64].detach().numpy()
        raw_depth = out[64].item()
        depth = int(raw_depth * 2) + 1  # maps [0,1] -> {1, 2, 3}
        return positions, depth

    def train_step(self, state, reward):
        pred = self(state)
        loss = -reward * pred.mean()
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        self.save()
        return loss.item()

    def save(self):
        torch.save(self.state_dict(), AGENT_PATH)

    def load(self):
        if os.path.exists(AGENT_PATH):
            self.load_state_dict(torch.load(AGENT_PATH, weights_only=True))
