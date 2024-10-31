cmake_minimum_required(VERSION 3.10)
project(crow_app)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add include directories for Asio
include_directories(/usr/local/include)

find_package(Crow REQUIRED)
find_package(nlohmann_json REQUIRED)

add_executable(crow_app main.cpp)

target_link_libraries(crow_app PRIVATE 
    Crow::Crow
    nlohmann_json::nlohmann_json
    pthread
)

# Define ASIO_STANDALONE since we're using standalone Asio
target_compile_definitions(crow_app PRIVATE ASIO_STANDALONE)