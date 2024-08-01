const mongoose = require('mongoose');
const rickRollSchema = new mongoose.Schema({
    visitHistory:
        {
            timestamp: { type: String },
            ipAddress: { type: String },
            location: {
                city: { type: String },
                region: { type: String },
                country: { type: String },
                loc: { type: String },
                org: { type: String },
                postal: { type: String },
                timezone: { type: String }
            }
        }
},
{
    timestamps: true
});

module.exports = mongoose.model('rickrolls', rickRollSchema);
