first install vcpkg, msys2
then install gcc, cmake, ninja using msys2
one of these must be set

VCPKG_DEFAULT_HOST_TRIPLET=x64-mingw-dynamic 
if you want dll in your project

VCPKG_DEFAULT_HOST_TRIPLET=x64-mingw-static 

cmake --preset=default 
cmake --build build 