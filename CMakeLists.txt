cmake_minimum_required(VERSION 3.21)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

project(cu)

set(SRC_DIR ${CMAKE_SOURCE_DIR}/src)
set(INC_DIR ${CMAKE_SOURCE_DIR}/include)

add_executable(cu ${SRC_DIR}/main.cpp)

find_package(cpr CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cli11 CONFIG REQUIRED)

target_include_directories(cu PRIVATE ${INC_DIR})

target_link_libraries(cu PRIVATE
	cpr::cpr
	nlohmann_json::nlohmann_json
	CLI11::CLI11
)
