#include "crow.h"
#include <nlohmann/json.hpp>
#include <string>
#include <vector>
#include <unordered_map>

using json = nlohmann::json;

// Struct to store bounding box coordinates
struct BoundingBox {
    double min_lat;
    double min_lon;
    double max_lat;
    double max_lon;
};

// Struct to store graph data and path information
struct PathRequest {
    std::string start_node_id;
    std::string end_node_id;
};

// Mock storage for our data
class DataStorage {
public:
    bool loadMapData(const BoundingBox& bbox) {
        // Mock implementation - would actually fetch from Overpass API
        return true;
    }

    bool validateNodeIds(const std::string& start_id, const std::string& end_id) {
        // Mock implementation - would actually check if nodes exist in loaded data
        return true;
    }
};

int main() {
    crow::SimpleApp app;
    DataStorage storage;

    CROW_ROUTE(app, "/")([](){
        json response = {
            {"message", "Hello from Crow!"},
            {"status", "success"}
        };
        return crow::response(response.dump());
    });

    // POST /bounding-box endpoint
    CROW_ROUTE(app, "/bounding-box")
    .methods(crow::HTTPMethod::POST)
    ([&storage](const crow::request& req) {
        try {
            auto body = json::parse(req.body);
            
            // Validate required fields
            if (!body.contains("min_lat") || !body.contains("min_lon") ||
                !body.contains("max_lat") || !body.contains("max_lon")) {
                return crow::response(400, "Missing required coordinates");
            }

            // Create bounding box from request
            BoundingBox bbox {
                body["min_lat"].get<double>(),
                body["min_lon"].get<double>(),
                body["max_lat"].get<double>(),
                body["max_lon"].get<double>()
            };

            // Validate coordinates
            if (bbox.min_lat > bbox.max_lat || bbox.min_lon > bbox.max_lon) {
                return crow::response(400, "Invalid coordinate ranges");
            }

            // Try to load map data
            bool success = storage.loadMapData(bbox);
            
            if (!success) {
                return crow::response(500, "Failed to load map data");
            }

            json response = {
                {"status", "success"},
                {"message", "Map data loaded successfully"},
                {"bounds", {
                    {"min_lat", bbox.min_lat},
                    {"min_lon", bbox.min_lon},
                    {"max_lat", bbox.max_lat},
                    {"max_lon", bbox.max_lon}
                }}
            };

            return crow::response(200, response.dump());
        }
        catch (const json::exception& e) {
            return crow::response(400, "Invalid JSON format");
        }
        catch (const std::exception& e) {
            return crow::response(500, e.what());
        }
    });

    // POST /start-dijkstra endpoint
    CROW_ROUTE(app, "/start-dijkstra")
    .methods(crow::HTTPMethod::POST)
    ([&storage](const crow::request& req) {
        try {
            auto body = json::parse(req.body);
            
            // Validate required fields
            if (!body.contains("start_node_id") || !body.contains("end_node_id")) {
                return crow::response(400, "Missing start or end node ID");
            }

            PathRequest path_req {
                body["start_node_id"].get<std::string>(),
                body["end_node_id"].get<std::string>()
            };

            // Validate node IDs
            if (!storage.validateNodeIds(path_req.start_node_id, path_req.end_node_id)) {
                return crow::response(400, "Invalid node ID(s)");
            }

            // In a real implementation, this would initiate the WebSocket connection
            // and start the Dijkstra algorithm
            json response = {
                {"status", "success"},
                {"message", "Pathfinding initiated"},
                {"websocket_url", "ws://localhost:8080/exploration"},
                {"request_id", "unique-request-id"}, // Would generate unique ID
                {"start_node", path_req.start_node_id},
                {"end_node", path_req.end_node_id}
            };

            return crow::response(200, response.dump());
        }
        catch (const json::exception& e) {
            return crow::response(400, "Invalid JSON format");
        }
        catch (const std::exception& e) {
            return crow::response(500, e.what());
        }
    });

    // Configure and run the application
    app.port(8080)
        .multithreaded()
        .run();

    return 0;
}