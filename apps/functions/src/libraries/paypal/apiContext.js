const { default: axios } = require("axios");

const SANDBOX_URL = "https://api-m.sandbox.paypal.com/v1";
const LIVE_URL = "https://api-m.paypal.com/v1";


exports.default = class ApiContext {
    constructor(options) {
        this.client_id = options.client_id;
        this.secret = options.secret;
        this.live = options.live;
        this.tokenType = "";
        this.accessToken = ""
    }

    async getAccessToken() {
        const url =  this.live ? LIVE_URL : SANDBOX_URL;
        const basicAuthString = 'Basic ' + Buffer.from(this.client_id + ':' + this.secret).toString('base64');
        const { data } = await axios({
            method: 'post',
            url: `${url}/oauth2/token`, 
            data: "grant_type=client_credentials", 
            headers: {
                'Authorization': basicAuthString,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }).catch((e) => {
            return e;
        });

        return data;
    }

    setTokens(data) {
        if (data && data.access_token) {
            this.accessToken = data.access_token;
            this.tokenType =  "Bearer";
        }
    }

    async initClient() {
        this.setTokens(await this.getAccessToken());

        return axios.create({
            baseURL: SANDBOX_URL,
            headers:  {
                "Authorization": `${this.tokenType} ${this.accessToken}`
            }
        })
    }
}
