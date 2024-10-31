FROM ubuntu:22.04

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
    libasio-dev  # Added Asio development headers

WORKDIR /app

# Install Crow
RUN git clone https://github.com/CrowCpp/Crow.git && \
    cd Crow && \
    mkdir build && \
    cd build && \
    cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF && \
    make install

# Install nlohmann/json
RUN git clone https://github.com/nlohmann/json.git && \
    cd json && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make install

# Install standalone Asio (in case the package version isn't sufficient)
RUN git clone https://github.com/chriskohlhoff/asio.git && \
    cd asio && \
    git checkout asio-1-28-0 && \
    cp -r asio/include/* /usr/local/include/

COPY . .

RUN mkdir -p build && \
    cd build && \
    cmake .. && \
    make

CMD ["./build/crow_app"]