module.exports = {
    publicPath: '/my/',
    devServer: {
        port: 3000,
        proxy: 'http://localhost:8080'
    }
}