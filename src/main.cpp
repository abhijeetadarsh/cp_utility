#include <CLI/CLI.hpp>
#include <cpr/cpr.h>
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

using json = nlohmann::json;

void test_nlohmann_json()
{
    json j;
    j["name"] = "John";
    j["age"] = 30;
    j["city"] = "New York";
    std::cout << j.dump(4) << std::endl;
}

void test_cpr()
{
    cpr::Response r = cpr::Get(cpr::Url{"https://api.github.com/repos/whoshuu/cpr/contributors"},
                               cpr::Authentication{"user", "pass", cpr::AuthMode::BASIC},
                               cpr::Parameters{{"anon", "true"}, {"key", "value"}});

    std::cout << r.status_code << std::endl;
    std::cout << r.header["content-type"] << std::endl;

    json j = json::parse(r.text);
    std::cout << j.dump(4) << std::endl;
}

void test_spdlog()
{
    spdlog::info("Welcome to spdlog!");
    spdlog::error("Some error message with arg: {}", 1);

    spdlog::warn("Easy padding in numbers like {:08d}", 12);
    spdlog::critical("Support for int: {0:d};  hex: {0:x};  oct: {0:o}; bin: {0:b}", 42);
    spdlog::info("Support for floats {:03.2f}", 1.23456);
    spdlog::info("Positional args are {1} {0}..", "too", "supported");
    spdlog::info("{:<30}", "left aligned");

    spdlog::set_level(spdlog::level::debug); // Set *global* log level to debug
    spdlog::debug("This message should be displayed..");

    // change log pattern
    spdlog::set_pattern("[%H:%M:%S %z] [%n] [%^---%L---%$] [thread %t] %v");

    // Compile time log levels
    // Note that this does not change the current log level, it will only
    // remove (depending on SPDLOG_ACTIVE_LEVEL) the call on the release code.
    SPDLOG_TRACE("Some trace message with param {}", 42);
    SPDLOG_DEBUG("Some debug message");
}

int main(int argc, char **argv)
{
    CLI::App app{"CP UTILITY Description"};

    app.add_subcommand("test_nlohmann_json", "Test nlohmann_json")->callback(test_nlohmann_json);
    app.add_subcommand("test_cpr", "Test cpr")->callback(test_cpr);
    app.add_subcommand("test_spdlog", "Test spdlog")->callback(test_spdlog);

    CLI11_PARSE(app, argc, argv);
    return 0;
}
