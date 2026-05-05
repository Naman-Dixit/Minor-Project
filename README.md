# StegoVault: Federated Learning Driven Secure Steganography System

## Overview

This repository contains the implementation of a minor project that integrates concepts from:

* Federated Learning
* Reinforcement Learning (Q-Learning based selection)
* Deep Learning (CNN feature extraction)
* Nature-inspired Optimization (GA, GWO, PSO)
* Secure Steganography (LSB embedding with AES encryption)
* Distributed Systems (P2P communication across devices)

The project is divided into two major components:

1. **Research Pipeline (MNIST Classification System)** — 
2. **Application Layer (StegoVault System)** — real-world implementation of secure communication

---

## Part I: Research Pipeline (MNIST Federated Learning System)

### Description

This component implements a complete machine learning pipeline for handwritten digit classification using:

* Federated CNN training (FedAvg)
* Reinforcement Learning for client selection
* CNN-based feature extraction
* Wrapper feature selection using:

  * Genetic Algorithm (GA)
  * Grey Wolf Optimizer (GWO)
  * Particle Swarm Optimization (PSO)

### Pipeline Architecture

```
MNIST Dataset
    → Preprocessing
    → Federated CNN (FedAvg + RL Selection)
    → Feature Extraction (128-dim)
    → GA / GWO / PSO Feature Selection
    → Logistic Regression
    → Evaluation
```

### Key Features

* Privacy-preserving distributed learning
* Reinforcement learning-based optimization
* Multi-method comparison across 5 splits
* Explainability using SHAP

---

## Part II: StegoVault Application

### Description

StegoVault is a full-stack distributed system that enables secure hidden communication across devices using:

* AES encryption
* LSB-based steganography
* Federated Reinforcement Learning
* Peer-to-peer networking

---

## System Architecture

```
Frontend (React)
    → Flask API
        → Encoder (AES + LSB + RL)
            → TCP Transfer
                → Receiver Node
                    → Decoder (Extract + Decrypt)
                        → Output (File/Text)

Additional Systems:
- UDP Discovery (Peer Detection)
- Gossip Protocol (Federated RL)
- Metrics Server (Java)
```

---

## Tech Stack

### Machine Learning

* PyTorch
* Scikit-learn
* NumPy, Pandas

### Visualization

* Matplotlib
* Seaborn
* SHAP

### Backend

* Flask
* Python Sockets

### Frontend

* React.js

### Security

* PyCryptodome (AES)

### Image Processing

* OpenCV

### Metrics

* Java Socket Server

---

## Repository Structure

```
stego-vault/
│
├── frontend/
│   ├── src/pages/
│   │   ├── Landing.jsx
│   │   ├── Send.jsx
│   │   ├── Receive.jsx
│   │   ├── Nodes.jsx
│   │   └── About.jsx
│   └── package.json
│
├── core/
│   ├── rl_agent.py
│   ├── env.py
│
├── stego/
│   ├── encoder.py
│   ├── decoder.py
│   ├── crypto.py
│   ├── document.py
│
├── network/
│   ├── p2p_node.py
│   ├── discovery.py
│   ├── gossip_rl.py
│   ├── simulator.py
│
├── monitoring/
│   ├── logger.py
│   ├── metrics.py
│   ├── hash_utils.py
│
├── java/
│   └── MetricsServer.java
│
├── main_api.py
├── main_send.py
├── main_receive.py
├── main_simulate.py
│
├── MNIST_all_methods.ipynb
├── all_methods_results.csv
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

## Files to Upload to GitHub

### Include

* frontend/
* core/
* stego/
* network/
* monitoring/
* java/
* MNIST_all_methods.ipynb
* all_methods_results.csv
* main_api.py
* main_send.py
* main_receive.py
* main_simulate.py
* requirements.txt
* README.md
* .gitignore

### Exclude

* venv/
* node_modules/
* **pycache**/
* *.pyc
* uploads/
* received_files/
* stego.png
* indices.json

---

## Installation

### Backend Setup

```
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

---

### Frontend Setup

```
cd frontend
npm install
```

---

### Java Metrics Server

```
cd java
javac MetricsServer.java
java MetricsServer
```

---

## Running the Application

### Step 1: Start Backend API

```
python main_api.py
```

---

### Step 2: Start Receiver (Second Device)

```
python main_receive.py
```

---

### Step 3: Start Frontend

```
cd frontend
npm start
```

---

### Step 4: (Optional) Run Federated Simulation

```
python main_simulate.py
```

---

## Multi-Device Setup

* Ensure both devices are on the same network
* Use actual IP address (example: 10.x.x.x or 192.168.x.x)
* Required ports:

  * 5000 (File transfer)
  * 6000 (Federated gossip)
  * 5050 or 9999 (Discovery)

---

## Working Flow

### Encoding

1. Upload cover image
2. Upload secret file or text
3. Enter password
4. Encode using RL-based embedding
5. Send via TCP

---

### Decoding

1. Receiver accepts connection
2. Receives stego image and metadata
3. Extracts hidden bits
4. Decrypts payload
5. Reconstructs original file or message

---

## Outputs

* Text message reconstruction
* File recovery (PDF, images, etc.)
* Latency metrics
* RL reward and loss logs
* Federated updates

---

## Requirements

```
numpy
pandas
matplotlib
seaborn
scikit-learn
torch
torchvision
shap
flask
flask-cors
opencv-python
pycryptodome
requests
jupyter
```

---

## Future Work

* Internet-based communication (beyond LAN)
* Secure transport layer (TLS)
* Mobile-based receiver
* Real-time monitoring dashboard
* Payload compression for larger files
* Deep Q-Network for better RL optimization

---

## Author

Naman Dixit
B.Tech Computer Science — UPES
