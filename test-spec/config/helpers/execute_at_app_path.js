const path = require('path');

require.main.require = function (pathName) {
    //path to root app:
    const newPath = path.join(__dirname, '../', pathName);
    console.log('test execution path', newPath);
    return require(newPath);
}