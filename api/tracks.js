module.exports = (req, res) => {
    res.json({
        body: "hola",
        query: req.query,
        cookies: req.cookies
    })
}