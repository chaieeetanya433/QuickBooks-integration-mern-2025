
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Handle MongoDB duplicate key errors
    if (err.name === 'MongoServerError' && err.code === 11000) {
        return res.status(409).json({
            status: 'error',
            message: 'Duplicate record found',
            details: err.message
        });
    }

    // Handle token expiration
    if (err.name === 'UnauthorizedError' ||
        (err.response && err.response.status === 401)) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication token expired or invalid',
            action: 'Please re-authenticate',
            authUrl: '/auth'
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'An unexpected error occurred',
        errorId: Date.now().toString()
    });
}

module.exports = errorHandler