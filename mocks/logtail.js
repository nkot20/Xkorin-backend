class Logtail {
    log = jest.fn();
    info = jest.fn();
    warn = jest.fn();
    error = jest.fn();
}

module.exports = Logtail;