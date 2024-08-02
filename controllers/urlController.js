require('dotenv').config();
const { format } = require('date-fns');
const { toZonedTime } = require('date-fns-tz')
const timeZone = 'Asia/Kolkata';
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId({ length: 10 });
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');

const URL = require('../models/url');
const RICK = require('../models/rickroll');
const USER = require('../models/user');

exports.shortUrlGenerator = async(req, res) => {
    try{
        const { originalUrl, customAlias } = req.body;
        const shortId = customAlias || uid.rnd();

        if (shortId) {
            const existingUrl = await URL.findOne({ shortId });
            if (existingUrl) {
                return res.status(400).json({ error: 'This shortId already exists' });
            }
        }

        let user = null;
        // If user provided
        const { username, password } = req.body;
        if(username && password)
        {
            user = await USER.findOne({ username });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        let urlPack = new URL(
            {
                shortId,
                redirectUrl: originalUrl,
                visitHistory: [],
                user: user? user._id : null
            }
        )

        await urlPack.save();
        await res.json(urlPack)
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Failed to generate URL'});
    }
}

exports.redirectUrl = async(req, res) => {
    const shortId = req.params.shortId;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const hostIp = ipAddress.split(',')[0].trim();
    console.log(hostIp);

    let location = {};
    try {
        const response = await fetch(`http://ipinfo.io/${hostIp}/json?token=${process.env.IPINFO_TOKEN}`);
        location = await response.json();
    } catch (err) {
        console.error('Error fetching location data:', err);
    }

    try
    {
        const currentTime = new Date();
        const zonedTime = toZonedTime(currentTime, timeZone);
        const currTimestamp = format(zonedTime, 'MMM d, yyyy HH:mm')
        const urlPack = await URL.findOneAndUpdate({
            shortId,
        },{ $push: {visitHistory:{timestamp: currTimestamp , ipAddress: hostIp, location} } } );

        if (!urlPack) 
        {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.redirect(urlPack.redirectUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to redirect URL' });
    }
}

exports.getAnalytics = async(req, res) => {
    const shortId = req.params.shortId;

    try
    {
        const urlPack = await URL.findOne({shortId});

        if(!urlPack){
            return res.status(404).json({error: 'URL not found'});
        }

        const analytics = {
            totalVisits: urlPack.visitHistory.length,
            // lastVisit: format(urlPack.visitHistory[urlPack.visitHistory.length - 1].timestamp, 'MMM d, yyyy HH:mm')
            analytics: urlPack.visitHistory
        }

        res.json(analytics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
}

exports.rickRoll = async(req, res) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const hostIp = ipAddress.split(',')[0].trim();
    console.log(hostIp);

    let location = {};
    try {
        const response = await fetch(`http://ipinfo.io/${hostIp}/json?token=${process.env.IPINFO_TOKEN}`);
        location = await response.json();
    } catch (err) {
        console.error('Error fetching location data:', err);
    }

    try
    {
        const currentTime = new Date();
        const zonedTime = toZonedTime(currentTime, timeZone);
        const currTimestamp = format(zonedTime, 'MMM d, yyyy HH:mm')
        const newCatch = new RICK({ visitHistory:{timestamp: currTimestamp , ipAddress:hostIp, location} } );
        await newCatch.save();

        const rickRollBinary = '01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01100111 01101001 01110110 01100101 00100000 01111001 01101111 01110101 00100000 01110101 01110000 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01101100 01100101 01110100 00100000 01111001 01101111 01110101 00100000 01100100 01101111 01110111 01101110 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110010 01110101 01101110 00100000 01100001 01110010 01101111 01110101 01101110 01100100 00100000 01100001 01101110 01100100 00100000 01100100 01100101 01110011 01100101 01110010 01110100 00100000 01111001 01101111 01110101 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01101101 01100001 01101011 01100101 00100000 01111001 01101111 01110101 00100000 01100011 01110010 01111001 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110011 01100001 01111001 00100000 01100111 01101111 01101111 01100100 01100010 01111001 01100101 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110100 01100101 01101100 01101100 00100000 01100001 00100000 01101100 01101001 01100101 00100000 01100001 01101110 01100100 00100000 01101000 01110101 01110010 01110100 00100000 01111001 01101111 01110101'
        res.send(rickRollBinary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while getting Rick Rolled' });
    }
}

exports.deleteUrl = async(req, res) => {
    const { username, password } = req.body;
    const shortId = req.params.shortId;

    try
    {
        // If user provided
        if(username && password)
            {
                user = await USER.findOne({ username });
                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
        
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
        
                const urlPack = await URL.findOneAndDelete({ shortId, user: user._id });
                if (!urlPack) {
                    return res.status(404).json({ error: 'URL not found or not owned by user' });
                }
        
                return res.json({ message: 'URL deleted successfully' });
            }
            else
            {
                const urlPack = await URL.findOneAndDelete({ shortId, user: null });
                if (!urlPack) {
                    return res.status(404).json({ error: 'URL not found or owned by a user' });
                }
        
                return res.json({ message: 'URL deleted successfully' });
            }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while deleting URL' });
    }
}

exports.generateQRCode = async (req, res) => {
    try {
        const { shortId } = req.params;

        const urlPack = await URL.findOne({ shortId });

        if (!urlPack) {
            return res.status(404).json({ error: 'URL not found' });
        }

        const qrCode = await QRCode.toDataURL(`${req.protocol}://${req.get('host')}/url/${shortId}`);

        res.send(`<img src="${qrCode}" alt="QR Code"/>`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
};