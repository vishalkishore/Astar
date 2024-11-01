# Backend Dockerfile
FROM ubuntu:22.04 AS builder

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install essential packages
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libboost-all-dev \
    libssl-dev \
    zlib1g-dev \
    python3 \
    curl \
    pkg-config \
    libasio-dev \
    && rm -rf /var/lib/apt/lists/*  # Clean up apt cache

WORKDIR /deps

# Install Crow
RUN git clone --depth=1 https://github.com/CrowCpp/Crow.git && \
    cd Crow && \
    mkdir build && \
    cd build && \
    cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF && \
    make install

# Install nlohmann/json
RUN git clone --depth=1 https://github.com/nlohmann/json.git && \
    cd json && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make install

# Install standalone Asio
RUN git clone --depth=1 -b asio-1-28-0 https://github.com/chriskohlhoff/asio.git && \
    cd asio && \
    cp -r asio/include/* /usr/local/include/

# Development stage
FROM ubuntu:22.04 AS development

# Install runtime dependencies and development tools
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libssl-dev \
    zlib1g-dev \
    python3 \
    inotify-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy installed dependencies from builder
COPY --from=builder /usr/local/include /usr/local/include
COPY --from=builder /usr/local/lib /usr/local/lib
COPY --from=builder /usr/local/share /usr/local/share

WORKDIR /app

# Copy the hot reload script into the container
COPY hot_reload.sh /app/hot_reload.sh
RUN chmod +x /app/hot_reload.sh

CMD ["sh", "/app/hot_reload.sh"]
