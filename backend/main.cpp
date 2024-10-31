#include "crow.h"
#include <nlohmann/json.hpp>

using json = nlohmann::json;

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        json response = {
            {"message", "Hello from Crow!"},
            {"status", "success"}
        };
        return crow::response(response.dump());
    });

    CROW_ROUTE(app, "/api/test").methods(crow::HTTPMethod::GET)([](){
        json response = {
            {"data", {1, 2, 3, 4, 5}},
            {"status", "success"}
        };
        return crow::response(response.dump());
    });

    app.port(8080)
        .multithreaded()
        .run();

    return 0;
}