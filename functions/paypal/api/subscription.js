
const ENDPOINT = "billing/subscriptions";

exports.default =  class Subscription {
    construct(apiContext)
    {
        this.apiContext = apiContext;
        this.endpoint = ENDPOINT;
    }


    get(id) {
        return this.apiContext.request('GET', `${this.endpoint}/${id}`);
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
        return $this->get($id);
    }

    cancel(id) {
        this.apiContext.request('POST', `${this.endpoint}/${id}/cancel`, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return this.get(id);
    }

    transactions(id, params = "start_time=2018-01-21T07:50:20.940Z&end_time=2018-08-21T07:50:20.940Z") {
        const url = `${this.endpoint}/${id}/transactions?${params}`;
        return this.apiContext.get(url);        
    }

}
