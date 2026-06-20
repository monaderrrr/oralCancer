export const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        if (!req.body) {  // Ensure request body exists
            console.log("Validation Error: request body missing", { path: req.path, method: req.method });
            return res.status(400).json({ success: false, message: "Request body is missing" });
        }

        const schemaKeys = Object.keys(schema);  // ['body']
        const validationErrors = [];

        for (const key of schemaKeys) {
            if (!req[key]) {
                validationErrors.push({ message: `${key} is required`, path: [key] });
                continue;
            }
            const validationResult = schema[key].validate(req[key], { abortEarly: false });
            if (validationResult.error) {
                validationErrors.push(...validationResult.error.details);
            }
        }

        if (validationErrors.length) {
            console.log("Validation Error:", validationErrors);
            const firstError = validationErrors[0];
            const message = firstError?.message || "Validation error";
            return res.status(400).json({ success: false, message, errors: validationErrors });
        }
        
        next();  // Proceed to the next middleware
    };
};
