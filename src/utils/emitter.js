import mitt from "mitt";

export class GlobalEmitter {
    _instance;
    static createInstance() {
        this._instance = new mitt() 
    }
    static getInstance() {
        if(!this._instance) {
            this.createInstance()
        }
        return this._instance;
    }
}