module.exports = (req, res) => {
    req.json({
        body: "hola",
        query: req.query,
        cookies: req.cookies
    })
}