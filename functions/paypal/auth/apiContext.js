const { default: axios } = require("axios");

const SANDBOX_URL = "https://api-m.sandbox.paypal.com/v1/";
const LIVE_URL = "https://api-m.paypal.com/v1/";
const GRAND_TYPE = "client_credentials";


exports.default = class ApiContext {

    constructor(options) {
        this.client_id = options.client_id;
        this.secret = options.secret;
        this.client = this.initClient();
    }

    async getAccessToken() {
        const url =  options.live ? LIVE_URL : SANDBOX_URL;
        
        const { data } = await axios.post(`${url}/oauth2/token`, {
            "Auth": [this.client_id, $this->secret],
            'form_params': {
                'grant_type': GRAND_TYPE
            }
        });

        return data;
    }

    setTokens(data) {
        this.accessToken = data.access_token;
        this.tokenType =  "Bearer";
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
