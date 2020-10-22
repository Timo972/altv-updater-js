function isBranchValid(branch) {
    if (typeof branch !== "string")
        return false
    return branch === "release" || branch === "rc" || branch === "dev"
}

function isModuleValid(module) {
    if (typeof module !== "string")
        return false
    return module === "csharp-module" || module === "js-module" || module === "server"
}

module.exports = {
    isBranchValid,
    isModuleValid
}