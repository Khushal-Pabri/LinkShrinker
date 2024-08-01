require('dotenv').config();
const { format } = require('date-fns');
const ShortUniqueId = require('short-unique-id');
const axios = require('axios');
const uid = new ShortUniqueId({ length: 10 });
const URL = require('../models/url');
const RICK = require('../models/rickroll');

exports.shortUrlGenerator = async(req, res) => {
    try{
        const { originalUrl } = req.body;
        const shortId = uid.rnd();

        let urlPack = new URL(
            {
                shortId,
                redirectUrl: originalUrl,
                visitHistory: []
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
        const response = await fetch(`http://ipinfo.io/${hostIp}/json?token=process.env.IPINFO_TOKEN`);
        location = await response.json();
    } catch (err) {
        console.error('Error fetching location data:', err);
    }

    const currTimestamp = format(Date.now(), 'MMM d, yyyy HH:mm')
    const urlPack = await URL.findOneAndUpdate({
        shortId,
    },{ $push: {visitHistory:{timestamp: currTimestamp , ipAddress: hostIp, location} } } );

    if (!urlPack) 
    {
        return res.status(404).json({ error: 'URL not found' });
    }

    res.redirect(urlPack.redirectUrl);
}

exports.getAnalytics = async(req, res) => {
    const shortId = req.params.shortId;

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
}

exports.rickRoll = async(req, res) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const hostIp = ipAddress.split(',')[0].trim();
    console.log(hostIp);

    let location = {};
    try {
        const response = await fetch(`http://ipinfo.io/${hostIp}/json?token=process.env.IPINFO_TOKEN`);
        location = await response.json();
    } catch (err) {
        console.error('Error fetching location data:', err);
    }

    const currTimestamp = format(Date.now(), 'MMM d, yyyy HH:mm')
    const newCatch = new RICK({ visitHistory:{timestamp: currTimestamp , ipAddress, location} } );
    await newCatch.save();

    const rickRollBinary = '01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01100111 01101001 01110110 01100101 00100000 01111001 01101111 01110101 00100000 01110101 01110000 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01101100 01100101 01110100 00100000 01111001 01101111 01110101 00100000 01100100 01101111 01110111 01101110 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110010 01110101 01101110 00100000 01100001 01110010 01101111 01110101 01101110 01100100 00100000 01100001 01101110 01100100 00100000 01100100 01100101 01110011 01100101 01110010 01110100 00100000 01111001 01101111 01110101 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01101101 01100001 01101011 01100101 00100000 01111001 01101111 01110101 00100000 01100011 01110010 01111001 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110011 01100001 01111001 00100000 01100111 01101111 01101111 01100100 01100010 01111001 01100101 00001101 00001010 01001110 01100101 01110110 01100101 01110010 00100000 01100111 01101111 01101110 01101110 01100001 00100000 01110100 01100101 01101100 01101100 00100000 01100001 00100000 01101100 01101001 01100101 00100000 01100001 01101110 01100100 00100000 01101000 01110101 01110010 01110100 00100000 01111001 01101111 01110101'
    res.send(rickRollBinary);
}