const { DateTime } = require("luxon");
const ENDPOINT = "billing/subscriptions";

exports.default = class Subscription {
    constructor(apiContext) {
        this.apiContext = apiContext;
        this.endpoint = ENDPOINT;
    }

    suspend(id) {
        this.apiContext.request('POST', `${this.endpoint}/${id}/suspend`, {
            headers:{
                "Content-Type": "application/json"
            }
        });

        return this.get(id);
    }

    reactivate(id) {
        this.apiContext.request('POST', `${this.endpoint}/${id}/activate`, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return this.get($id);
    }

    async cancel(id) {
        const client = await this.apiContext.initClient();
        return client({
            method: 'POST', 
            url: `${this.endpoint}/${id}/cancel`, 
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    async get(id) {
        const client = await this.apiContext.initClient();
        const url = `${this.endpoint}/${id}`;
        return client.get(url);        
    }

    async transactions(id, initialParams) {
        const client = await this.apiContext.initClient();
        const params = `start_time=2018-01-21T07:50:20.940Z&end_time=${DateTime.now().toISO()}`
        const url = `${this.endpoint}/${id}/transactions?${params}`;
        const { data } = await client.get(url);
        return data.transactions;        
    }
}