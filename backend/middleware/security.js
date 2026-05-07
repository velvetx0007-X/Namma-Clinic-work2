const helmet = require('helmet');
const morgan = require('morgan');

const setupSecurity = (app) => {
    // Basic security headers
    app.use(helmet());

    // Logging for development/production
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = {
    setupSecurity,
    errorHandler
};
